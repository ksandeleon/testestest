<?php

namespace App\Exceptions;

use Exception;

class CategoryException extends Exception
{
    public static function hasItems(string $categoryName): self
    {
        return new self("Cannot delete category '{$categoryName}' because it has associated items. Please reassign or remove items first.");
    }

    public static function codeExists(string $code): self
    {
        return new self("Category code '{$code}' already exists.");
    }

    public static function cannotDeactivate(string $categoryName): self
    {
        return new self("Cannot deactivate category '{$categoryName}' because it has active items assigned.");
    }

    public static function notFound(int $id): self
    {
        return new self("Category with ID {$id} not found.");
    }

    public static function alreadyDeleted(string $categoryName): self
    {
        return new self("Category '{$categoryName}' is already deleted.");
    }
}
