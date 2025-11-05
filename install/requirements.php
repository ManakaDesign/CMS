<?php
/**
 * System Requirements Checker
 * Checks PHP version, extensions, and file permissions
 */

class SystemRequirements
{
    private array $requirements = [];

    public function __construct()
    {
        $this->checkAll();
    }

    private function checkAll(): void
    {
        $this->checkPHPVersion();
        $this->checkExtensions();
        $this->checkPermissions();
        $this->checkFunctions();
    }

    private function checkPHPVersion(): void
    {
        $required = '8.2.0';
        $current = PHP_VERSION;
        $passed = version_compare($current, $required, '>=');

        $this->requirements['PHP Version'] = [
            'required' => ">= $required",
            'current' => $current,
            'passed' => $passed,
        ];
    }

    private function checkExtensions(): void
    {
        $extensions = [
            'PDO' => 'Database abstraction layer',
            'pdo_mysql' => 'MySQL database driver',
            'mbstring' => 'Multibyte string support',
            'openssl' => 'OpenSSL for encryption',
            'tokenizer' => 'Token parsing',
            'xml' => 'XML processing',
            'ctype' => 'Character type checking',
            'json' => 'JSON encoding/decoding',
            'fileinfo' => 'File type detection',
            'gd' => 'Image processing (GD Library)',
        ];

        foreach ($extensions as $ext => $description) {
            $loaded = extension_loaded($ext);
            $this->requirements["Extension: $ext"] = [
                'required' => 'Enabled',
                'current' => $loaded ? 'Enabled' : 'Not installed',
                'passed' => $loaded,
                'description' => $description,
            ];
        }
    }

    private function checkPermissions(): void
    {
        $paths = [
            '../storage',
            '../bootstrap/cache',
        ];

        foreach ($paths as $path) {
            $fullPath = __DIR__ . '/' . $path;
            $writable = is_dir($fullPath) && is_writable($fullPath);

            $this->requirements["Writable: $path"] = [
                'required' => 'Writable',
                'current' => $writable ? 'Writable' : 'Not writable',
                'passed' => $writable,
            ];
        }
    }

    private function checkFunctions(): void
    {
        $functions = [
            'proc_open' => 'Process execution',
            'proc_close' => 'Process management',
            'escapeshellarg' => 'Shell argument escaping',
        ];

        foreach ($functions as $func => $description) {
            $available = function_exists($func);
            $this->requirements["Function: $func"] = [
                'required' => 'Available',
                'current' => $available ? 'Available' : 'Disabled',
                'passed' => $available,
                'description' => $description,
            ];
        }
    }

    public function getRequirements(): array
    {
        return $this->requirements;
    }

    public function allPassed(): bool
    {
        foreach ($this->requirements as $req) {
            if (!$req['passed']) {
                return false;
            }
        }
        return true;
    }

    public function getFailedRequirements(): array
    {
        return array_filter($this->requirements, fn($req) => !$req['passed']);
    }
}
