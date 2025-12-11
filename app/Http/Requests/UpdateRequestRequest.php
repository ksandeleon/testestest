<?php

namespace App\Http\Requests;

use App\Models\Request;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $request = $this->route('request');

        // User can update their own request if it's editable
        if ($request->user_id === $this->user()->id && $request->canBeEdited()) {
            return true;
        }

        // Or if they have update permission
        return $this->user()->can('requests.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', Rule::in(Request::getTypes())],
            'item_id' => ['nullable', 'exists:items,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'priority' => ['sometimes', 'string', Rule::in(Request::getPriorities())],
            'metadata' => ['nullable', 'array'],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'type' => 'request type',
            'item_id' => 'item',
            'title' => 'title',
            'description' => 'description',
            'priority' => 'priority',
        ];
    }
}
