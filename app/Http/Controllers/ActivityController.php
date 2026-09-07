<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityStoreRequest;
use App\Http\Requests\ActivityUpdateRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Activities/Index', [
            'activities' => $user->activities()->whereNull('archived_at')->latest()->get(['id', 'name', 'icon', 'color']),
            'archivedActivities' => $user->activities()->whereNotNull('archived_at')->latest('archived_at')->get(['id', 'name', 'icon', 'color', 'archived_at']),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(ActivityStoreRequest $request): RedirectResponse
    {
        $request->user()->activities()->create($request->validated());

        return to_route('activities.index')->with('status', 'Đã thêm hoạt động.');
    }

    public function update(ActivityUpdateRequest $request, Activity $activity): RedirectResponse
    {
        $this->ensureOwner($request, $activity);
        $activity->update($request->validated());

        return to_route('activities.index')->with('status', 'Đã cập nhật hoạt động.');
    }

    public function archive(Request $request, Activity $activity): RedirectResponse
    {
        $this->ensureOwner($request, $activity);
        $activity->update(['archived_at' => now()]);

        return to_route('activities.index')->with('status', 'Đã lưu trữ hoạt động.');
    }

    private function ensureOwner(Request $request, Activity $activity): void
    {
        abort_unless($activity->user_id === $request->user()->id, 403);
        abort_if($activity->archived_at !== null, 404);
    }
}
