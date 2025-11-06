<?php
/**
 * CMS Web Installer - Extracts ZIP Package on Server
 * Upload this file + cms.zip to your web server, then open in browser
 */

session_start();

// Configuration
$zipFileName = 'cms.zip';
$extractPath = __DIR__;
$maxExecutionTime = 300; // 5 minutes
$memoryLimit = '512M';

// Increase limits for extraction
@ini_set('max_execution_time', $maxExecutionTime);
@ini_set('memory_limit', $memoryLimit);

// Check if already extracted
if (file_exists($extractPath . '/install/setup.php')) {
    header('Location: /install/setup.php');
    exit;
}

// Handle POST request (extraction)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['extract'])) {
    extractZipFile();
    exit;
}

// Display upload/extract interface
displayInterface();

function extractZipFile() {
    global $zipFileName, $extractPath;

    $zipPath = $extractPath . '/' . $zipFileName;

    // Check if ZIP file exists
    if (!file_exists($zipPath)) {
        jsonResponse(false, "ZIP file not found: $zipFileName. Please upload it to the same directory as this installer.");
        return;
    }

    // Check if ZipArchive is available
    if (!class_exists('ZipArchive')) {
        jsonResponse(false, "PHP ZipArchive extension is not installed. Please ask your hosting provider to enable it.");
        return;
    }

    $zip = new ZipArchive();
    $result = $zip->open($zipPath);

    if ($result !== true) {
        jsonResponse(false, "Failed to open ZIP file. Error code: $result");
        return;
    }

    $totalFiles = $zip->numFiles;
    $extracted = 0;
    $errors = [];

    // Extract files one by one to show progress
    for ($i = 0; $i < $totalFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $fileInfo = $zip->statIndex($i);

        // Skip directories
        if (substr($filename, -1) === '/') {
            continue;
        }

        // Create directory if needed
        $dirname = dirname($extractPath . '/' . $filename);
        if (!is_dir($dirname)) {
            @mkdir($dirname, 0755, true);
        }

        // Extract file
        $content = $zip->getFromIndex($i);
        if ($content === false) {
            $errors[] = "Failed to extract: $filename";
            continue;
        }

        $success = @file_put_contents($extractPath . '/' . $filename, $content);
        if ($success === false) {
            $errors[] = "Failed to write: $filename";
            continue;
        }

        $extracted++;

        // Send progress update every 100 files
        if ($extracted % 100 === 0) {
            $progress = round(($extracted / $totalFiles) * 100);
            echo json_encode([
                'progress' => true,
                'current' => $extracted,
                'total' => $totalFiles,
                'percent' => $progress
            ]) . "\n";
            flush();
        }
    }

    $zip->close();

    // Optional: Delete ZIP file after extraction
    // @unlink($zipPath);

    if (count($errors) > 0) {
        jsonResponse(true, "Extraction completed with " . count($errors) . " errors. Check permissions.", [
            'extracted' => $extracted,
            'total' => $totalFiles,
            'errors' => array_slice($errors, 0, 10) // Show first 10 errors
        ]);
    } else {
        jsonResponse(true, "Successfully extracted $extracted files!", [
            'extracted' => $extracted,
            'total' => $totalFiles
        ]);
    }
}

function jsonResponse($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));
    exit;
}

