<?php

declare(strict_types=1);

/**
 * Small validation toolkit. Every write endpoint validates through this
 * before touching the database (docs/ARCHITECTURE.md §M) — collects all
 * errors rather than failing on the first one, so the CMS can show a
 * complete list of what needs fixing in one round trip.
 */
final class Validator
{
    private array $errors = [];

    public function __construct(private readonly array $data)
    {
    }

    public function required(string $field, string $label): self
    {
        $value = $this->data[$field] ?? null;
        if ($value === null || $value === '') {
            $this->errors[$field] = "$label is required.";
        }
        return $this;
    }

    public function maxLength(string $field, int $max, string $label): self
    {
        $value = $this->data[$field] ?? null;
        if (is_string($value) && mb_strlen($value) > $max) {
            $this->errors[$field] = "$label must be $max characters or fewer.";
        }
        return $this;
    }

    public function in(string $field, array $allowed, string $label): self
    {
        $value = $this->data[$field] ?? null;
        if ($value !== null && $value !== '' && !in_array($value, $allowed, true)) {
            $this->errors[$field] = "$label must be one of: " . implode(', ', $allowed) . '.';
        }
        return $this;
    }

    public function email(string $field, string $label): self
    {
        $value = $this->data[$field] ?? null;
        if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "$label must be a valid email address.";
        }
        return $this;
    }

    public function fails(): bool
    {
        return count($this->errors) > 0;
    }

    public function errors(): array
    {
        return $this->errors;
    }
}

function validation_fail(array $errors): void
{
    http_response_code(422);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'data' => null, 'error' => ['code' => 'validation_failed', 'message' => 'Please fix the highlighted fields.', 'fields' => $errors], 'meta' => null]);
    exit;
}

/** Strips a fixed field allowlist out of an input array — never trust unknown fields into a query. */
function only(array $data, array $allowedFields): array
{
    return array_intersect_key($data, array_flip($allowedFields));
}
