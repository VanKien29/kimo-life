<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use DateTimeZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    private const TYPES = [
        'daily_memory' => ['label' => 'Khoảnh khắc mỗi ngày', 'icon' => 'camera', 'description' => 'Một chút thời gian để lưu lại hôm nay.'],
        'habit' => ['label' => 'Thói quen', 'icon' => 'target', 'description' => 'Nhắc bạn dành thời gian cho điều đang theo đuổi.'],
        'streak' => ['label' => 'Chuỗi cá nhân', 'icon' => 'flame', 'description' => 'Giữ nhịp đều đặn theo cách nhẹ nhàng.'],
        'duo_streak' => ['label' => 'Chuỗi chung', 'icon' => 'users', 'description' => 'Cùng bạn bè hoàn thành một bước nhỏ.'],
        'weekly_recap' => ['label' => 'Nhìn lại tuần', 'icon' => 'calendar', 'description' => 'Dành một chút thời gian nhìn lại tuần qua.'],
        'monthly_recap' => ['label' => 'Nhìn lại tháng', 'icon' => 'sparkles', 'description' => 'Gom lại những điều đáng nhớ trong tháng.'],
    ];

    public function index(Request $request): Response
    {
        $reminders = $request->user()->reminders()->latest()->get()->map(fn (Reminder $reminder) => $this->serialize($reminder))->values();

        return Inertia::render('Reminders/Index', [
            'reminders' => $reminders,
            'types' => self::TYPES,
            'timezone' => $request->user()->timezone ?: config('app.timezone'),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $request->user()->reminders()->create($this->attributes($data, $request));

        return back()->with('status', 'Đã tạo lời nhắc.');
    }

    public function update(Request $request, Reminder $reminder): RedirectResponse
    {
        $this->ensureOwner($request, $reminder);
        $data = $this->validated($request);
        $reminder->update($this->attributes($data, $request));

        return back()->with('status', 'Đã cập nhật lời nhắc.');
    }

    public function toggle(Request $request, Reminder $reminder): RedirectResponse
    {
        $this->ensureOwner($request, $reminder);
        $reminder->update(['enabled' => ! $reminder->enabled]);

        return back()->with('status', $reminder->enabled ? 'Đã bật lời nhắc.' : 'Đã tạm dừng lời nhắc.');
    }

    public function destroy(Request $request, Reminder $reminder): RedirectResponse
    {
        $this->ensureOwner($request, $reminder);
        $reminder->delete();

        return back()->with('status', 'Đã xóa lời nhắc.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'type' => ['required', 'string', Rule::in(array_keys(self::TYPES))],
            'title' => ['required', 'string', 'max:120'],
            'time' => ['required', 'date_format:H:i'],
            'days_of_week' => ['required', 'array', 'min:1'],
            'days_of_week.*' => ['integer', Rule::in(range(1, 7))],
            'timezone' => ['nullable', 'string', Rule::in(DateTimeZone::listIdentifiers())],
            'payload' => ['nullable', 'array'],
        ]);
    }

    /** @param array<string, mixed> $data */
    private function attributes(array $data, Request $request): array
    {
        return [
            'type' => $data['type'],
            'title' => trim($data['title']),
            'time' => $data['time'],
            'days_of_week' => collect($data['days_of_week'])->map(fn ($day) => (int) $day)->unique()->sort()->values()->all(),
            'enabled' => true,
            'timezone' => $data['timezone'] ?? $request->user()->timezone ?: config('app.timezone'),
            'payload' => $data['payload'] ?? [],
        ];
    }

    /** @return array<string, mixed> */
    private function serialize(Reminder $reminder): array
    {
        return [
            'id' => $reminder->id,
            'type' => $reminder->type,
            'title' => $reminder->title,
            'time' => substr((string) $reminder->time, 0, 5),
            'days_of_week' => $reminder->days_of_week ?? [],
            'enabled' => $reminder->enabled,
            'timezone' => $reminder->timezone,
            'payload' => $reminder->payload ?? [],
        ];
    }

    private function ensureOwner(Request $request, Reminder $reminder): void
    {
        abort_unless($reminder->user_id === $request->user()->id, 403);
    }
}
