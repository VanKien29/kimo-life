<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memory_reactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reaction', 16);
            $table->timestamps();
            $table->unique(['memory_id', 'user_id', 'reaction'], 'memory_reactions_unique');
            $table->index(['memory_id', 'reaction'], 'memory_reactions_memory_reaction_index');
        });

        Schema::create('memory_comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
            $table->index(['memory_id', 'created_at'], 'memory_comments_memory_created_index');
        });

        Schema::create('notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'read_at', 'created_at'], 'notifications_user_read_created_index');
            $table->index(['user_id', 'type'], 'notifications_user_type_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('memory_comments');
        Schema::dropIfExists('memory_reactions');
    }
};
