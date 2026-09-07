<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemoryPhoto extends Model
{
    protected $fillable = [
        'path',
        'thumbnail_path',
        'width',
        'height',
        'position',
    ];

    public function memory(): BelongsTo
    {
        return $this->belongsTo(Memory::class);
    }
}
