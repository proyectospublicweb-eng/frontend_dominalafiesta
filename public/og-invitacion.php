<?php
/**
 * Generador dinámico de etiquetas Open Graph (WhatsApp, Telegram, Facebook, iMessage)
 * y miniatura optimizada (1200x630 JPEG) para las invitaciones públicas de Recuérdalo.
 */

$rawId = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
$cleanId = preg_replace('/[^0-9]/', '', $rawId);
$slugParam = isset($_GET['slug']) ? trim((string)$_GET['slug']) : '';
$guestToken = isset($_GET['guest']) ? trim((string)$_GET['guest']) : '';
$action = isset($_GET['action']) ? trim((string)$_GET['action']) : '';

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
$scheme = $isHttps ? 'https' : 'http';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'recuerdalo.com.mx';
$baseUrl = $scheme . '://' . $host;

function fetchLocalApiJson($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 4,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300 && $body) {
            $decoded = json_decode($body, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
    }

    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 3,
            'ignore_errors' => true,
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return null;
}

function fetchBinaryUrl($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_CONNECTTIMEOUT => 2,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);
        $bytes = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300 && $bytes) {
            return $bytes;
        }
    }
    return @file_get_contents($url);
}

$apiData = null;
if ($cleanId !== '' || $slugParam !== '') {
    $idOrNuevo = $cleanId !== '' ? $cleanId : 'nuevo';
    $qsParts = [];
    if ($guestToken !== '') {
        $qsParts[] = 'guest=' . rawurlencode($guestToken);
    }
    if ($slugParam !== '') {
        $qsParts[] = 'slug=' . rawurlencode($slugParam);
    }
    $apiUrl = $baseUrl . '/apiproyectoeventos/rsvp/' . rawurlencode($idOrNuevo)
        . (!empty($qsParts) ? ('?' . implode('&', $qsParts)) : '');
    $apiData = fetchLocalApiJson($apiUrl);
    if ($cleanId === '' && is_array($apiData) && isset($apiData['evento']['idevento'])) {
        $cleanId = (string)$apiData['evento']['idevento'];
    }
}

$evento = (is_array($apiData) && isset($apiData['evento']) && is_array($apiData['evento']))
    ? $apiData['evento']
    : null;
$invitado = (is_array($apiData) && isset($apiData['invitado']) && is_array($apiData['invitado']))
    ? $apiData['invitado']
    : null;

