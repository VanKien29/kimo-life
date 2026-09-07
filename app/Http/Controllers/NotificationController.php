<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    private const FRIEND_TYPES = ['friend_request', 'friend_accepted', 'reaction', 'comment', 'memory_share'];

    private const STREAK_TYPES = ['streak', 'duo_streak', 'challenge', 'reminder'];

    public function index(Request $request): Response
    {
        $tab = $request->validate(['tab' => ['nullable', Rule::in(['all', 'friends', 'streaks'])]])['tab'] ?? 'all';
        $query = $request->user()->appNotifications()->with('actor')->latest('created_at');

        if ($tab === 'friends') {
            $query->whereIn('type', self::FRIEND_TYPES);
        } elseif ($tab === 'streaks') {
            $query->whereIn('type', self::STREAK_TYPES);
        }

        $notifications = $query->paginate(20)->withQueryString()->through(fn (AppNotification $notification) => [
            'id' => $notification->id,
            'type' => $notification->type,
            'data' => $notification->data ?? [],
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),
            'actor' => $notification->actor ? [
                'id' => $notification->actor->id,
                'name' => $notification->actor->name,
                'username' => $notification->actor->username,
                'avatar' => $notification->actor->avatar,
            ] : null,
        ]);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'activeTab' => $tab,
            'unreadCount' => $request->user()->appNotifications()->whereNull('read_at')->count(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function read(Request $request, AppNotification $appNotification): RedirectResponse
    {
        abort_unless($appNotification->user_id === $request->user()->id, 403);
        $appNotification->update(['read_at' => now()]);

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->appNotifications()->whereNull('read_at')->update(['read_at' => now()]);

        return back()->with('status', 'Đã đánh dấu tất cả thông báo là đã đọc.');
    }
}
