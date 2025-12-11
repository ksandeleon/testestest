<?php

namespace App\Exceptions;

use Exception;

class RequestException extends Exception
{
    /**
     * Exception when request cannot be created.
     */
    public static function cannotCreate(string $reason = ''): self
    {
        $message = 'Request cannot be created.';
        if ($reason) {
            $message .= ' Reason: ' . $reason;
        }

        return new self($message);
    }

    /**
     * Exception when request cannot be updated.
     */
    public static function cannotUpdate(string $reason = 'Request is not in an editable state.'): self
    {
        return new self('Request cannot be updated. ' . $reason);
    }

    /**
     * Exception when request cannot be approved.
     */
    public static function cannotApprove(string $reason = 'Request is not in a reviewable state.'): self
    {
        return new self('Request cannot be approved. ' . $reason);
    }

    /**
     * Exception when request cannot be rejected.
     */
    public static function cannotReject(string $reason = 'Request is not in a reviewable state.'): self
    {
        return new self('Request cannot be rejected. ' . $reason);
    }

    /**
     * Exception when changes cannot be requested.
     */
    public static function cannotRequestChanges(string $reason = 'Request is not in a reviewable state.'): self
    {
        return new self('Changes cannot be requested. ' . $reason);
    }

    /**
     * Exception when request cannot be cancelled.
     */
    public static function cannotCancel(string $reason = 'Request cannot be cancelled in its current state.'): self
    {
        return new self('Request cannot be cancelled. ' . $reason);
    }

    /**
     * Exception when request cannot be completed.
     */
    public static function cannotComplete(string $reason = 'Request must be approved before it can be completed.'): self
    {
        return new self('Request cannot be completed. ' . $reason);
    }

    /**
     * Exception when request cannot be deleted.
     */
    public static function cannotDelete(string $reason = 'Request cannot be deleted in its current state.'): self
    {
        return new self('Request cannot be deleted. ' . $reason);
    }

    /**
     * Exception for invalid status transition.
     */
    public static function invalidStatusTransition(string $from, string $to): self
    {
        return new self("Invalid status transition from '{$from}' to '{$to}'.");
    }

    /**
     * Exception when user is not authorized.
     */
    public static function unauthorized(string $action = 'perform this action'): self
    {
        return new self("You are not authorized to {$action} on this request.");
    }

    /**
     * Exception when request not found.
     */
    public static function notFound(): self
    {
        return new self('Request not found.');
    }
}
