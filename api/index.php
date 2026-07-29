<?php
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
if (($_ENV['APP_ENV'] ?? '') === 'development') {
    error_log("Router: [{$_SERVER['REQUEST_METHOD']}] {$uri}");
}
$method = $_SERVER['REQUEST_METHOD'];

$tempBase  = sys_get_temp_dir() . '/kompres';
$uploadDir = $tempBase . '/uploads';
$outputDir = $tempBase . '/output';
foreach ([$tempBase, $uploadDir, $outputDir] as $d) {
    if (!is_dir($d)) mkdir($d, 0755, true);
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function cleanupOldFiles($dir, $maxAge = 3600) {
    if (!is_dir($dir)) return;
    foreach (scandir($dir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = $dir . '/' . $f;
        if (is_file($p) && time() - filemtime($p) > $maxAge) {
            @unlink($p);
        }
    }
}

function getVideoMeta($path) {
    $cmd = sprintf(
        'ffprobe -v quiet -print_format json -show_format -show_streams %s 2>/dev/null',
        escapeshellarg($path)
    );
    $output = shell_exec($cmd);
    if (!$output) return null;
    $data = json_decode($output, true);
    if (!$data) return null;

    $videoStream = null;
    foreach ($data['streams'] ?? [] as $s) {
        if ($s['codec_type'] === 'video') { $videoStream = $s; break; }
    }
    if (!$videoStream) return null;

    $w   = $videoStream['width']  ?? 0;
    $h   = $videoStream['height'] ?? 0;
    $fps = 0;
    if (isset($videoStream['r_frame_rate'])) {
        $parts = explode('/', $videoStream['r_frame_rate']);
        $fps   = (count($parts) === 2 && $parts[1] != 0)
               ? round($parts[0] / $parts[1], 2)
               : 0;
    }
    $duration = (float)($data['format']['duration'] ?? 0);

    return [
        'resolution' => $w . 'x' . $h,
        'fps'        => $fps,
        'duration'   => $duration,
    ];
}

if ($uri === '/api/upload' && $method === 'POST') {
    if (!isset($_FILES['video'])) {
        jsonResponse(['error' => 'No video file uploaded'], 400);
    }

    if ($_FILES['video']['error'] !== UPLOAD_ERR_OK) {
        $errMap = [
            UPLOAD_ERR_INI_SIZE  => 'File too large (exceeds PHP limit)',
            UPLOAD_ERR_FORM_SIZE => 'File too large (exceeds form limit)',
            UPLOAD_ERR_PARTIAL   => 'Upload was partial',
            UPLOAD_ERR_NO_FILE   => 'No file was uploaded',
        ];
        $errMsg = $errMap[$_FILES['video']['error']] ?? 'Upload failed';
        error_log("Upload error [{$_FILES['video']['error']}]: $errMsg");
        jsonResponse(['error' => $errMsg], 400);
    }

    $file    = $_FILES['video'];
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['mp4','mkv','avi','mov','webm','flv','wmv','m4v','3gp','mpeg','mpg','ts','ogv','ogg'];

    if (!in_array($ext, $allowed)) {
        jsonResponse(['error' => 'Unsupported video format'], 400);
    }

    cleanupOldFiles($uploadDir);
    cleanupOldFiles($outputDir);

    $filename = uniqid('vid_') . '.' . $ext;
    $destPath = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        jsonResponse(['error' => 'Failed to save file'], 500);
    }

    $meta    = getVideoMeta($destPath);
    $origRes = $meta['resolution'] ?? null;
    $origFps = $meta['fps']        ?? null;
    $duration= $meta['duration']   ?? null;

    $stmt = $pdo->prepare(
        "INSERT INTO compress_jobs (filename, original_size, original_resolution, original_fps, duration, status)
         VALUES (?, ?, ?, ?, ?, 'pending')"
    );
    $stmt->execute([$filename, $file['size'], $origRes, $origFps, $duration]);
    $jobId = $pdo->lastInsertId();

    jsonResponse([
        'job_id'               => (int)$jobId,
        'filename'             => $filename,
        'original_size'        => $file['size'],
        'original_resolution'  => $origRes,
        'original_fps'         => $origFps,
        'duration'             => $duration,
    ], 201);
}

if ($uri === '/api/compress' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['job_id'])) {
        jsonResponse(['error' => 'job_id required'], 400);
    }

    $stmt = $pdo->prepare("SELECT * FROM compress_jobs WHERE id = ?");
    $stmt->execute([$input['job_id']]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$job)                      jsonResponse(['error' => 'Job not found'], 404);
    if ($job['status'] !== 'pending') jsonResponse(['error' => 'Job already processed'], 400);

    $preset = $input['preset'] ?? 'balanced';

    if ($preset === 'maximum') {
        $res      = '480';
        $fps      = 24;
        $crf      = 32;
        $ffpreset = 'fast';
        $audioBr  = '96k';
        $useFilter= true;

    } elseif ($preset === 'balanced') {
        $res      = '720';
        $fps      = 30;
        $crf      = 26;
        $ffpreset = 'medium';
        $audioBr  = '128k';
        $useFilter= true;

    } elseif ($preset === 'minimum') {
        $origFps  = $job['original_fps'] ? max(1, (int)round($job['original_fps'])) : 30;
        $fps      = min($origFps, 30);
        $crf      = 22;
        $ffpreset = 'slow';
        $audioBr  = '160k';

        $origRes = $job['original_resolution'];
        if ($origRes && preg_match('/^(\d+)x(\d+)$/', $origRes, $rm)) {
            $srcH = (int)$rm[2];
            $res  = (string)min($srcH, 1080);
        } else {
            $res = '1080';
        }
        $useFilter = true;

    } elseif ($preset === 'advanced') {
        $res      = $input['resolution'] ?? '720';
        $fps      = max(1, (int)($input['fps'] ?? 30));
        $crf      = $input['crf'] ?? 26;
        $ffpreset = 'medium';
        $audioBr  = '128k';
        $useFilter= true;

    } else {
        jsonResponse(['error' => 'Invalid preset'], 400);
    }

    $inputPath      = $uploadDir . '/' . $job['filename'];
    $outputFilename = pathinfo($job['filename'], PATHINFO_FILENAME) . '_compressed.mp4';
    $outputPath     = $outputDir . '/' . $outputFilename;
    $progressFile   = $tempBase . '/progress_' . $job['id'] . '.txt';
    $resLabel       = $res . 'p';

    $stmt = $pdo->prepare(
        "UPDATE compress_jobs SET status = 'processing', resolution = ?, fps = ?, preset = ? WHERE id = ?"
    );
    $stmt->execute([$resLabel, (int)$fps, $preset, $job['id']]);

    if ($useFilter) {
        $ffCmd = sprintf(
            'ffmpeg -i %s -vf "scale=-2:%s" -r %s -c:v libx264 -crf %s -preset %s -c:a aac -b:a %s -movflags +faststart -progress %s -nostats -y %s',
            escapeshellarg($inputPath),
            escapeshellarg($res),
            escapeshellarg((string)$fps),
            escapeshellarg((string)$crf),
            escapeshellarg($ffpreset),
            escapeshellarg($audioBr),
            escapeshellarg($progressFile),
            escapeshellarg($outputPath)
        );
    } else {
        $ffCmd = sprintf(
            'ffmpeg -i %s -r %s -c:v libx264 -crf %s -preset %s -c:a aac -b:a %s -movflags +faststart -progress %s -nostats -y %s',
            escapeshellarg($inputPath),
            escapeshellarg((string)$fps),
            escapeshellarg((string)$crf),
            escapeshellarg($ffpreset),
            escapeshellarg($audioBr),
            escapeshellarg($progressFile),
            escapeshellarg($outputPath)
        );
    }

    exec($ffCmd . ' > /dev/null 2>&1 &');

    jsonResponse([
        'job_id' => (int)$job['id'],
        'status' => 'processing',
    ]);
}

