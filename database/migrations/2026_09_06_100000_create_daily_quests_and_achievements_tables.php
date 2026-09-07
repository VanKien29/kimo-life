<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_quest_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('quest_key', 32);
            $table->date('quest_date');
            $table->timestamp('completed_at');

            $table->unique(['user_id', 'quest_key', 'quest_date'], 'daily_quest_user_key_date');
            $table->index(['user_id', 'quest_date']);
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('achievement_key', 40);
            $table->timestamp('unlocked_at');

            $table->unique(['user_id', 'achievement_key'], 'user_achievement_user_key');
            $table->index(['user_id', 'unlocked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('daily_quest_completions');
    }
};
