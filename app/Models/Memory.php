<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Memory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'memory_date',
        'mood',
        'visibility',
        'location',
    ];

    protected function casts(): array
    {
        return [
            'memory_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MemoryPhoto::class)->orderBy('position');
    }

    public function activities(): BelongsToMany
    {
        return $this->belongsToMany(Activity::class, 'memory_activity');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'memory_tag');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MemoryReaction::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(MemoryComment::class);
    }
}
