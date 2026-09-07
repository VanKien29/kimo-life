<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StreakLog extends Model
{
    protected $fillable = [
        'date',
        'completed',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'completed' => 'boolean',
        ];
    }

    public function streak(): BelongsTo
    {
        return $this->belongsTo(Streak::class);
    }
}
