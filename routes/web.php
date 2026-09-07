<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DuoStreakController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\GroupChallengeController;
use App\Http\Controllers\MemoryController;
use App\Http\Controllers\MemoryInteractionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SharedMemoryController;
use App\Http\Controllers\StreakController;
use App\Http\Controllers\TodayController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

if (app()->environment('local')) {
    Route::get('dev-login', function () {
        $user = \App\Models\User::where('email', 'vkien29062006@gmail.com')->first() ?: \App\Models\User::first();
        auth()->login($user);
        return redirect()->route('today');
    });
}

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'edit'])->name('onboarding.edit');
    Route::patch('onboarding', [OnboardingController::class, 'update'])->name('onboarding.update');
});

Route::middleware(['auth', 'onboarding'])->group(function () {
    Route::get('today', TodayController::class)->name('today');
    Route::get('dashboard', fn () => redirect()->route('today'))->name('dashboard');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('calendar/day/{date}', [CalendarController::class, 'day'])->where('date', '\\d{4}-\\d{2}-\\d{2}')->name('calendar.day');
    Route::get('memory', [MemoryController::class, 'index'])->name('memory.index');
    Route::post('memory', [MemoryController::class, 'store'])->name('memory.store');
    Route::get('memory/{memory}/edit', [MemoryController::class, 'edit'])->name('memory.edit');
    Route::post('memory/{memory}/message', [ChatController::class, 'sendMemoryMessage'])->name('memory.message');
    Route::get('memory/{memory}', [MemoryController::class, 'show'])->name('memory.show');
    Route::patch('memory/{memory}', [MemoryController::class, 'update'])->name('memory.update');
    Route::delete('memory/{memory}', [MemoryController::class, 'destroy'])->name('memory.destroy');
    Route::post('memory/{memory}/favorite', [MemoryController::class, 'favorite'])->name('memory.favorite');
    Route::post('memory/{memory}/reactions', [MemoryInteractionController::class, 'toggleReaction'])->name('memory.reactions.toggle');
    Route::post('memory/{memory}/comments', [MemoryInteractionController::class, 'storeComment'])->name('memory.comments.store');
    Route::delete('memory/{memory}/comments/{comment}', [MemoryInteractionController::class, 'destroyComment'])->name('memory.comments.destroy');
    Route::get('streak', [StreakController::class, 'index'])->name('streak');
    Route::post('streak', [StreakController::class, 'store'])->name('streak.store');
    Route::patch('streak/{streak}', [StreakController::class, 'update'])->name('streak.update');
    Route::post('streak/{streak}/check-in', [StreakController::class, 'checkIn'])->name('streak.check-in');
    Route::patch('streak/{streak}/deactivate', [StreakController::class, 'deactivate'])->name('streak.deactivate');
    Route::get('activities', [ActivityController::class, 'index'])->name('activities.index');
    Route::post('activities', [ActivityController::class, 'store'])->name('activities.store');
    Route::patch('activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
    Route::patch('activities/{activity}/archive', [ActivityController::class, 'archive'])->name('activities.archive');
    Route::get('together', [FriendshipController::class, 'index'])->name('together');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::patch('notifications/{appNotification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('friendships', [FriendshipController::class, 'store'])->name('friendships.store');
    Route::patch('friendships/{friendship}/accept', [FriendshipController::class, 'accept'])->name('friendships.accept');
    Route::patch('friendships/{friendship}/decline', [FriendshipController::class, 'decline'])->name('friendships.decline');
    Route::delete('friendships/{friendship}', [FriendshipController::class, 'destroy'])->name('friendships.destroy');
    Route::patch('friendships/{friendship}/block', [FriendshipController::class, 'block'])->name('friendships.block');
    Route::get('shared-memories', [SharedMemoryController::class, 'index'])->name('shared-memories.index');
    Route::post('shared-memories', [SharedMemoryController::class, 'store'])->name('shared-memories.store');
    Route::get('shared-memories/{sharedMemory}', [SharedMemoryController::class, 'show'])->name('shared-memories.show');
    Route::patch('shared-memories/{sharedMemory}', [SharedMemoryController::class, 'update'])->name('shared-memories.update');
    Route::delete('shared-memories/{sharedMemory}', [SharedMemoryController::class, 'destroy'])->name('shared-memories.destroy');
    Route::post('shared-memories/{sharedMemory}/invite', [SharedMemoryController::class, 'invite'])->name('shared-memories.invite');
    Route::post('shared-memories/{sharedMemory}/photos', [SharedMemoryController::class, 'addPhotos'])->name('shared-memories.photos.store');
    Route::post('shared-memories/{sharedMemory}/notes', [SharedMemoryController::class, 'addNote'])->name('shared-memories.notes.store');
    Route::post('shared-memories/{sharedMemory}/reactions', [SharedMemoryController::class, 'toggleReaction'])->name('shared-memories.reactions.toggle');
    Route::patch('shared-memory-invitations/{participant}/accept', [SharedMemoryController::class, 'acceptInvitation'])->name('shared-memory-invitations.accept');
    Route::patch('shared-memory-invitations/{participant}/decline', [SharedMemoryController::class, 'declineInvitation'])->name('shared-memory-invitations.decline');
    Route::post('duo-streaks', [DuoStreakController::class, 'store'])->name('duo-streaks.store');
    Route::post('duo-streaks/{duoStreak}/check-in', [DuoStreakController::class, 'checkIn'])->name('duo-streaks.check-in');
    Route::post('duo-streaks/{duoStreak}/remind', [DuoStreakController::class, 'remind'])->name('duo-streaks.remind');
    Route::patch('duo-streaks/{duoStreak}/deactivate', [DuoStreakController::class, 'deactivate'])->name('duo-streaks.deactivate');
    Route::post('group-challenges', [GroupChallengeController::class, 'store'])->name('group-challenges.store');
    Route::get('group-challenges/{groupChallenge}', [GroupChallengeController::class, 'show'])->name('group-challenges.show');
    Route::post('group-challenges/{groupChallenge}/check-in', [GroupChallengeController::class, 'checkIn'])->name('group-challenges.check-in');
    Route::post('group-challenges/{groupChallenge}/photos', [GroupChallengeController::class, 'storePhotos'])->name('group-challenges.photos.store');
    Route::patch('group-challenge-invitations/{groupChallengeMember}/accept', [GroupChallengeController::class, 'acceptInvitation'])->name('group-challenge-invitations.accept');
    Route::patch('group-challenge-invitations/{groupChallengeMember}/decline', [GroupChallengeController::class, 'declineInvitation'])->name('group-challenge-invitations.decline');
    Route::delete('group-challenges/{groupChallenge}', [GroupChallengeController::class, 'destroy'])->name('group-challenges.destroy');
    Route::get('chat', [ChatController::class, 'index'])->name('chat');
    Route::post('chat/conversations', [ChatController::class, 'start'])->name('chat.conversations.start');
    Route::post('chat/conversations/{conversation}/messages', [ChatController::class, 'send'])->name('chat.messages.store');
    Route::get('profile', ProfileController::class)->name('profile');
    Route::get('reminders', [ReminderController::class, 'index'])->name('reminders.index');
    Route::post('reminders', [ReminderController::class, 'store'])->name('reminders.store');
    Route::patch('reminders/{reminder}', [ReminderController::class, 'update'])->name('reminders.update');
    Route::patch('reminders/{reminder}/toggle', [ReminderController::class, 'toggle'])->name('reminders.toggle');
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy'])->name('reminders.destroy');
    Route::get('foundation', fn () => Inertia::render('Foundation/Index'))->name('foundation');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
