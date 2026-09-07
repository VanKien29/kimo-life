<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('title', 120);
            $table->time('time');
            $table->json('days_of_week');
            $table->boolean('enabled')->default(true);
            $table->string('timezone', 64);
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'enabled'], 'reminders_user_enabled_index');
        });

        Schema::create('reminder_deliveries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reminder_id')->constrained()->cascadeOnDelete();
            $table->date('reminder_date');
            $table->timestamp('delivered_at')->useCurrent();
            $table->unique(['reminder_id', 'reminder_date'], 'reminder_deliveries_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminder_deliveries');
        Schema::dropIfExists('reminders');
    }
};
