<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class MemoryPhotoStorage
{
    /**
     * Store the original and a medium thumbnail without trusting the client filename.
     * The thumbnail is optional so uploads still work on hosts without GD enabled.
     *
     * @return array{path: string, thumbnail_path: string|null, width: int, height: int}
     */
    public function store(UploadedFile $photo, int $userId): array
    {
        $size = @getimagesize($photo->getRealPath());

        if ($size === false) {
            throw new RuntimeException('Tệp ảnh không hợp lệ.');
        }

        $disk = $this->disk();
        $directory = "memories/{$userId}";
        $path = $photo->store("{$directory}/originals", $disk);

        if (! is_string($path)) {
            throw new RuntimeException('Không thể lưu ảnh.');
        }

        return [
            'path' => $path,
            'thumbnail_path' => $this->createThumbnail($photo, $directory, $size[0], $size[1]),
            'width' => $size[0],
            'height' => $size[1],
        ];
    }

    public function delete(string $path, ?string $thumbnailPath = null): void
    {
        $storage = Storage::disk($this->disk());
        $storage->delete(array_filter([$path, $thumbnailPath]));
    }

    private function disk(): string
    {
        return (string) config('kimo.photos.disk', 'public');
    }

    private function createThumbnail(UploadedFile $photo, string $directory, int $width, int $height): ?string
    {
        if (! extension_loaded('gd')) {
            return null;
        }

        $source = @imagecreatefromstring((string) file_get_contents($photo->getRealPath()));

        if ($source === false) {
            return null;
        }

        $maxWidth = (int) config('kimo.photos.medium_width', 960);
        $targetWidth = min($width, $maxWidth);
        $targetHeight = max(1, (int) round($height * ($targetWidth / $width)));
        $thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);

        imagealphablending($thumbnail, true);
        imagesavealpha($thumbnail, false);
        $white = imagecolorallocate($thumbnail, 255, 255, 255);
        imagefill($thumbnail, 0, 0, $white);
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        imagejpeg($thumbnail, null, 82);
        $contents = ob_get_clean();

        imagedestroy($source);
        imagedestroy($thumbnail);

        if (! is_string($contents)) {
            return null;
        }

        $path = "{$directory}/thumbnails/".Str::uuid().'.jpg';
        $stored = Storage::disk($this->disk())->put($path, $contents);

        return $stored ? $path : null;
    }
}
