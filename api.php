<?php
/**
 * REST API for Announcements System
 * Handles CRUD operations with SQLite database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'database.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
            
        case 'POST':
            handlePost($conn);
            break;
            
        case 'PUT':
            handlePut($conn);
            break;
            
        case 'DELETE':
            handleDelete($conn);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $db->close();
}

/**
 * GET - Retrieve all announcements
 */
function handleGet($conn) {
    $query = "SELECT * FROM announcements ORDER BY timestamp DESC";
    $result = $conn->query($query);
    
    $announcements = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $announcement = json_decode($row['data'], true);
        $announcement['id'] = $row['id'];
        $announcement['timestamp'] = $row['timestamp'];
        $announcements[] = $announcement;
    }
    
    echo json_encode($announcements);
}

/**
 * POST - Create new announcement
 */
function handlePost($conn) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        return;
    }
    
    // Extract type and timestamp
    $type = $data['type'] ?? 'other';
    $timestamp = $data['timestamp'] ?? date('c');
    
    // Prepare statement
    $stmt = $conn->prepare('INSERT INTO announcements (type, data, timestamp) VALUES (:type, :data, :timestamp)');
    $stmt->bindValue(':type', $type, SQLITE3_TEXT);
    $stmt->bindValue(':data', json_encode($data), SQLITE3_TEXT);
    $stmt->bindValue(':timestamp', $timestamp, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        $id = $conn->lastInsertRowID();
        echo json_encode([
            'success' => true,
            'id' => $id,
            'message' => 'Announcement created successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create announcement']);
    }
}

/**
 * PUT - Update existing announcement
 */
function handlePut($conn) {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data or missing ID']);
        return;
    }
    
    $id = $data['id'];
    $type = $data['type'] ?? 'other';
    $timestamp = $data['timestamp'] ?? date('c');
    
    $stmt = $conn->prepare('UPDATE announcements SET type = :type, data = :data, timestamp = :timestamp, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $stmt->bindValue(':type', $type, SQLITE3_TEXT);
    $stmt->bindValue(':data', json_encode($data), SQLITE3_TEXT);
    $stmt->bindValue(':timestamp', $timestamp, SQLITE3_TEXT);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Announcement updated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update announcement']);
    }
}

/**
 * DELETE - Remove announcement
 */
function handleDelete($conn) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID parameter']);
        return;
    }
    
    $stmt = $conn->prepare('DELETE FROM announcements WHERE id = :id');
    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Announcement deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete announcement']);
    }
}
?>
