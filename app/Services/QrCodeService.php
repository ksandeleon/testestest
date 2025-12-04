<?php

namespace App\Services;

use App\Models\Item;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    /**
     * Generate QR code for an item.
     *
     * @param Item $item
     * @return string Path to the generated QR code
     * @throws \Exception
     */
    public function generate(Item $item): string
    {
        $qrData = json_encode([
            'item_id' => $item->id,
            'property_number' => $item->property_number,
            'name' => $item->name,
        ]);

        $result = Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($qrData)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(300)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        $qrCodePath = 'qr_codes/' . $item->id . '_' . time() . '.png';

        // Store the QR code
        Storage::disk('public')->put(
            $qrCodePath,
            $result->getString()
        );

        return $qrCodePath;
    }

    /**
     * Regenerate QR code for an item (deletes old one).
     *
     * @param Item $item
     * @return string Path to the new QR code
     * @throws \Exception
     */
    public function regenerate(Item $item): string
    {
        // Delete old QR code if it exists
        if ($item->qr_code_path) {
            $this->delete($item->qr_code_path);
        }

        return $this->generate($item);
    }

    /**
     * Delete QR code file from storage.
     *
     * @param string|null $qrCodePath
     * @return bool
     */
    public function delete(?string $qrCodePath): bool
    {
        if (!$qrCodePath) {
            return false;
        }

        if (Storage::disk('public')->exists($qrCodePath)) {
            return Storage::disk('public')->delete($qrCodePath);
        }

        return false;
    }

    /**
     * Get the full URL for a QR code.
     *
     * @param string|null $qrCodePath
     * @return string|null
     */
    public function getUrl(?string $qrCodePath): ?string
    {
        if (!$qrCodePath) {
            return null;
        }

        return Storage::disk('public')->url($qrCodePath);
    }
}
