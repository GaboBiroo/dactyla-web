<?php

declare(strict_types=1);

namespace App\Support {
    class CustomLog {
        public static function write(string $level, string $msg, array $context = []): void {
            $baseDir = 'C:/Users/Usuario/Desktop/Agencia de Tecnologia/presenca-prime';
            $logDir = $baseDir . '/storage/logs';
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0777, true);
            }
            $logFile = $logDir . '/laravel.log';
            $date = date('Y-m-d H:i:s');
            $ctxStr = !empty($context) ? json_encode($context) : '';
            $entry = "[{$date}] local.{$level}: {$msg} {$ctxStr}\n";
            @file_put_contents($logFile, $entry, FILE_APPEND);
        }
        public static function info(string $msg, array $ctx = []): void { self::write('INFO', $msg, $ctx); }
        public static function warning(string $msg, array $ctx = []): void { self::write('WARNING', $msg, $ctx); }
        public static function debug(string $msg, array $ctx = []): void { self::write('DEBUG', $msg, $ctx); }
        public static function critical(string $msg, array $ctx = []): void { self::write('CRITICAL', $msg, $ctx); }
        public static function emergency(string $msg, array $ctx = []): void { self::write('EMERGENCY', $msg, $ctx); }
    }
}

namespace Illuminate\Contracts\Queue {
    interface ShouldQueue {}
}

namespace Illuminate\Foundation\Bus {
    trait Dispatchable {
        public static function dispatch(mixed ...$arguments): static {
            $job = new static(...$arguments);
            if (method_exists($job, 'handle')) {
                $job->handle();
            }
            return $job;
        }
        public function onQueue(string $queue): static {
            return $this;
        }
    }
}

namespace Illuminate\Queue {
    trait InteractsWithQueue {}
    trait SerializesModels {}
}

namespace Illuminate\Bus {
    trait Queueable {}
}

namespace Illuminate\Support\Facades {
    use App\Support\CustomLog;
    class Log {
        public static function info(string $msg, array $ctx = []): void { CustomLog::info($msg, $ctx); }
        public static function warning(string $msg, array $ctx = []): void { CustomLog::warning($msg, $ctx); }
        public static function debug(string $msg, array $ctx = []): void { CustomLog::debug($msg, $ctx); }
        public static function critical(string $msg, array $ctx = []): void { CustomLog::critical($msg, $ctx); }
        public static function emergency(string $msg, array $ctx = []): void { CustomLog::emergency($msg, $ctx); }
    }
    class DB {
        public static function transaction(callable $callback): mixed {
            $pdo = $GLOBALS['pdo'];
            $pdo->beginTransaction();
            try {
                $result = $callback();
                $pdo->commit();
                return $result;
            } catch (\Throwable $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $e;
            }
        }
    }
}

namespace Illuminate\Http {
    class Request {
        public function query(?string $key = null, mixed $default = null): mixed {
            if (is_null($key)) return $_GET;
            return $_GET[$key] ?? $default;
        }
        public function ip(): string {
            return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        }
        public function userAgent(): string {
            return $_SERVER['HTTP_USER_AGENT'] ?? 'MetaWebhookClient';
        }
        public function header(string $key): ?string {
            $keyUpper = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
            return $_SERVER[$keyUpper] ?? $_SERVER[strtoupper(str_replace('-', '_', $key))] ?? null;
        }
        public function all(): array {
            $json = file_get_contents('php://input');
            $data = json_decode((string)$json, true);
            return is_array($data) ? $data : $_POST;
        }
        public function getContent(): string {
            return (string) file_get_contents('php://input');
        }
    }
    class Response {
        public function __construct(private string $content, private int $status = 200) {}
        public function header(string $k, string $v): static { header("{$k}: {$v}"); return $this; }
        public function send(): void {
            http_response_code($this->status);
            echo $this->content;
        }
    }
    class JsonResponse {
        public function __construct(private array $data, private int $status = 200) {}
        public function send(): void {
            http_response_code($this->status);
            header('Content-Type: application/json');
            echo json_encode($this->data);
        }
    }
    class ResponseFactory {
        public function json(array $data = [], int $status = 200): JsonResponse {
            return new JsonResponse($data, $status);
        }
    }
}

namespace {
    define('LARAVEL_START', microtime(true));

