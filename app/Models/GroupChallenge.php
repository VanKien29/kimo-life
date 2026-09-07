<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupChallenge extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'goal', 'duration', 'start_date', 'end_date', 'created_by', 'status'];

    protected function casts(): array
    {
        return ['start_date' => 'date', 'end_date' => 'date'];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupChallengeMember::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(GroupChallengeLog::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(GroupChallengePhoto::class);
    }
}
