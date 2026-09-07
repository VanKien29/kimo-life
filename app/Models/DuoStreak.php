<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DuoStreak extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'activity_id',
        'created_by',
        'frequency',
        'start_date',
        'current_streak',
        'best_streak',
        'status',
    ];

    protected function casts(): array
    {
        return ['start_date' => 'date'];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(DuoStreakMember::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DuoStreakLog::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(DuoStreakReminder::class);
    }
}
