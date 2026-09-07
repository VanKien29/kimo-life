<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Streak extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'name',
        'icon',
        'color',
        'goal_type',
        'frequency',
        'start_date',
        'active',
        'current_streak',
        'best_streak',
    ];

    protected function casts(): array
    {
        return [
            'frequency' => 'array',
            'start_date' => 'date',
            'active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(StreakLog::class)->orderBy('date');
    }
}
