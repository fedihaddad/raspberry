// ========================================
// DISPLAY SCREEN SCRIPT (index.html)
// ========================================

// Update Date and Time
function updateDateTime() {
    const now = new Date();

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const time = now.toLocaleTimeString('fr-FR', timeOptions);
    const date = now.toLocaleDateString('fr-FR', dateOptions);

    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date.charAt(0).toUpperCase() + date.slice(1);
}

// Load and Display Announcements
async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    const noAnnouncementsDiv = document.getElementById('no-announcements');

    try {
        // Get announcements from API
        const announcements = await window.announcementAPI.getAll();

        // Create data hash for comparison
        const currentDataStr = JSON.stringify(announcements);
        const currentHash = currentDataStr.length + '_' + currentDataStr.substring(0, 50);

        // Only update DOM if data changed
        if (lastDataHash === currentHash) {
            return;
        }

        // Clear container
        container.innerHTML = '';

        if (announcements.length === 0) {
            container.style.display = 'none';
            noAnnouncementsDiv.style.display = 'flex';
            lastDataHash = currentHash;
            localStorage.setItem('announcements', currentDataStr);
            return;
        }

        container.style.display = 'grid';
        noAnnouncementsDiv.style.display = 'none';

        // Sort announcements by timestamp (newest first)
        // Note: API already sorts by timestamp DESC, but good to be safe
        // announcements is already an array from API

        // Display each announcement
        announcements.forEach((announcement, index) => {
            const card = createAnnouncementCard(announcement, index);
            container.appendChild(card);
        });

        // Update local cache and hash
        localStorage.setItem('announcements', currentDataStr);
        lastDataHash = currentHash;

    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

// Create Announcement Card
function createAnnouncementCard(announcement, index) {
    const card = document.createElement('div');
    card.className = `announcement-card ${announcement.type}`;
    card.style.animationDelay = `${index * 0.1}s`;

    let cardContent = '';

    switch (announcement.type) {
        case 'absent':
            cardContent = createAbsentCard(announcement);
            break;
        case 'devoir':
            cardContent = createDevoirCard(announcement);
            break;
        case 'exclusion':
            cardContent = createExclusionCard(announcement);
            break;
        case 'other':
            cardContent = createOtherCard(announcement);
            break;
    }

    card.innerHTML = cardContent;
    return card;
}

// Create Absent Teacher Card
function createAbsentCard(data) {
    const icon = '👨‍🏫';
    // Phrase naturelle
    const title = `Le professeur ${data.professeur}`;
    const subtitle = `Matière : ${data.matiere}`;

    // Contenu narratif
    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-content">
                 <div class="card-detail">
                    <span>Est absent pour <strong>${data.period}</strong></span>
                </div>
                <div class="card-detail">
                    <span>Classes concernées: <strong>${data.classes}</strong></span>
                </div>
                 ${data.notes ? `<div class="card-detail"><span>Note: ${data.notes}</span></div>` : ''}
            </div>
        </div>
    `;
}

// Create Devoir/Exam Card
function createDevoirCard(data) {
    const icon = '📝';
    const typeLabel = data.devoirType || 'Devoir';
    const title = `${typeLabel} de ${data.matiere}`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
             <h3 class="card-title">${title}</h3>
             <div class="card-content">
                <div class="card-detail">
                    <span>Pour la classe: <strong>${data.class}</strong></span>
                </div>
                <div class="card-detail">
                    <span>Le <strong>${formatDate(data.date)}</strong> de ${data.startTime} à ${data.endTime}</span>
                </div>
                <div class="card-detail">
                    <span>Salle: <strong>${data.salle}</strong></span>
                </div>
                ${data.notes ? `<div class="card-detail"><span>${data.notes}</span></div>` : ''}
             </div>
        </div>
    `;
}

// Create Exclusion Card
function createExclusionCard(data) {
    const icon = '🚫';
    const typeLabel = data.exclusionType === 'permanent' ? 'Exclusion Définitive' : 'Exclusion Temporaire';
    const title = `L'élève ${data.student} (${data.class})`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-content">
                <div class="card-detail">
                    <span>${typeLabel} pour le motif : <strong>${data.reason}</strong></span>
                </div>
                 <div class="card-detail">
                    <span>Durée : <strong>${data.period}</strong></span>
                </div>
                ${data.notes ? `<div class="card-detail"><span>${data.notes}</span></div>` : ''}
            </div>
        </div>
    `;
}

// Create Other Announcement Card
function createOtherCard(data) {
    const icons = {
        info: 'ℹ️',
        event: '🎉',
        urgent: '⚠️',
        holiday: '🏖️',
        activity: '🎨',
        reminder: '🔔',
        director: '👔'
    };

    const icon = icons[data.category] || '📢';
    const typeLabel = data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : 'Information';

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${data.title}</h3>
             <div class="card-content">
                <div class="card-detail" style="background:transparent; border:none; padding-left:0; font-weight:500;">
                    ${data.description}
                </div>
                 ${data.date ? `<div class="card-detail"><span>Date : ${formatDate(data.date)}</span></div>` : ''}
                 ${data.location ? `<div class="card-detail"><span>Lieu : ${data.location}</span></div>` : ''}
             </div>
        </div>
    `;
}

// Format Timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Admin Access (Triple-click bottom-right corner)
let clickCount = 0;
let clickTimer = null;

document.getElementById('admin-trigger')?.addEventListener('click', function () {
    clickCount++;

    if (clickTimer) clearTimeout(clickTimer);

    if (clickCount === 3) {
        window.location.href = 'add.html';
        clickCount = 0;
    }

    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 1000);
});

// Track last known data state
// Track last known data state
let lastDataHash = '';

// Initialize
updateDateTime();
setInterval(updateDateTime, 1000);

// Initial load
loadAnnouncements();

// Poll API for updates every 5 seconds
setInterval(loadAnnouncements, 5000);
