<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedMemoryReaction extends Model
{
    protected $fillable = [
        'shared_memory_id',
        'user_id',
        'reaction',
    ];

    public function sharedMemory(): BelongsTo
    {
        return $this->belongsTo(SharedMemory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
