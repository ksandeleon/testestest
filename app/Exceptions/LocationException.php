<?php

namespace App\Exceptions;

use Exception;

class LocationException extends Exception
{
    public static function hasItems(string $locationName): self
    {
        return new self("Cannot delete location '{$locationName}' because it has associated items. Please reassign or remove items first.");
    }

    public static function codeExists(string $code): self
    {
        return new self("Location code '{$code}' already exists.");
    }

    public static function cannotDeactivate(string $locationName): self
    {
        return new self("Cannot deactivate location '{$locationName}' because it has active items assigned.");
    }

    public static function notFound(int $id): self
    {
        return new self("Location with ID {$id} not found.");
    }

    public static function alreadyDeleted(string $locationName): self
    {
        return new self("Location '{$locationName}' is already deleted.");
    }
}
