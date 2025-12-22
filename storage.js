// ========================================
// API CONFIGURATION
// ========================================

// Set to true to use server-side JSON file storage
// Set to false to use localStorage (current behavior)
const USE_SERVER_STORAGE = true;

// API endpoint (will be set automatically based on current URL)
const API_ENDPOINT = window.location.origin + '/api.php';

// ========================================
// STORAGE FUNCTIONS
// ========================================

async function getAnnouncements() {
    if (!USE_SERVER_STORAGE) {
        // Use localStorage
        return JSON.parse(localStorage.getItem('announcements')) || [];
    }

    try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Error fetching announcements:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('announcements')) || [];
    }
}

async function saveAnnouncements(announcements) {
    if (!USE_SERVER_STORAGE) {
        // Use localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        return true;
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(announcements)
        });

        if (!response.ok) throw new Error('Failed to save');

        // Also save to localStorage as backup
        localStorage.setItem('announcements', JSON.stringify(announcements));
        return true;
    } catch (error) {
        console.error('Error saving announcements:', error);
        // Fallback to localStorage
        localStorage.setItem('announcements', JSON.stringify(announcements));
        return false;
    }
}

// Export for use in other scripts
window.announcementStorage = {
    get: getAnnouncements,
    save: saveAnnouncements
};
