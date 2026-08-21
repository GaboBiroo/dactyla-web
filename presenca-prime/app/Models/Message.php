<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Message
{
    private static function getPdo(): PDO
    {
        return $GLOBALS['pdo'];
    }

    public static function where(string $column, mixed $value)
    {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare("SELECT * FROM messages WHERE {$column} = ?");
        $stmt->execute([$value]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return new class($rows) {
            public function __construct(private array $rows) {}
            public function exists(): bool {
                return count($this->rows) > 0;
            }
        };
    }

    public static function create(array $data): void
    {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare("INSERT INTO messages (lead_id, wamid, direction, status, content, raw_payload) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['lead_id'] ?? null,
            $data['wamid'],
            $data['direction'] ?? 'inbound',
            $data['status'] ?? 'processed',
            $data['content'] ?? '',
            is_array($data['raw_payload'] ?? null) ? json_encode($data['raw_payload']) : ($data['raw_payload'] ?? '')
        ]);
    }
}
