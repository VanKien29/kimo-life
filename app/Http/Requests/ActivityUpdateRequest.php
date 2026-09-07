<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ActivityUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $activity = $this->route('activity');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('activities', 'name')
                    ->ignore($activity?->id)
                    ->where(fn ($query) => $query
                        ->where('user_id', $this->user()->id)
                        ->whereNull('archived_at')),
            ],
            'icon' => ['required', 'string', Rule::in(config('kimo.activities.icons', ['sparkles']))],
            'color' => ['required', 'string', Rule::in(config('kimo.activities.colors', ['green']))],
        ];
    }
}
