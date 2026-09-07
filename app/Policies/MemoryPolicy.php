<?php

namespace App\Policies;

use App\Models\Friendship;
use App\Models\Memory;
use App\Models\User;

class MemoryPolicy
{
    public function view(User $user, Memory $memory): bool
    {
        if ($memory->user_id === $user->id || $memory->visibility === 'public') {
            return true;
        }

        return $memory->visibility === 'friends' && Friendship::query()
            ->where('status', 'accepted')
            ->where(function ($query) use ($user, $memory): void {
                $query
                    ->where(function ($query) use ($user, $memory): void {
                        $query->where('user_id', $user->id)->where('friend_id', $memory->user_id);
                    })
                    ->orWhere(function ($query) use ($user, $memory): void {
                        $query->where('user_id', $memory->user_id)->where('friend_id', $user->id);
                    });
            })
            ->exists();
    }

    public function update(User $user, Memory $memory): bool
    {
        return $memory->user_id === $user->id;
    }

    public function delete(User $user, Memory $memory): bool
    {
        return $memory->user_id === $user->id;
    }

    public function favorite(User $user, Memory $memory): bool
    {
        return $this->view($user, $memory);
    }
}