if (preg_match('#^/api/status/(\d+)$#', $uri, $m) && $method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM compress_jobs WHERE id = ?");
    $stmt->execute([(int)$m[1]]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$job) jsonResponse(['error' => 'Job not found'], 404);

    $progress      = null;
    $currentStatus = $job['status'];
    $compressedSize= null;

    if ($currentStatus === 'processing') {
        $progressFile   = $tempBase . '/progress_' . $job['id'] . '.txt';
        $outputFilename = pathinfo($job['filename'], PATHINFO_FILENAME) . '_compressed.mp4';
        $outputPath     = $outputDir . '/' . $outputFilename;
        $duration       = (float)$job['duration'];
        $progress       = 0;

        if (file_exists($progressFile)) {
            $content = file_get_contents($progressFile);

            if (preg_match('/out_time_us=(\d+)/', $content, $tm)) {
                $outTimeUs = (int)$tm[1];
                if ($duration > 0) {
                    $progress = min(99, max(0, round(($outTimeUs / 1_000_000) / $duration * 100)));
                }
            }

            if (strpos($content, 'progress=end') !== false) {
                $compressedSize = file_exists($outputPath) ? filesize($outputPath) : 0;
                $stmt = $pdo->prepare(
                    "UPDATE compress_jobs SET compressed_size = ?, status = 'done' WHERE id = ?"
                );
                $stmt->execute([$compressedSize, $job['id']]);
                $currentStatus = 'done';
                $progress      = 100;
                @unlink($progressFile);
            }
        }
    }

    if ($currentStatus === 'done' && $compressedSize === null) {
        $compressedSize = $job['compressed_size'];
    }
    if ($currentStatus === 'done') $progress = 100;

    jsonResponse([
        'job_id'              => (int)$job['id'],
        'filename'            => $job['filename'],
        'original_size'       => (int)$job['original_size'],
        'original_resolution' => $job['original_resolution'],
        'original_fps'        => $job['original_fps'] ? (float)$job['original_fps'] : null,
        'duration'            => $job['duration']     ? (float)$job['duration']     : null,
        'compressed_size'     => $compressedSize      ? (int)$compressedSize        : null,
        'resolution'          => $job['resolution'],
        'fps'                 => $job['fps']          ? (int)$job['fps']            : null,
        'preset'              => $job['preset'],
        'status'              => $currentStatus,
        'progress'            => $progress,
        'created_at'          => $job['created_at'],
    ]);
}

