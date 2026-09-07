<?php

namespace App\Http\Controllers;

use App\Http\Requests\OnboardingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function edit(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->onboarding_completed_at !== null) {
            return to_route('today');
        }

        return Inertia::render('Onboarding/Index', [
            'profile' => [
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'timezone' => $user->timezone ?? config('app.timezone'),
                'locale' => $user->locale ?? config('kimo.language.web'),
            ],
        ]);
    }

    public function update(OnboardingRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());
        $request->user()->onboarding_completed_at = now();
        $request->user()->save();

        return to_route('today')->with('status', 'Đã thiết lập không gian Kimo Life 🌱');
    }
}
