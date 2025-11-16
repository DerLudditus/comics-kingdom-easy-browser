<?php
/**
 * Comics Kingdom Easy Browser - PHP Proxy for WordPress
 * 
 * This script fetches comics from ComicsKingdom.com server-side,
 * bypassing browser CORS restrictions.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the URL parameter
$url = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($url)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing url parameter'
    ]);
    exit;
}

// Validate URL is from Comics Kingdom
if (strpos($url, 'comicskingdom.com') === false) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid URL - must be from comicskingdom.com'
    ]);
    exit;
}

try {
    // Fetch the page with proper headers
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
        'Connection: keep-alive'
    ]);
    
    $html = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("Failed to fetch page: $error");
    }
    
    if ($httpCode !== 200) {
        throw new Exception("HTTP error: $httpCode");
    }
    
    if (empty($html)) {
        throw new Exception("Empty response from server");
    }
    
    // Check if this is a 404 page
    if (strpos($html, "404") !== false && (stripos($html, "not found") !== false || stripos($html, "page not found") !== false)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Comic not available for this date'
        ]);
        exit;
    }
    
    // Extract comic image URL and actual date from page
    $imageUrl = extractComicImage($html);
    $comicDate = extractComicDate($html, $url);
    
    if ($imageUrl) {
        // Make URL absolute if needed
        if (strpos($imageUrl, '//') === 0) {
            $imageUrl = 'https:' . $imageUrl;
        } elseif (strpos($imageUrl, '/') === 0) {
            $imageUrl = 'https://www.gocomics.com' . $imageUrl;
        }
        
        echo json_encode([
            'success' => true,
            'imageUrl' => $imageUrl,
            'comicDate' => $comicDate
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Comic image not found'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Extract comic image URL from HTML
 */
function extractComicImage($html) {
    // Pattern 1: Look for meta og:image (property before content)
    if (preg_match('/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']/', $html, $matches)) {
        return $matches[1];
    }
    
    // Pattern 2: Look for meta og:image (content before property)
    if (preg_match('/<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/', $html, $matches)) {
        return $matches[1];
    }
    
    return null;
}

/**
 * Extract the actual date of the comic from the page
 */
function extractComicDate($html, $requestedUrl) {
    // Try to extract from the canonical URL
    if (preg_match('/<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']/', $html, $matches)) {
        $url = $matches[1];
        // Extract date from URL like: .../comic-name/2024-10-30
        if (preg_match('/\/(\d{4})-(\d{2})-(\d{2})/', $url, $dateMatches)) {
            return $dateMatches[1] . '-' . $dateMatches[2] . '-' . $dateMatches[3];
        }
    }
    
    // Fallback: extract from requested URL
    if (preg_match('/\/(\d{4})-(\d{2})-(\d{2})/', $requestedUrl, $dateMatches)) {
        return $dateMatches[1] . '-' . $dateMatches[2] . '-' . $dateMatches[3];
    }
    
    return null;
}
?>
