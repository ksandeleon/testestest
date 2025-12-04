<?php

namespace App\Exceptions;

use Exception;

class DisposalException extends Exception
{
    public static function cannotApprove(): self
    {
        return new self('Only pending disposals can be approved.');
    }

    public static function cannotReject(): self
    {
        return new self('Only pending disposals can be rejected.');
    }

    public static function cannotExecute(): self
    {
        return new self('Only approved disposals can be executed.');
    }

    public static function cannotCancel(): self
    {
        return new self('Only pending disposals can be cancelled.');
    }

    public static function itemNotAvailable(): self
    {
        return new self('Item is not available for disposal.');
    }
}
