<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = __DIR__ . '/data/announcements.json';
$dataDir = __DIR__ . '/data';

// Create data directory if it doesn't exist
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Initialize file if it doesn't exist
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read announcements
        $data = file_get_contents($dataFile);
        echo $data;
        break;
        
    case 'POST':
        // Save announcements
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if ($data !== null) {
            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
