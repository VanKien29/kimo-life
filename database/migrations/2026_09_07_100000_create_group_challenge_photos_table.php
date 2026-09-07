<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_challenge_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_challenge_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_challenge_log_id')->nullable()->constrained('group_challenge_logs')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['group_challenge_id', 'date']);
            $table->index(['group_challenge_id', 'user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_challenge_photos');
    }
};