    $baseDir = 'C:/Users/Usuario/Desktop/Agencia de Tecnologia/presenca-prime';

    $logDir = $baseDir . '/storage/logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0777, true);
    }

    if (file_exists($baseDir . '/.env')) {
        $lines = file($baseDir . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
            }
        }
    }

    spl_autoload_register(function ($class) use ($baseDir) {
        $prefix = 'App\\';
        $base_dir = $baseDir . '/app/';
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        $relative_class = substr($class, $len);
        $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    });

    if (!function_exists('data_get')) {
        function data_get($target, $key, $default = null) {
            if (is_null($key)) return $target;
            foreach (explode('.', $key) as $segment) {
                if (is_array($target)) {
                    if (array_key_exists($segment, $target)) {
                        $target = $target[$segment];
                    } else if (is_numeric($segment) && array_key_exists((int)$segment, $target)) {
                        $target = $target[(int)$segment];
                    } else {
                        return $default;
                    }
                } else if (is_object($target) && isset($target->$segment)) {
                    $target = $target->$segment;
                } else {
                    return $default;
                }
            }
            return $default;
        }
    }

    if (!function_exists('config')) {
        function config($key, $default = null) {
            $configs = [
                'services.meta.verify_token' => getenv('META_VERIFY_TOKEN') ?: 'dactyla_starter_token_2026',
                'services.meta.app_secret' => getenv('META_APP_SECRET') ?: '2a861d90871e534cbbc825715f29af94',
            ];
            return $configs[$key] ?? $default;
        }
    }

    function response($content = null, $status = 200) {
        if (is_null($content)) {
            return new \Illuminate\Http\ResponseFactory();
        }
        if (is_array($content)) {
            return new \Illuminate\Http\JsonResponse($content, $status);
        }
        return new \Illuminate\Http\Response((string)$content, $status);
    }

    try {
        $dbConnection = getenv('DB_CONNECTION') ?: 'pgsql';

        if ($dbConnection === 'pgsql') {
            $dbHost = getenv('DB_HOST') ?: 'db.tylnhpxleyummyzsqinc.supabase.co';
            $dbPort = getenv('DB_PORT') ?: '5432';
            $dbName = getenv('DB_DATABASE') ?: 'postgres';
            $dbUser = getenv('DB_USERNAME') ?: 'postgres';
            $dbPass = getenv('DB_PASSWORD') ?: '';
            
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
            
            $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName};sslmode=require";
            $GLOBALS['pdo'] = new \PDO($dsn, $dbUser, $dbPass, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
        } else {
            $sqliteFile = $baseDir . '/database/database.sqlite';
            if (!is_dir(dirname($sqliteFile))) {
                @mkdir(dirname($sqliteFile), 0777, true);
            }
            if (!file_exists($sqliteFile)) {
                @touch($sqliteFile);
            }

            $GLOBALS['pdo'] = new \PDO('sqlite:' . $sqliteFile);
            $GLOBALS['pdo']->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        }
    } catch (\Throwable $e) {
        \App\Support\CustomLog::critical("[DB CONNECT ERR] " . $e->getMessage());
    }

    if (php_sapi_name() === 'cli' && empty($_SERVER['REQUEST_URI'])) {
        return;
    }

    try {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        \App\Support\CustomLog::info("[HTTP Request Entry] {$method} {$uri}", [
            'query' => $_GET,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'hmac_header' => $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? 'MISSING'
        ]);

        $request = new \Illuminate\Http\Request();
        $controller = new \App\Http\Controllers\Webhook\MetaWebhookController();

        if ($method === 'GET' && ($uri === '/api/webhook/meta' || $uri === '/webhook/meta')) {
            $res = $controller->verify($request);
            $res->send();
            exit;
        }

        if ($method === 'POST' && ($uri === '/api/webhook/meta' || $uri === '/webhook/meta')) {
            $res = $controller->handle($request);
            $res->send();
            exit;
        }

        \App\Support\CustomLog::warning("[HTTP 404] Rota não encontrada: {$method} {$uri}");
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'uri' => $uri]);
    } catch (\Throwable $e) {
        \App\Support\CustomLog::critical("[HTTP SERVER ERROR] " . $e->getMessage() . "\n" . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'details' => $e->getMessage()]);
    }
}
