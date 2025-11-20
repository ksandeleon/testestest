<?php

use App\Models\Item;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use function Pest\Laravel\actingAs;

beforeEach(function () {
    Storage::fake('public');

    // Create permissions
    Permission::create(['name' => 'items.generate_qr']);
});

it('can generate qr code for item', function () {
    $item = Item::factory()->create([
        'qr_code' => null,
        'qr_code_path' => null,
    ]);

    $user = User::factory()->create();
    $user->givePermissionTo('items.generate_qr');

    $response = actingAs($user)->post(route('items.generate-qr', $item));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'QR code generated successfully.');

    $item->refresh();

    expect($item->qr_code)->not->toBeNull();
    expect($item->qr_code_path)->not->toBeNull();
    expect($item->qr_code)->toStartWith('EARIST-');

    // Verify QR code file was created
    expect(Storage::disk('public')->exists($item->qr_code_path))->toBeTrue();
});

it('does not regenerate qr code if already exists', function () {
    $item = Item::factory()->create([
        'qr_code' => 'EXISTING-QR-CODE',
        'qr_code_path' => 'qr-codes/existing.png',
    ]);

    $existingQrCode = $item->qr_code;

    $user = User::factory()->create();
    $user->givePermissionTo('items.generate_qr');

    $response = actingAs($user)->post(route('items.generate-qr', $item));

    $response->assertRedirect();

    $item->refresh();
    expect($item->qr_code)->toBe($existingQrCode);
});

it('requires permission to generate qr code', function () {
    $item = Item::factory()->create();
    $user = User::factory()->create();

    $response = actingAs($user)->post(route('items.generate-qr', $item));

    $response->assertForbidden();
});
