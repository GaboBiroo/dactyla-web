<?php

declare(strict_types=1);

namespace App\Models;

use PDO;

class Lead
{
    private static function getPdo(): PDO
    {
        if (isset($GLOBALS['pdo']) && $GLOBALS['pdo'] instanceof PDO) {
            return $GLOBALS['pdo'];
        }

        $baseDir = 'C:/Users/Usuario/Desktop/Agencia de Tecnologia/presenca-prime';
        $dbConnection = getenv('DB_CONNECTION') ?: 'pgsql';

        if ($dbConnection === 'pgsql') {
            $dbHost = getenv('DB_HOST') ?: 'db.tylnhpxleyummyzsqinc.supabase.co';
            $dbPort = getenv('DB_PORT') ?: '5432';
            $dbName = getenv('DB_DATABASE') ?: 'postgres';
            $dbUser = getenv('DB_USERNAME') ?: 'postgres';
            $dbPass = getenv('DB_PASSWORD') ?: 'Matheusfuturopadre1-';

            $dbUrl = getenv('DB_URL');
            if ($dbUrl) {
                $parsed = parse_url($dbUrl);
                if ($parsed) {
                    $dbHost = $parsed['host'] ?? $dbHost;
                    $dbPort = (string) ($parsed['port'] ?? $dbPort);
                    $dbUser = $parsed['user'] ?? $dbUser;
                    $dbPass = $parsed['pass'] ?? $dbPass;
                    $dbName = ltrim($parsed['path'] ?? $dbName, '/');
                }
            }

            try {
                $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName};sslmode=require";
                $GLOBALS['pdo'] = new PDO($dsn, $dbUser, $dbPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
                return $GLOBALS['pdo'];
            } catch (\Throwable $e) {
                // Fallback de resiliencia para SQLite
            }
        }

        $sqliteFile = $baseDir . '/database/database.sqlite';
        $GLOBALS['pdo'] = new PDO('sqlite:' . $sqliteFile);
        $GLOBALS['pdo']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $GLOBALS['pdo'];
    }

    public static function firstOrCreate(array $query, array $defaults): object
    {
        $pdo = self::getPdo();
        $phone = (string) $query['phone_number'];

        $stmt = $pdo->prepare("SELECT * FROM leads WHERE phone_number = ?");
        $stmt->execute([$phone]);
        $lead = $stmt->fetch(PDO::FETCH_OBJ);

        if (!$lead) {
            $name = $defaults['name'] ?? 'Lead WhatsApp';
            $state = (int) ($defaults['current_state'] ?? 100);
            $active = ($defaults['is_bot_active'] ?? true) ? true : false;

            try {
                $stmt = $pdo->prepare("INSERT INTO leads (phone_number, name, current_state, is_bot_active) VALUES (?, ?, ?, ?) RETURNING id");
                $stmt->execute([$phone, $name, $state, $active ? 'true' : 'false']);
                $id = $stmt->fetchColumn();
            } catch (\Throwable $e) {
                $stmt = $pdo->prepare("INSERT INTO leads (phone_number, name, current_state, is_bot_active) VALUES (?, ?, ?, ?)");
                $stmt->execute([$phone, $name, $state, $active ? 1 : 0]);
                $id = $pdo->lastInsertId();
            }

            $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
            $stmt->execute([$id]);
            $lead = $stmt->fetch(PDO::FETCH_OBJ);
        }

        return $lead;
    }

    public static function where(string $column, mixed $value): object
    {
        $pdo = self::getPdo();
        $stmt = $pdo->prepare("SELECT * FROM leads WHERE {$column} = ?");
        $stmt->execute([$value]);
        $results = $stmt->fetchAll(PDO::FETCH_OBJ);

        return new class($results) {
            public function __construct(private array $results) {}
            public function first(): ?object { return $this->results[0] ?? null; }
            public function exists(): bool { return !empty($this->results); }
            public function get(): array { return $this->results; }
        };
    }
}
