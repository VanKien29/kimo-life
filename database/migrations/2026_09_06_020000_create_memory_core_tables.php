<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->date('memory_date');
            $table->string('mood', 32)->nullable();
            $table->string('visibility', 16)->default('private');
            $table->string('location')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'memory_date']);
            $table->index(['visibility', 'memory_date']);
        });

        Schema::create('memory_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['memory_id', 'position']);
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('icon', 32)->nullable();
            $table->string('color', 32)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });

        Schema::create('memory_activity', function (Blueprint $table) {
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();

            $table->primary(['memory_id', 'activity_id']);
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 40);
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });

        Schema::create('memory_tag', function (Blueprint $table) {
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();

            $table->primary(['memory_id', 'tag_id']);
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('memory_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'memory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('memory_tag');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('memory_activity');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('memory_photos');
        Schema::dropIfExists('memories');
    }
};
