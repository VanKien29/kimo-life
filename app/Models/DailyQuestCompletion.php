<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyQuestCompletion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'quest_key',
        'quest_date',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'quest_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