if (preg_match('#^/api/download/(\d+)$#', $uri, $m) && $method === 'GET') {
    $stmt = $pdo->prepare("SELECT * FROM compress_jobs WHERE id = ?");
    $stmt->execute([(int)$m[1]]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$job || $job['status'] !== 'done') jsonResponse(['error' => 'File not ready'], 404);

    $outputFilename = pathinfo($job['filename'], PATHINFO_FILENAME) . '_compressed.mp4';
    $filePath       = $outputDir . '/' . $outputFilename;
    $uploadPath     = $uploadDir . '/' . $job['filename'];

    if (!file_exists($filePath)) jsonResponse(['error' => 'File not found'], 404);

    header('Content-Type: video/mp4');
    header('Content-Disposition: attachment; filename="' . $outputFilename . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Access-Control-Allow-Origin: *');
    readfile($filePath);

    @unlink($filePath);
    @unlink($uploadPath);
    @unlink($tempBase . '/progress_' . $job['id'] . '.txt');
    exit;
}

if ($uri === '/api/dev-session' && $method === 'GET') {
    $stmt    = $pdo->query("SELECT * FROM dev_session ORDER BY id DESC LIMIT 1");
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    jsonResponse($session ?: []);
}

jsonResponse(['error' => 'Not found'], 404);