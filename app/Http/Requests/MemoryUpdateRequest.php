<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemoryUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:'.config('kimo.memory.max_caption_length', 5000)],
            'mood' => ['nullable', 'string', 'max:32'],
            'visibility' => ['required', 'string', Rule::in(config('kimo.memory.visibilities', ['private']))],
            'location' => ['nullable', 'string', 'max:255'],
            'photos' => ['nullable', 'array', 'max:'.config('kimo.memory.max_photos', 10)],
            'photos.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:'.((int) config('kimo.photos.upload_max_size_mb', 10) * 1024),
            ],
            'remove_photo_ids' => ['nullable', 'array'],
            'remove_photo_ids.*' => ['integer'],
            'activities' => ['nullable', 'array', 'max:5'],
            'activities.*' => ['string', 'max:80', 'distinct'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:40', 'distinct'],
        ];
    }
}
