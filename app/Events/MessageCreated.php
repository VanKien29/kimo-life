<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversations.'.$this->message->conversation_id)];
    }

    public function broadcastAs(): string
    {
        return 'newMessage';
    }

    /** @return array<string, mixed> */
    public function broadcastWith(): array
    {
        return ['message' => $this->messageData()];
    }

    /** @return array<string, mixed> */
    public function messageData(): array
    {
        $message = $this->message;
        $memory = $message->memory;
        $memoryPhoto = $memory?->photos?->first();
        $memoryPhotoPath = $memoryPhoto?->thumbnail_path ?: $memoryPhoto?->path;
        $memoryPhotoUrl = $memoryPhotoPath ? Storage::disk(config('kimo.photos.disk', 'public'))->url($memoryPhotoPath) : null;
        if ($memoryPhotoUrl && config('kimo.photos.disk', 'public') === 'public') {
            $memoryPhotoUrl = parse_url($memoryPhotoUrl, PHP_URL_PATH) ?: $memoryPhotoUrl;
        }

        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'body' => $message->body,
            'image_url' => $message->image_path ? Storage::disk(config('kimo.photos.disk', 'public'))->url($message->image_path) : null,
            'shared_memory' => $message->sharedMemory ? [
                'id' => $message->sharedMemory->id,
                'title' => $message->sharedMemory->title,
                'memory_date' => $message->sharedMemory->memory_date?->format('Y-m-d'),
            ] : null,
            'memory' => $memory ? [
                'id' => $memory->id,
                'title' => $memory->title,
                'memory_date' => $memory->memory_date?->format('Y-m-d'),
                'photo_url' => $memoryPhotoUrl,
            ] : null,
            'sender' => [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'avatar' => $message->sender->avatar,
            ],
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}
