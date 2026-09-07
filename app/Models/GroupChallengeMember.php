<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupChallengeMember extends Model
{
    protected $fillable = ['group_challenge_id', 'user_id', 'role', 'status'];

    public function groupChallenge(): BelongsTo
    {
        return $this->belongsTo(GroupChallenge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
