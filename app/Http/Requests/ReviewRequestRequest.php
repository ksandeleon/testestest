<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User must have approve or reject permission
        return $this->user()->can('requests.approve') || $this->user()->can('requests.reject');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $action = $this->route()->getActionMethod();

        // Rejection requires review notes
        if ($action === 'reject') {
            return [
                'review_notes' => ['required', 'string', 'max:2000'],
            ];
        }

        // Requesting changes requires review notes
        if ($action === 'requestChanges') {
            return [
                'review_notes' => ['required', 'string', 'max:2000'],
            ];
        }

        // Approval has optional review notes
        return [
            'review_notes' => ['nullable', 'string', 'max:2000'],
            'auto_execute' => ['nullable', 'boolean'],
            'due_date' => ['nullable', 'date', 'after:today'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'review_notes.required' => 'Please provide a reason for your decision.',
            'due_date.after' => 'The due date must be in the future.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'review_notes' => 'review notes',
            'auto_execute' => 'auto execute',
            'due_date' => 'due date',
        ];
    }
}
