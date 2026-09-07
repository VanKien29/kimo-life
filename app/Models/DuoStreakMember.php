<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DuoStreakMember extends Model
{
    protected $fillable = ['duo_streak_id', 'user_id', 'role', 'status'];

    public function duoStreak(): BelongsTo
    {
        return $this->belongsTo(DuoStreak::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
