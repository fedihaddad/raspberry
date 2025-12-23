<?php
/**
 * Database Configuration and Setup
 * SQLite Database for Announcements System
 */

class Database {
    private $db;
    private $dbPath;
    
    public function __construct() {
        $this->dbPath = __DIR__ . '/data/announcements.db';
        $this->initDatabase();
    }
    
    private function initDatabase() {
        // Create data directory if it doesn't exist
        $dataDir = dirname($this->dbPath);
        if (!file_exists($dataDir)) {
            mkdir($dataDir, 0777, true);
        }
        
        // Open SQLite database
        $this->db = new SQLite3($this->dbPath);
        
        // Set permissions
        chmod($this->dbPath, 0666);
        
        // Create tables if they don't exist
        $this->createTables();
    }
    
    private function createTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_type ON announcements(type);
        CREATE INDEX IF NOT EXISTS idx_timestamp ON announcements(timestamp DESC);
        ";
        
        $this->db->exec($sql);
    }
    
    public function getConnection() {
        return $this->db;
    }
    
    public function close() {
        if ($this->db) {
            $this->db->close();
        }
    }
}
?>
