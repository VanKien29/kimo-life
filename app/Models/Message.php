<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'sender_id', 'body', 'image_path', 'shared_memory_id', 'memory_id'];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function sharedMemory(): BelongsTo
    {
        return $this->belongsTo(SharedMemory::class);
    }

    public function memory(): BelongsTo
    {
        return $this->belongsTo(Memory::class);
    }
}
