<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReminderDelivery extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = ['reminder_id', 'reminder_date', 'delivered_at'];

    protected function casts(): array
    {
        return ['reminder_date' => 'date', 'delivered_at' => 'datetime'];
    }

    public function reminder(): BelongsTo
    {
        return $this->belongsTo(Reminder::class);
    }
}
