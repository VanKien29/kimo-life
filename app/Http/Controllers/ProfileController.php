<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Index', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'memory_count' => $user->memories()->count(),
                'streak_count' => $user->streaks()->where('active', true)->count(),
                'friends_count' => Friendship::query()
                    ->where('status', 'accepted')
                    ->where(fn ($query) => $query->where('user_id', $user->id)->orWhere('friend_id', $user->id))
                    ->count(),
            ],
        ]);
    }
}
