<?php

use App\Http\Controllers\ProfileController as PublicProfileController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'onboarding'])->group(function () {
    Route::redirect('settings', '/profile');

    Route::get('settings/appearance', fn () => Inertia::render('settings/appearance'))->name('appearance');

    // Giữ alias tương thích cho các form/liên kết cũ, nhưng không còn trang settings/profile riêng.
    Route::get('settings/profile', PublicProfileController::class)->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

});
