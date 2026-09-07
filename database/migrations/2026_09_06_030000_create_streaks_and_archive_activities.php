<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            if (! Schema::hasColumn('activities', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('color');
            }

            $table->unique(['user_id', 'name', 'archived_at']);
            $table->dropUnique(['user_id', 'name']);
            $table->index(['user_id', 'archived_at']);
        });

        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete();
            $table->string('name', 120);
            $table->string('icon', 32)->default('sparkles');
            $table->string('color', 32)->default('green');
            $table->string('goal_type', 32);
            $table->json('frequency')->nullable();
            $table->date('start_date');
            $table->boolean('active')->default(true);
            $table->unsignedInteger('current_streak')->default(0);
            $table->unsignedInteger('best_streak')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'active']);
            $table->index(['user_id', 'start_date']);
        });

        Schema::create('streak_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('streak_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->boolean('completed')->default(true);
            $table->timestamps();

            $table->unique(['streak_id', 'date']);
            $table->index(['streak_id', 'completed', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streak_logs');
        Schema::dropIfExists('streaks');

        Schema::table('activities', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'name', 'archived_at']);
            $table->dropIndex(['user_id', 'archived_at']);
            $table->dropColumn('archived_at');
            $table->unique(['user_id', 'name']);
        });
    }
};
