<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'bio',
        'avatar',
        'timezone',
        'locale',
        'onboarding_completed_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function streaks(): HasMany
    {
        return $this->hasMany(Streak::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function conversationMemberships(): HasMany
    {
        return $this->hasMany(ConversationMember::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    public function dailyQuestCompletions(): HasMany
    {
        return $this->hasMany(DailyQuestCompletion::class);
    }

    public function userAchievements(): HasMany
    {
        return $this->hasMany(UserAchievement::class);
    }

    public function friendships(): HasMany
    {
        return $this->hasMany(Friendship::class);
    }

    public function ownedSharedMemories(): HasMany
    {
        return $this->hasMany(SharedMemory::class, 'owner_id');
    }

    public function sharedMemoryMemberships(): HasMany
    {
        return $this->hasMany(SharedMemoryParticipant::class);
    }

    public function ownedDuoStreaks(): HasMany
    {
        return $this->hasMany(DuoStreak::class, 'created_by');
    }

    public function duoStreakMemberships(): HasMany
    {
        return $this->hasMany(DuoStreakMember::class);
    }

    public function ownedGroupChallenges(): HasMany
    {
        return $this->hasMany(GroupChallenge::class, 'created_by');
    }

    public function groupChallengeMemberships(): HasMany
    {
        return $this->hasMany(GroupChallengeMember::class);
    }
}
