// ========================================
// API CONFIGURATION - SQLite Backend
// ========================================

const API_ENDPOINT = window.location.origin + '/api.php';

// ========================================
// STORAGE FUNCTIONS - SQLite Backend
// ========================================

/**
 * Get all announcements from database
 */
async function getAnnouncements() {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Python server often returns 501/405 for PHP files, OR returns the file content (200 OK)
        if (!response.ok) {
            console.warn('⚠️ API Error (Status ' + response.status + '). Fallback to localStorage.');
            throw new Error('SERVER_NO_PHP');
        }

        const text = await response.text();

        // Check if content is actually HTML/PHP code instead of JSON
        if (text.trim().startsWith('<')) {
            console.warn('⚠️ Server returned HTML/PHP code. Fallback to localStorage.');
            throw new Error('SERVER_NO_PHP');
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn('⚠️ Invalid JSON. Fallback to localStorage.');
            throw new Error('SERVER_NO_PHP');
        }

        // Also cache in localStorage as backup
        localStorage.setItem('announcements_cache', JSON.stringify(data));

        return data;
    } catch (error) {
        // Always fallback on error in dev mode
        console.log('🔧 Mode Test (LocalStorage Active)');
        const cache = localStorage.getItem('announcements'); // Use main storage for fallback
        return cache ? JSON.parse(cache) : [];
    }
}

/**
 * Helper to check if we are in fallback mode
 */
function isFallbackMode() {
    // If we detected no PHP before, or if API endpoint returns 405/501 (common for static servers on POST)
    return false; // Dynamic check is better inside try/catch
}

/**
 * Create new announcement
 */
async function createAnnouncement(announcement) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcement)
        });

        if (!response.ok) {
            if (response.status === 405 || response.status === 501) throw new Error('SERVER_NO_PHP');
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response is JSON (not PHP code)
        const text = await response.text();
        try { JSON.parse(text); } catch (e) { throw new Error('SERVER_NO_PHP'); }

        return JSON.parse(text);
    } catch (error) {
        if (error.message === 'SERVER_NO_PHP') {
            // Fallback: Save to localStorage
            console.log('🔧 Fallback Create (LocalStorage)');
            const list = JSON.parse(localStorage.getItem('announcements')) || [];
            announcement.id = Date.now(); // Simulate ID
            list.push(announcement);
            localStorage.setItem('announcements', JSON.stringify(list));
            return { success: true, id: announcement.id };
        }
        console.error('Error creating announcement:', error);
        throw error;
    }
}

/**
 * Update existing announcement
 */
async function updateAnnouncement(announcement) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcement)
        });

        if (!response.ok) {
            if (response.status === 405 || response.status === 501) throw new Error('SERVER_NO_PHP');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'SERVER_NO_PHP') {
            // Fallback: Update localStorage
            console.log('🔧 Fallback Update (LocalStorage)');
            const list = JSON.parse(localStorage.getItem('announcements')) || [];
            const index = list.findIndex(a => a.id == announcement.id);
            if (index !== -1) {
                list[index] = announcement;
                localStorage.setItem('announcements', JSON.stringify(list));
                return { success: true };
            }
            throw new Error('Announcement not found in local cache');
        }
        console.error('Error updating announcement:', error);
        throw error;
    }
}

/**
 * Delete announcement
 */
async function deleteAnnouncement(id) {
    try {
        const response = await fetch(`${API_ENDPOINT}?id=${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            if (response.status === 405 || response.status === 501) throw new Error('SERVER_NO_PHP');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error.message === 'SERVER_NO_PHP') {
            // Fallback: Delete from localStorage
            console.log('🔧 Fallback Delete (LocalStorage)');
            const list = JSON.parse(localStorage.getItem('announcements')) || [];
            const newList = list.filter(a => a.id != id);
            localStorage.setItem('announcements', JSON.stringify(newList));
            return { success: true };
        }
        console.error('Error deleting announcement:', error);
        throw error;
    }
}

// Export for use in other scripts
window.announcementAPI = {
    getAll: getAnnouncements,
    create: createAnnouncement,
    update: updateAnnouncement,
    delete: deleteAnnouncement
};

// Backward compatibility with old localStorage code
window.announcementStorage = {
    get: getAnnouncements,
    save: async (announcements) => {
        // This is now handled by individual create/update calls
        console.warn('Direct save is deprecated. Use create/update methods instead.');
        return true;
    }
};
