<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StreakStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'icon' => ['required', 'string', Rule::in(config('kimo.streaks.icons', ['sparkles']))],
            'color' => ['required', 'string', Rule::in(config('kimo.streaks.colors', ['green']))],
            'goal_type' => ['required', 'string', Rule::in(['every_day', 'weekdays', 'x_days_per_week'])],
            'frequency' => ['nullable', 'array'],
            'frequency.days' => ['nullable', 'array', 'min:1', 'max:7'],
            'frequency.days.*' => ['integer', 'between:1,7', 'distinct'],
            'frequency.count' => ['nullable', 'integer', 'between:1,7'],
            'activity_id' => ['nullable', 'integer', Rule::exists('activities', 'id')->where(fn ($query) => $query->where('user_id', $this->user()->id)->whereNull('archived_at'))],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [$this->validateFrequency(...)];
    }

    private function validateFrequency(Validator $validator): void
    {
        $goalType = $this->string('goal_type')->toString();
        $frequency = $this->input('frequency', []);

        if ($goalType === 'weekdays' && count($frequency['days'] ?? []) === 0) {
            $validator->errors()->add('frequency.days', 'Hãy chọn ít nhất một ngày trong tuần.');
        }

        if ($goalType === 'x_days_per_week' && empty($frequency['count'])) {
            $validator->errors()->add('frequency.count', 'Hãy chọn số ngày mục tiêu mỗi tuần.');
        }
    }
}
