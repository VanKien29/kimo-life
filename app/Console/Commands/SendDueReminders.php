<?php

namespace App\Console\Commands;

use App\Jobs\SendDueReminder;
use App\Models\Reminder;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class SendDueReminders extends Command
{
    protected $signature = 'reminders:send-due';

    protected $description = 'Đưa các lời nhắc đến hạn vào hàng đợi';

    public function handle(): int
    {
        $queued = Reminder::query()->where('enabled', true)->get()->filter(function (Reminder $reminder): bool {
            $now = CarbonImmutable::now($reminder->timezone);

            return in_array($now->dayOfWeekIso, $reminder->days_of_week ?? [], true)
                && substr((string) $reminder->time, 0, 5) === $now->format('H:i');
        })->each(fn (Reminder $reminder) => SendDueReminder::dispatch($reminder));

        $this->info("Đã đưa {$queued->count()} lời nhắc vào hàng đợi.");

        return self::SUCCESS;
    }
}
