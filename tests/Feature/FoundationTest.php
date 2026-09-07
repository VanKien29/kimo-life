<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_renders_the_kimo_life_landing_page(): void
    {
        $this->get(route('home'))->assertOk();
    }

    public function test_it_protects_the_today_foundation_route(): void
    {
        $this->get(route('today'))->assertRedirect(route('login'));
    }

    public function test_an_authenticated_user_can_visit_today(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('today'))->assertOk();
    }

    public function test_an_authenticated_user_can_visit_the_foundation_showcase(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get(route('foundation'))->assertOk();
    }

    public function test_an_incomplete_user_is_redirected_to_onboarding(): void
    {
        $user = User::factory()->create(['onboarding_completed_at' => null]);

        $this->actingAs($user);

        $this->get(route('today'))->assertRedirect(route('onboarding.edit'));
    }

    public function test_an_incomplete_user_can_complete_onboarding(): void
    {
        $user = User::factory()->create(['onboarding_completed_at' => null]);

        $response = $this->actingAs($user)->patch(route('onboarding.update'), [
            'name' => 'Kimo User',
            'username' => 'kimo-user',
            'bio' => 'Lưu lại điều nhỏ bé.',
            'timezone' => 'Asia/Ho_Chi_Minh',
            'locale' => 'vi',
        ]);

        $response->assertRedirect(route('today', absolute: false));
        $this->assertNotNull($user->fresh()->onboarding_completed_at);
        $this->assertSame('kimo-user', $user->fresh()->username);
    }

    public function test_it_exposes_centralized_kimo_life_defaults(): void
    {
        $this->assertSame('Kimo Life', config('kimo.app_name'));
        $this->assertSame('Small moments. A better you.', config('kimo.tagline'));
        $this->assertSame('vi', config('kimo.language.web'));
        $this->assertSame('private', config('kimo.memory.default_visibility'));
        $this->assertSame(20, config('kimo.pagination.default'));
    }
}