function displayInterface() {
    global $zipFileName, $extractPath;

    $zipPath = $extractPath . '/' . $zipFileName;
    $zipExists = file_exists($zipPath);
    $zipSize = $zipExists ? round(filesize($zipPath) / 1024 / 1024, 2) . ' MB' : 'Not found';

    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CMS Web Installer</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .container {
                max-width: 600px;
                width: 100%;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .header {
                background: #667eea;
                color: white;
                padding: 30px;
                text-align: center;
            }

            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }

            .content {
                padding: 40px;
            }

            .status-box {
                background: #f7fafc;
                border-left: 4px solid #4299e1;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }

            .status-box.success {
                border-color: #48bb78;
                background: #f0fff4;
            }

            .status-box.error {
                border-color: #f56565;
                background: #fff5f5;
            }

            .status-item {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .status-item:last-child {
                border-bottom: none;
            }

            .status-label {
                font-weight: 600;
                color: #2d3748;
            }

            .status-value {
                color: #4a5568;
            }

            .status-value.success {
                color: #48bb78;
                font-weight: 600;
            }

            .status-value.error {
                color: #f56565;
                font-weight: 600;
            }

            .progress-bar {
                width: 100%;
                height: 30px;
                background: #e2e8f0;
                border-radius: 15px;
                overflow: hidden;
                margin: 20px 0;
                display: none;
            }

            .progress-bar.active {
                display: block;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                transition: width 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
            }

            .button {
                display: inline-block;
                padding: 12px 30px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .button-primary {
                background: #667eea;
                color: white;
            }

            .button-primary:hover {
                background: #5568d3;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .button-primary:disabled {
                background: #cbd5e0;
                cursor: not-allowed;
                transform: none;
            }

            .button-success {
                background: #48bb78;
                color: white;
            }

            .button-success:hover {
                background: #38a169;
            }

            .instructions {
                background: #fef5e7;
                border-left: 4px solid #f39c12;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }

            .instructions h3 {
                color: #d68910;
                margin-bottom: 10px;
            }

            .instructions ol {
                margin-left: 20px;
                color: #7d6608;
            }

            .instructions li {
                margin: 8px 0;
            }

            code {
                background: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }

            #message {
                display: none;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }

            #message.success {
                background: #f0fff4;
                color: #22543d;
                border: 1px solid #9ae6b4;
            }

            #message.error {
                background: #fff5f5;
                color: #742a2a;
                border: 1px solid #fc8181;
            }

            .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 CMS Web Installer</h1>
                <p>Extract CMS package directly on your server</p>
            </div>

            <div class="content">
                <div class="status-box <?= $zipExists ? 'success' : 'error' ?>">
                    <h3 style="margin-bottom: 15px;">📦 Package Status</h3>
                    <div class="status-item">
                        <span class="status-label">ZIP File:</span>
                        <span class="status-value <?= $zipExists ? 'success' : 'error' ?>">
                            <?= $zipExists ? '✓ Found' : '✗ Not Found' ?>
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Filename:</span>
                        <span class="status-value"><?= htmlspecialchars($zipFileName) ?></span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Size:</span>
                        <span class="status-value"><?= $zipSize ?></span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">ZipArchive Extension:</span>
                        <span class="status-value <?= class_exists('ZipArchive') ? 'success' : 'error' ?>">
                            <?= class_exists('ZipArchive') ? '✓ Available' : '✗ Not Available' ?>
                        </span>
                    </div>
                </div>

                <?php if (!$zipExists): ?>
                <div class="instructions">
                    <h3>📋 Installation Instructions</h3>
                    <ol>
                        <li>Download <code><?= htmlspecialchars($zipFileName) ?></code> from GitHub</li>
                        <li>Upload it to the same directory as this <code>web-installer.php</code> file</li>
                        <li>Refresh this page</li>
                        <li>Click "Extract CMS Package"</li>
                    </ol>
                </div>
                <?php else: ?>
                <div class="instructions">
                    <h3>✨ Ready to Extract!</h3>
                    <p>Click the button below to extract the CMS package. This may take a few minutes depending on your server speed.</p>
                </div>
                <?php endif; ?>

                <div class="progress-bar" id="progressBar">
                    <div class="progress-fill" id="progressFill">0%</div>
                </div>

                <div id="message"></div>

                <div style="text-align: center; margin-top: 30px;">
                    <?php if ($zipExists && class_exists('ZipArchive')): ?>
                        <button onclick="startExtraction()" class="button button-primary" id="extractBtn">
                            Extract CMS Package
                        </button>
                    <?php else: ?>
                        <button class="button button-primary" disabled>
                            <?= !$zipExists ? 'Upload ZIP File First' : 'ZipArchive Extension Required' ?>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <script>
            function startExtraction() {
                const btn = document.getElementById('extractBtn');
                const progressBar = document.getElementById('progressBar');
                const progressFill = document.getElementById('progressFill');
                const message = document.getElementById('message');

                btn.disabled = true;
                btn.innerHTML = '<span class="spinner"></span> Extracting...';
                progressBar.classList.add('active');
                message.style.display = 'none';

                fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'extract=1'
                })
                .then(response => response.json())
                .then(data => {
                    progressFill.style.width = '100%';
                    progressFill.textContent = '100%';

                    if (data.success) {
                        message.className = 'success';
                        message.textContent = '✓ ' + data.message;
                        message.style.display = 'block';

                        btn.className = 'button button-success';
                        btn.disabled = false;
                        btn.textContent = '✓ Continue to Installation';
                        btn.onclick = function() {
                            window.location.href = '/install/setup.php';
                        };
                    } else {
                        message.className = 'error';
                        message.textContent = '✗ ' + data.message;
                        message.style.display = 'block';

                        btn.disabled = false;
                        btn.textContent = 'Try Again';
                    }
                })
                .catch(error => {
                    message.className = 'error';
                    message.textContent = '✗ Error: ' + error.message;
                    message.style.display = 'block';

                    btn.disabled = false;
                    btn.textContent = 'Try Again';
                });
            }
        </script>
    </body>
    </html>
    <?php
}
