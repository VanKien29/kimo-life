<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedMemoryParticipant extends Model
{
    protected $table = 'shared_memory_users';

    protected $fillable = [
        'shared_memory_id',
        'user_id',
        'role',
        'status',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function sharedMemory(): BelongsTo
    {
        return $this->belongsTo(SharedMemory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
