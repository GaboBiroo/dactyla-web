<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Lead
{
    private static function getPdo(): PDO
    {
        return $GLOBALS['pdo'];
    }

    public static function firstOrCreate(array $query, array $defaults)
    {
        $pdo = self::getPdo();
        $phone = (string) $query['phone_number'];
        
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE phone_number = ?");
        $stmt->execute([$phone]);
        $lead = $stmt->fetch(PDO::FETCH_OBJ);
        
        if (!$lead) {
            $name = $defaults['name'] ?? 'Lead WhatsApp';
            $state = (int) ($defaults['current_state'] ?? 100);
            $active = ($defaults['is_bot_active'] ?? true) ? 1 : 0;
            
            $stmt = $pdo->prepare("INSERT INTO leads (phone_number, name, current_state, is_bot_active) VALUES (?, ?, ?, ?)");
            $stmt->execute([$phone, $name, $state, $active]);
            
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
            $stmt->execute([$id]);
            $lead = $stmt->fetch(PDO::FETCH_OBJ);
        }
        
        return $lead;
    }

    public static function latest()
    {
        $pdo = self::getPdo();
        $stmt = $pdo->query("SELECT * FROM leads ORDER BY id DESC LIMIT 1");
        $lead = $stmt->fetch(PDO::FETCH_OBJ);
        return new class($lead) {
            public function __construct(public mixed $lead) {}
            public function first() { return $this->lead; }
        };
    }
}
