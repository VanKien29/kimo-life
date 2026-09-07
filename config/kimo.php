<?php

return [
    'app_name' => env('APP_NAME', 'Kimo Life'),
    'tagline' => 'Small moments. A better you.',
    'locale' => env('APP_LOCALE', 'vi'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'language' => [
        'web' => env('KIMO_WEB_LOCALE', 'vi'),
        'fallback' => env('KIMO_FALLBACK_LOCALE', 'en'),
    ],

    'date' => [
        'timezone_strategy' => 'user',
        'date_format' => 'd/m/Y',
        'time_format' => 'H:i',
        'month_format' => 'F Y',
    ],

    'pagination' => [
        'default' => (int) env('KIMO_PAGINATION_DEFAULT', 20),
        'small' => 10,
        'large' => 50,
    ],

    'memory' => [
        'max_caption_length' => 80,
        'max_photos' => 10,
        'default_visibility' => 'private',
        'visibilities' => ['private', 'friends', 'public'],
    ],

    'activities' => [
        'icons' => ['sparkles', 'book-open', 'dumbbell', 'footprints', 'coffee', 'code', 'gamepad-2'],
        'colors' => ['green', 'blue', 'orange', 'purple'],
    ],

    'streaks' => [
        'icons' => ['sparkles', 'book-open', 'dumbbell', 'footprints', 'coffee', 'code', 'gamepad-2'],
        'colors' => ['green', 'blue', 'orange', 'purple'],
        'heatmap_days' => 84,
    ],

    'photos' => [
        'upload_max_size_mb' => (int) env('KIMO_UPLOAD_MAX_SIZE_MB', 10),
        'thumbnail_width' => 320,
        'medium_width' => 960,
        'large_width' => 1600,
        'disk' => env('KIMO_STORAGE_DISK', 'public'),
    ],

    'search' => [
        'debounce_ms' => 300,
        'page_size' => 20,
    ],

    'reminders' => [
        'max_friend_nudges_per_day' => 1,
    ],

    'notifications' => [
        'retention_days' => (int) env('KIMO_NOTIFICATION_RETENTION_DAYS', 90),
    ],

    'motion' => [
        'fast_ms' => 160,
        'normal_ms' => 240,
        'emphasized_ms' => 360,
        'page_y_offset' => 8,
        'button_press_scale' => 0.98,
        'modal_initial_scale' => 0.96,
    ],

    'storage' => [
        'disk' => env('KIMO_STORAGE_DISK', 'public'),
    ],

    'queue' => [
        'connection' => env('KIMO_QUEUE_CONNECTION', env('QUEUE_CONNECTION', 'database')),
    ],

    'cache' => [
        'store' => env('KIMO_CACHE_STORE', env('CACHE_STORE', 'database')),
    ],

    'features' => [
        'duo_streak' => true,
        'shared_memory' => true,
        'chat' => false,
        'realtime' => filter_var(env('KIMO_REALTIME_ENABLED', false), FILTER_VALIDATE_BOOL),
    ],
];