// ============================================================================
// MODO 1: SERVIR MINIATURA JPEG OPTIMIZADA PARA WHATSAPP (?action=image&id=...)
// ============================================================================
if ($action === 'image') {
    $rawImageBytes = null;
    $rawMime = 'image/jpeg';

    if ($evento && !empty($evento['imagen_portada'])) {
        $portada = trim((string)$evento['imagen_portada']);
        if (preg_match('/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i', $portada, $m)) {
            $rawMime = strtolower($m[1]);
            $decoded = base64_decode($m[2], true);
            if ($decoded !== false) {
                $rawImageBytes = $decoded;
            }
        } elseif (preg_match('/^https?:\/\//i', $portada)) {
            $fetched = fetchBinaryUrl($portada);
            if ($fetched) {
                $rawImageBytes = $fetched;
            }
        }
    }

    // Si GD está disponible, generamos una miniatura 1200x630 (recorte centrado superior del póster o tarjeta del evento)
    if (function_exists('imagecreatetruecolor') && function_exists('imagejpeg')) {
        $dstW = 1200;
        $dstH = 630;
        $canvas = imagecreatetruecolor($dstW, $dstH);

        // Fondo oscuro elegante (#142257)
        $bgDark = imagecolorallocate($canvas, 20, 34, 87);
        $accentCyan = imagecolorallocate($canvas, 21, 178, 245);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        $grayLight = imagecolorallocate($canvas, 200, 210, 235);
        imagefilledrectangle($canvas, 0, 0, $dstW, $dstH, $bgDark);

        $renderedPoster = false;
        if ($rawImageBytes && function_exists('imagecreatefromstring')) {
            $srcImg = @imagecreatefromstring($rawImageBytes);
            if ($srcImg !== false) {
                $srcW = imagesx($srcImg);
                $srcH = imagesy($srcImg);

                if ($srcW > 0 && $srcH > 0) {
                    $srcRatio = $srcW / $srcH;
                    $dstRatio = $dstW / $dstH;

                    if ($srcRatio > $dstRatio) {
                        // Imagen más ancha que 1200x630: recortar lados centrados
                        $cropH = $srcH;
                        $cropW = (int)round($srcH * $dstRatio);
                        $cropX = (int)round(($srcW - $cropW) / 2);
                        $cropY = 0;
                    } else {
                        // Imagen vertical/póster: tomar la parte media-superior (25% desde arriba)
                        $cropW = $srcW;
                        $cropH = (int)round($srcW / $dstRatio);
                        $cropX = 0;
                        $cropY = (int)round(($srcH - $cropH) * 0.25);
                    }

                    imagecopyresampled(
                        $canvas,
                        $srcImg,
                        0,
                        0,
                        $cropX,
                        $cropY,
                        $dstW,
                        $dstH,
                        $cropW,
                        $cropH
                    );
                    $renderedPoster = true;
                }
                imagedestroy($srcImg);
            }
        }

        // Si el evento no tiene imagen subida, dibujamos una tarjeta visual con los datos del evento
        if (!$renderedPoster) {
            // Marco decorativo
            imagerectangle($canvas, 28, 28, $dstW - 28, $dstH - 28, $accentCyan);
            imagerectangle($canvas, 30, 30, $dstW - 30, $dstH - 30, $accentCyan);

            $tipo = $evento && !empty($evento['tipo_evento']) ? strtoupper((string)$evento['tipo_evento']) : 'INVITACION DIGITAL';
            $nombreEv = $evento && !empty($evento['nombre']) ? (string)$evento['nombre'] : 'Recuerdalo.com.mx';
            $fechaEv = $evento && !empty($evento['fecha_evento']) ? substr((string)$evento['fecha_evento'], 0, 10) : '';
            $horaEv = $evento && !empty($evento['hora_evento']) ? substr((string)$evento['hora_evento'], 0, 5) . ' hrs' : '';
            $lugarEv = $evento && !empty($evento['lugar']) ? (string)$evento['lugar'] : '';

            $toAscii = function ($str) {
                $converted = @iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $str);
                return $converted !== false ? $converted : $str;
            };

            imagestring($canvas, 5, 80, 180, $toAscii($tipo), $accentCyan);
            imagestring($canvas, 5, 80, 240, $toAscii(mb_substr($nombreEv, 0, 65)), $white);
            $metaLine = trim($fechaEv . ($horaEv ? ' • ' . $horaEv : '') . ($lugarEv ? ' • ' . $lugarEv : ''));
            if ($metaLine !== '') {
                imagestring($canvas, 4, 80, 310, $toAscii(mb_substr($metaLine, 0, 80)), $grayLight);
            }
            imagestring($canvas, 4, 80, 420, $toAscii('Confirma tu asistencia en recuerdalo.com.mx'), $accentCyan);
        }

        ob_start();
        imagejpeg($canvas, null, 82);
        $jpegOut = ob_get_clean();
        imagedestroy($canvas);

        if ($jpegOut) {
            header('Content-Type: image/jpeg');
            header('Content-Length: ' . strlen($jpegOut));
            header('Cache-Control: public, max-age=600');
            header('Access-Control-Allow-Origin: *');
            echo $jpegOut;
            exit;
        }
    }

    // Fallback si GD no está activo pero hay bytes de imagen
    if ($rawImageBytes) {
        header('Content-Type: ' . $rawMime);
        header('Content-Length: ' . strlen($rawImageBytes));
        header('Cache-Control: public, max-age=600');
        header('Access-Control-Allow-Origin: *');
        echo $rawImageBytes;
        exit;
    }

    // Último fallback hacia el endpoint del backend
    header('Location: ' . $baseUrl . '/apiproyectoeventos/rsvp/' . rawurlencode($cleanId) . '/og-image.jpg', true, 302);
    exit;
}

// ============================================================================
// MODO 2: SERVIR INDEX.HTML CON ETIQUETAS OPEN GRAPH INYECTADAS PARA WHATSAPP
// ============================================================================
$indexPath = __DIR__ . '/index.html';
if (!file_exists($indexPath)) {
    http_response_code(404);
    echo 'index.html not found';
    exit;
}

$html = file_get_contents($indexPath);

