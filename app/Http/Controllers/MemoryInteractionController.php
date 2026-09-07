<?php

namespace App\Http\Controllers;

use App\Models\Memory;
use App\Models\MemoryComment;
use App\Services\AppNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MemoryInteractionController extends Controller
{
    private const REACTIONS = ['❤️', '🔥', '👏', '✨', '😂', '🥹'];

    public function __construct(private readonly AppNotificationService $notifications) {}

    public function toggleReaction(Request $request, Memory $memory): RedirectResponse
    {
        $this->authorize('view', $memory);
        $data = $request->validate([
            'reaction' => ['required', 'string', Rule::in(self::REACTIONS)],
        ]);
        $reaction = $memory->reactions()->firstOrCreate([
            'user_id' => $request->user()->id,
            'reaction' => $data['reaction'],
        ]);

        if (! $reaction->wasRecentlyCreated) {
            $reaction->delete();
        } else {
            $this->notifications->send($memory->user_id, 'reaction', $request->user()->id, [
                'message' => 'đã bày tỏ cảm xúc với khoảnh khắc của bạn.',
                'url' => route('memory.show', $memory),
            ]);
        }

        return back();
    }

    public function storeComment(Request $request, Memory $memory): RedirectResponse
    {
        $this->authorize('view', $memory);
        $data = $request->validate(['content' => ['required', 'string', 'max:1000']]);
        $comment = $memory->comments()->create([
            'user_id' => $request->user()->id,
            'content' => trim($data['content']),
        ]);

        $this->notifications->send($memory->user_id, 'comment', $request->user()->id, [
            'message' => 'đã bình luận về khoảnh khắc của bạn.',
            'url' => route('memory.show', $memory),
            'comment_id' => $comment->id,
        ]);

        return back()->with('status', 'Đã thêm bình luận.');
    }

    public function destroyComment(Request $request, Memory $memory, MemoryComment $comment): RedirectResponse
    {
        abort_unless($comment->memory_id === $memory->id, 404);
        abort_unless($comment->user_id === $request->user()->id, 403);
        $comment->delete();

        return back()->with('status', 'Đã xóa bình luận.');
    }
}
