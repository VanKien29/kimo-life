<?php

namespace Tests\Feature;

use App\Models\Memory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MemoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_a_private_memory_with_associations(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('memory.store'), [
            'content' => 'Một buổi sáng thật nhẹ nhàng.',
            'mood' => 'binh-yen',
            'visibility' => 'private',
            'photos' => [UploadedFile::fake()->image('morning.jpg', 640, 480)],
            'activities' => ['Đọc sách'],
            'tags' => ['buổi-sáng'],
        ]);

        $response->assertRedirect(route('memory.index', absolute: false));
        $memory = Memory::query()->firstOrFail();

        $this->assertSame($user->id, $memory->user_id);
        $this->assertSame('private', $memory->visibility);
        $this->assertSame(['Đọc sách'], $memory->activities()->pluck('name')->all());
        $this->assertSame(['buổi-sáng'], $memory->tags()->pluck('name')->all());
        $this->assertSame(now($user->timezone)->toDateString(), $memory->memory_date->toDateString());
    }

    public function test_a_memory_requires_a_photo_and_always_uses_today(): void
    {
        $disk = config('kimo.photos.disk');
        Storage::fake($disk);
        $user = User::factory()->create(['timezone' => 'Asia/Ho_Chi_Minh']);

        $this->actingAs($user)->post(route('memory.store'), [
            'content' => 'Chỉ có chú thích.',
            'visibility' => 'private',
        ])->assertSessionHasErrors('photos');

        $this->assertDatabaseCount('memories', 0);

        $this->actingAs($user)->post(route('memory.store'), [
            'content' => 'Ảnh của hôm nay.',
            'memory_date' => '2000-01-01',
            'visibility' => 'private',
            'photos' => [UploadedFile::fake()->image('today.jpg')],
        ])->assertRedirect(route('memory.index', absolute: false));

        $this->assertSame(now('Asia/Ho_Chi_Minh')->toDateString(), Memory::query()->firstOrFail()->memory_date->toDateString());
    }

    public function test_a_user_can_upload_multiple_photos_and_create_thumbnails(): void
    {
        $disk = config('kimo.photos.disk');
        Storage::fake($disk);
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('memory.store'), [
            'content' => 'Hai tấm ảnh của ngày hôm nay.',
            'memory_date' => '2026-09-06',
            'visibility' => 'private',
            'photos' => [
                UploadedFile::fake()->image('first.png', 640, 480),
                UploadedFile::fake()->image('second.jpg', 800, 600),
            ],
        ])->assertRedirect(route('memory.index', absolute: false));

        $memory = Memory::query()->with('photos')->firstOrFail();

        $this->assertCount(2, $memory->photos);
        Storage::disk($disk)->assertExists($memory->photos[0]->path);
        Storage::disk($disk)->assertExists($memory->photos[0]->thumbnail_path);
        $this->assertSame(640, $memory->photos[0]->width);
        $this->assertSame(480, $memory->photos[0]->height);
    }

    public function test_private_memories_are_not_visible_to_another_user(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $privateMemory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'private']);
        $publicMemory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'public']);

        $this->actingAs($visitor)->get(route('memory.show', $privateMemory))->assertForbidden();
        $this->actingAs($visitor)->get(route('memory.show', $publicMemory))->assertOk();
    }

    public function test_owner_can_edit_delete_and_toggle_favorite(): void
    {
        $user = User::factory()->create();
        $memory = Memory::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->patch(route('memory.update', $memory), [
            'content' => 'Nội dung đã được cập nhật.',
            'visibility' => 'friends',
        ])->assertRedirect(route('memory.show', $memory, absolute: false));

        $this->actingAs($user)->post(route('memory.favorite', $memory))->assertRedirect();
        $this->assertDatabaseHas('favorites', ['user_id' => $user->id, 'memory_id' => $memory->id]);

        $this->actingAs($user)->post(route('memory.favorite', $memory))->assertRedirect();
        $this->assertDatabaseMissing('favorites', ['user_id' => $user->id, 'memory_id' => $memory->id]);

        $this->actingAs($user)->delete(route('memory.destroy', $memory))->assertRedirect(route('memory.index', absolute: false));
        $this->assertSoftDeleted('memories', ['id' => $memory->id]);
    }

    public function test_another_user_cannot_edit_or_delete_a_memory(): void
    {
        $owner = User::factory()->create();
        $visitor = User::factory()->create();
        $memory = Memory::factory()->create(['user_id' => $owner->id, 'visibility' => 'public']);

        $this->actingAs($visitor)->patch(route('memory.update', $memory), [
            'content' => 'Không được phép.',
            'visibility' => 'public',
        ])->assertForbidden();

        $this->actingAs($visitor)->delete(route('memory.destroy', $memory))->assertForbidden();
    }
}
