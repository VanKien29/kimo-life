<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('duo_streaks', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('frequency', 24)->default('daily');
            $table->date('start_date');
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('best_streak')->default(0);
            $table->string('status', 24)->default('active');
            $table->timestamps();

            $table->index(['created_by', 'status']);
        });

        Schema::create('duo_streak_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duo_streak_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('member');
            $table->string('status', 20)->default('accepted');
            $table->timestamps();

            $table->unique(['duo_streak_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('duo_streak_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duo_streak_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('completed')->default(true);
            $table->timestamps();

            $table->unique(['duo_streak_id', 'date', 'user_id'], 'duo_streak_logs_unique');
            $table->index(['duo_streak_id', 'date', 'completed']);
        });

        Schema::create('duo_streak_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('duo_streak_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_user_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->timestamps();

            $table->unique(['duo_streak_id', 'from_user_id', 'to_user_id', 'date'], 'duo_reminders_unique');
        });

        Schema::create('group_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->unsignedInteger('goal');
            $table->unsignedSmallInteger('duration');
            $table->date('start_date');
            $table->date('end_date');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('status', 24)->default('active');
            $table->timestamps();

            $table->index(['created_by', 'status']);
            $table->index(['start_date', 'end_date']);
        });

        Schema::create('group_challenge_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_challenge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('member');
            $table->string('status', 20)->default('accepted');
            $table->timestamps();

            $table->unique(['group_challenge_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('group_challenge_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_challenge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->boolean('completed')->default(true);
            $table->timestamps();

            $table->unique(['group_challenge_id', 'user_id', 'date'], 'challenge_logs_unique');
            $table->index(['group_challenge_id', 'date', 'completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_challenge_logs');
        Schema::dropIfExists('group_challenge_members');
        Schema::dropIfExists('group_challenges');
        Schema::dropIfExists('duo_streak_reminders');
        Schema::dropIfExists('duo_streak_logs');
        Schema::dropIfExists('duo_streak_members');
        Schema::dropIfExists('duo_streaks');
    }
};
