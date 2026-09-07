<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupChallengeLog extends Model
{
    protected $fillable = ['group_challenge_id', 'user_id', 'date', 'completed'];

    protected function casts(): array
    {
        return ['date' => 'date', 'completed' => 'boolean'];
    }

    public function groupChallenge(): BelongsTo
    {
        return $this->belongsTo(GroupChallenge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(GroupChallengePhoto::class);
    }
}
