<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DuoStreakReminder extends Model
{
    protected $fillable = ['duo_streak_id', 'from_user_id', 'to_user_id', 'date'];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function duoStreak(): BelongsTo
    {
        return $this->belongsTo(DuoStreak::class);
    }
}
