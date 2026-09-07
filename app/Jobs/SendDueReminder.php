<?php

namespace App\Jobs;

use App\Models\Reminder;
use App\Services\AppNotificationService;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class SendDueReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Reminder $reminder) {}

    public function handle(AppNotificationService $notifications): void
    {
        $reminder = $this->reminder->fresh();

        if (! $reminder || ! $reminder->enabled) {
            return;
        }

        $now = CarbonImmutable::now($reminder->timezone);
        $date = $now->toDateString();
        $day = $now->dayOfWeekIso;
        $time = substr((string) $reminder->time, 0, 5);

        if (! in_array($day, $reminder->days_of_week ?? [], true) || $time !== $now->format('H:i')) {
            return;
        }

        $created = DB::table('reminder_deliveries')->insertOrIgnore([
            'reminder_id' => $reminder->id,
            'reminder_date' => $date,
            'delivered_at' => now(),
        ]);

        if ($created === 0) {
            return;
        }

        $notifications->send($reminder->user_id, 'reminder', null, [
            'title' => $reminder->title,
            'message' => $this->messageFor($reminder),
            'url' => route('reminders.index'),
            'reminder_id' => $reminder->id,
        ]);
    }

    private function messageFor(Reminder $reminder): string
    {
        return match ($reminder->type) {
            'daily_memory' => 'Một khoảnh khắc nhỏ trước khi ngày kết thúc?',
            'habit' => 'Một bước nhỏ cho điều bạn đang theo đuổi.',
            'streak' => '🔥 Chuỗi của bạn vẫn đang chờ.',
            'duo_streak' => 'Còn một bước nữa để giữ chuỗi hôm nay.',
            'weekly_recap' => 'Cùng nhìn lại những điều đẹp trong tuần này nhé.',
            'monthly_recap' => 'Một tháng của bạn có nhiều điều đáng nhớ.',
            default => 'Một lời nhắc nhẹ nhàng dành cho bạn.',
        };
    }
}
