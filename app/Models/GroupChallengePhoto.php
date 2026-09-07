<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupChallengePhoto extends Model
{
    protected $fillable = [
        'group_challenge_id',
        'group_challenge_log_id',
        'user_id',
        'date',
        'path',
        'thumbnail_path',
        'width',
        'height',
        'position',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(GroupChallenge::class, 'group_challenge_id');
    }

    public function log(): BelongsTo
    {
        return $this->belongsTo(GroupChallengeLog::class, 'group_challenge_log_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
