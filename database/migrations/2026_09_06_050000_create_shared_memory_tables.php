<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_memories', function (Blueprint $table) {
            $table->id();
            $table->string('title', 120);
            $table->text('description')->nullable();
            $table->date('memory_date');
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['owner_id', 'memory_date']);
        });

        Schema::create('shared_memory_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20)->default('participant');
            $table->string('status', 20)->default('pending');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['shared_memory_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('shared_memory_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['shared_memory_id', 'position']);
        });

        Schema::create('shared_memory_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();

            $table->index(['shared_memory_id', 'created_at']);
        });

        Schema::create('shared_memory_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reaction', 16);
            $table->timestamps();

            $table->unique(['shared_memory_id', 'user_id', 'reaction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_memory_reactions');
        Schema::dropIfExists('shared_memory_notes');
        Schema::dropIfExists('shared_memory_photos');
        Schema::dropIfExists('shared_memory_users');
        Schema::dropIfExists('shared_memories');
    }
};
