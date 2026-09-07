<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DuoStreakLog extends Model
{
    protected $fillable = ['duo_streak_id', 'date', 'user_id', 'completed'];

    protected function casts(): array
    {
        return ['date' => 'date', 'completed' => 'boolean'];
    }

    public function duoStreak(): BelongsTo
    {
        return $this->belongsTo(DuoStreak::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
