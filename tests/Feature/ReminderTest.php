<?php

namespace Tests\Feature;

use App\Jobs\SendDueReminder;
use App\Models\Reminder;
use App\Models\User;
use App\Services\AppNotificationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_update_toggle_and_delete_a_reminder(): void
    {
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);

        $this->actingAs($user)->post(route('reminders.store'), [
            'type' => 'daily_memory',
            'title' => 'Khoảnh khắc buổi tối',
            'time' => '21:30',
            'days_of_week' => [1, 3, 5],
        ])->assertRedirect();
        $reminder = Reminder::query()->firstOrFail();
        $this->assertSame([1, 3, 5], $reminder->days_of_week);
        $this->assertSame('Asia/Ho_Chi_Minh', $reminder->timezone);

        $this->actingAs($user)->patch(route('reminders.update', $reminder), [
            'type' => 'streak',
            'title' => 'Giữ nhịp nhỏ',
            'time' => '20:00',
            'days_of_week' => range(1, 7),
            'timezone' => 'UTC',
        ])->assertRedirect();
        $this->assertSame('streak', $reminder->fresh()->type);
        $this->assertSame('UTC', $reminder->fresh()->timezone);

        $this->actingAs($user)->patch(route('reminders.toggle', $reminder))->assertRedirect();
        $this->assertFalse($reminder->fresh()->enabled);
        $this->actingAs($user)->delete(route('reminders.destroy', $reminder))->assertRedirect();
        $this->assertDatabaseMissing('reminders', ['id' => $reminder->id]);
    }

    public function test_reminder_settings_are_private(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $reminder = Reminder::query()->create([
            'user_id' => $owner->id,
            'type' => 'habit',
            'title' => 'Đọc sách',
            'time' => '20:00',
            'days_of_week' => [1, 2, 3, 4, 5],
            'timezone' => 'UTC',
            'enabled' => true,
            'payload' => [],
        ]);

        $this->actingAs($stranger)->patch(route('reminders.toggle', $reminder))->assertForbidden();
        $this->actingAs($stranger)->delete(route('reminders.destroy', $reminder))->assertForbidden();
    }

    public function test_scheduler_queues_only_due_reminders(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-06 21:30:00', 'Asia/Ho_Chi_Minh'));
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $due = Reminder::query()->create($this->reminderAttributes($user, '21:30', [7]));
        Reminder::query()->create($this->reminderAttributes($user, '20:00', [7]));
        Queue::fake();

        $this->artisan('reminders:send-due')->assertSuccessful();
        Queue::assertPushed(SendDueReminder::class, fn (SendDueReminder $job) => $job->reminder->id === $due->id);
        Queue::assertPushed(SendDueReminder::class, 1);
        Carbon::setTestNow();
    }

    public function test_due_reminder_is_idempotent_when_a_job_is_retried(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-09-06 21:30:00', 'Asia/Ho_Chi_Minh'));
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);
        $reminder = Reminder::query()->create($this->reminderAttributes($user, '21:30', [7]));

        (new SendDueReminder($reminder))->handle(app(AppNotificationService::class));
        (new SendDueReminder($reminder))->handle(app(AppNotificationService::class));

        $this->assertDatabaseCount('reminder_deliveries', 1);
        $this->assertDatabaseHas('notifications', ['user_id' => $user->id, 'type' => 'reminder']);
        $this->assertDatabaseCount('notifications', 1);
        Carbon::setTestNow();
    }

    /** @return array<string, mixed> */
    private function reminderAttributes(User $user, string $time, array $days): array
    {
        return [
            'user_id' => $user->id,
            'type' => 'daily_memory',
            'title' => 'Khoảnh khắc mỗi ngày',
            'time' => $time,
            'days_of_week' => $days,
            'timezone' => $user->timezone,
            'enabled' => true,
            'payload' => [],
        ];
    }
}
