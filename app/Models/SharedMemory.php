<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SharedMemory extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'memory_date',
        'owner_id',
    ];

    protected function casts(): array
    {
        return [
            'memory_date' => 'date',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(SharedMemoryParticipant::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(SharedMemoryPhoto::class)->orderBy('position');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(SharedMemoryNote::class)->latest();
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(SharedMemoryReaction::class);
    }
}
