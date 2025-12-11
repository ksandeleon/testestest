<?php

namespace App\Http\Requests;

use App\Models\Request;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('requests.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(Request::getTypes())],
            'item_id' => ['nullable', 'exists:items,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'priority' => ['nullable', 'string', Rule::in(Request::getPriorities())],
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

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Please specify the type of request.',
            'type.in' => 'Invalid request type selected.',
            'title.required' => 'Please provide a title for your request.',
            'description.required' => 'Please describe what you need in detail.',
            'item_id.exists' => 'The selected item does not exist.',
        ];
    }
}
