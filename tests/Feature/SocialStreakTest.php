<?php

namespace Tests\Feature;

use App\Models\DuoStreak;
use App\Models\DuoStreakMember;
use App\Models\Friendship;
use App\Models\GroupChallenge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialStreakTest extends TestCase
{
    use RefreshDatabase;

    public function test_duo_streak_only_advances_when_both_members_check_in(): void
    {
        [$owner, $friend] = $this->friends();

        $this->actingAs($owner)->post(route('duo-streaks.store'), ['name' => 'Coding Together', 'friend_id' => $friend->id])->assertRedirect(route('together', absolute: false));
        $duo = DuoStreak::query()->firstOrFail();

        $this->actingAs($owner)->post(route('duo-streaks.check-in', $duo))->assertRedirect();
        $this->assertSame(0, $duo->fresh()->current_streak);

        $this->actingAs($friend)->post(route('duo-streaks.check-in', $duo))->assertRedirect();
        $this->assertSame(1, $duo->fresh()->current_streak);
        $this->assertDatabaseCount('duo_streak_logs', 2);
    }

    public function test_duo_streak_reminder_is_limited_to_once_per_sender_and_day(): void
    {
        [$owner, $friend] = $this->friends();
        $duo = DuoStreak::factory()->create(['created_by' => $owner->id]);
        DuoStreakMember::query()->create(['duo_streak_id' => $duo->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'accepted']);
        DuoStreakMember::query()->create(['duo_streak_id' => $duo->id, 'user_id' => $friend->id, 'role' => 'member', 'status' => 'accepted']);

        $this->actingAs($owner)->post(route('duo-streaks.remind', $duo), ['to_user_id' => $friend->id])->assertRedirect();
        $this->actingAs($owner)->post(route('duo-streaks.remind', $duo), ['to_user_id' => $friend->id])->assertRedirect();
        $this->assertDatabaseCount('duo_streak_reminders', 1);
    }

    public function test_group_challenge_tracks_each_member_without_exposing_it_to_strangers(): void
    {
        [$owner, $friend] = $this->friends();
        $stranger = User::factory()->create();

        $this->actingAs($owner)->post(route('group-challenges.store'), [
            'name' => '30 ngày đọc sách',
            'goal' => 30,
            'duration' => 30,
            'friend_ids' => [$friend->id],
        ])->assertRedirect(route('together', absolute: false));
        $challenge = GroupChallenge::query()->firstOrFail();

        $this->assertDatabaseHas('group_challenge_members', ['group_challenge_id' => $challenge->id, 'user_id' => $friend->id, 'status' => 'pending']);
        $this->actingAs($friend)->patch(route('group-challenge-invitations.accept', $challenge->members()->where('user_id', $friend->id)->value('id')))->assertRedirect();
        $this->actingAs($owner)->post(route('group-challenges.check-in', $challenge))->assertRedirect();
        $this->actingAs($stranger)->post(route('group-challenges.check-in', $challenge))->assertForbidden();

        $this->assertDatabaseHas('group_challenge_logs', ['group_challenge_id' => $challenge->id, 'user_id' => $owner->id]);
        $this->assertDatabaseHas('group_challenge_members', ['group_challenge_id' => $challenge->id, 'user_id' => $friend->id, 'status' => 'accepted']);
    }

    /** @return array{0: User, 1: User} */
    private function friends(): array
    {
        $owner = User::factory()->create();
        $friend = User::factory()->create();
        Friendship::factory()->for($owner, 'user')->for($friend, 'friend')->accepted()->create();

        return [$owner, $friend];
    }
}
