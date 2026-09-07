<?php

namespace App\Services;

use App\Models\AppNotification;

class AppNotificationService
{
    /** @param array<string, mixed> $data */
    public function send(int $recipientId, string $type, ?int $actorId = null, array $data = []): ?AppNotification
    {
        if ($actorId !== null && $recipientId === $actorId) {
            return null;
        }

        return AppNotification::query()->create([
            'user_id' => $recipientId,
            'type' => $type,
            'actor_id' => $actorId,
            'data' => $data,
        ]);
    }
}
