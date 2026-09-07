<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedMemoryPhoto extends Model
{
    protected $fillable = [
        'shared_memory_id',
        'uploaded_by',
        'path',
        'thumbnail_path',
        'width',
        'height',
        'position',
    ];

    public function sharedMemory(): BelongsTo
    {
        return $this->belongsTo(SharedMemory::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