if ($evento) {
    $nombreEvento = trim((string)($evento['nombre'] ?? 'Evento Especial'));
    $tipoEvento = trim((string)($evento['tipo_evento'] ?? 'Invitación Digital'));
    $fechaRaw = isset($evento['fecha_evento']) ? substr((string)$evento['fecha_evento'], 0, 10) : '';
    $horaRaw = isset($evento['hora_evento']) ? substr((string)$evento['hora_evento'], 0, 5) : '';
    $lugarRaw = trim((string)($evento['lugar'] ?? ''));
    $mensajeRaw = trim((string)($evento['mensaje_invitacion'] ?? ''));

    // Formatear fecha legible (DD/MM/YYYY)
    $fechaLegible = $fechaRaw;
    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $fechaRaw, $fm)) {
        $fechaLegible = $fm[3] . '/' . $fm[2] . '/' . $fm[1];
    }

    // Título personalizado si incluye invitado o general
    if ($invitado && !empty($invitado['nombre'])) {
        $ogTitle = '✨ Invitación para ' . trim((string)$invitado['nombre']) . ' — ' . $nombreEvento;
    } else {
        $ogTitle = '✨ ' . $nombreEvento . ' — ' . $tipoEvento;
    }

    // Descripción con fecha, hora, lugar y extracto del mensaje
    $detalles = [];
    if ($fechaLegible !== '') {
        $detalles[] = '📅 ' . $fechaLegible;
    }
    if ($horaRaw !== '') {
        $detalles[] = '⏰ ' . $horaRaw . ' hrs';
    }
    if ($lugarRaw !== '') {
        $detalles[] = '📍 ' . $lugarRaw;
    }
    $resumenDetalles = implode(' • ', $detalles);
    $ogDesc = $resumenDetalles !== ''
        ? $resumenDetalles . ($mensajeRaw !== '' ? ' — ' . $mensajeRaw : ' — Confirma tu asistencia en la invitación digital.')
        : ($mensajeRaw !== '' ? $mensajeRaw : 'Estás cordialmente invitado(a). Haz clic para ver la invitación y confirmar tu asistencia.');

    if (function_exists('mb_substr')) {
        $ogDesc = mb_substr($ogDesc, 0, 220);
    } else {
        $ogDesc = substr($ogDesc, 0, 220);
    }

    $requestUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : ('/invitacion/e' . $cleanId);
    $currentUrl = $baseUrl . $requestUri;

    // Hash corto de la imagen para actualizar caché de WhatsApp si el organizador cambia el póster
    $imgHash = !empty($evento['imagen_portada'])
        ? substr(md5((string)$evento['imagen_portada']), 0, 10)
        : 'default';
    $ogImageUrl = $baseUrl . '/og-invitacion.php?action=image&id=' . rawurlencode($cleanId) . '&v=' . $imgHash;

    $esc = function ($str) {
        return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    };

    $ogTags = "\n"
        . '    <!-- Open Graph / WhatsApp / Redes Sociales -->' . "\n"
        . '    <meta name="description" content="' . $esc($ogDesc) . '" />' . "\n"
        . '    <meta property="og:type" content="website" />' . "\n"
        . '    <meta property="og:site_name" content="Recuérdalo — Invitaciones Digitales" />' . "\n"
        . '    <meta property="og:locale" content="es_MX" />' . "\n"
        . '    <meta property="og:title" content="' . $esc($ogTitle) . '" />' . "\n"
        . '    <meta property="og:description" content="' . $esc($ogDesc) . '" />' . "\n"
        . '    <meta property="og:url" content="' . $esc($currentUrl) . '" />' . "\n"
        . '    <meta property="og:image" content="' . $esc($ogImageUrl) . '" />' . "\n"
        . '    <meta property="og:image:secure_url" content="' . $esc($ogImageUrl) . '" />' . "\n"
        . '    <meta property="og:image:type" content="image/jpeg" />' . "\n"
        . '    <meta property="og:image:width" content="1200" />' . "\n"
        . '    <meta property="og:image:height" content="630" />' . "\n"
        . '    <meta property="og:image:alt" content="' . $esc($nombreEvento) . '" />' . "\n"
        . '    <meta name="twitter:card" content="summary_large_image" />' . "\n"
        . '    <meta name="twitter:title" content="' . $esc($ogTitle) . '" />' . "\n"
        . '    <meta name="twitter:description" content="' . $esc($ogDesc) . '" />' . "\n"
        . '    <meta name="twitter:image" content="' . $esc($ogImageUrl) . '" />' . "\n";

    // Reemplazar <title>...</title> e inyectar antes de </head>
    $html = preg_replace(
        '/<title>.*?<\/title>/is',
        '<title>' . $esc($ogTitle) . '</title>',
        $html,
        1
    );
    $html = str_ireplace('</head>', $ogTags . '  </head>', $html);
}

header('Content-Type: text/html; charset=utf-8');
echo $html;

