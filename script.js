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

    const time = now.toLocaleTimeString('fr-FR', timeOptions); // Heure reste format 24h
    const date = now.toLocaleDateString('ar-TN', dateOptions); // Date en Arabe

    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

// Load and Display Announcements
async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    const noAnnouncementsDiv = document.getElementById('no-announcements');

    try {
        const announcements = await window.announcementAPI.getAll();
        const currentDataStr = JSON.stringify(announcements);
        const currentHash = currentDataStr.length + '_' + currentDataStr.substring(0, 50);

        if (lastDataHash === currentHash) return;

        container.innerHTML = '';

        if (announcements.length === 0) {
            container.style.display = 'none';
            if (noAnnouncementsDiv) {
                noAnnouncementsDiv.style.display = 'flex';
                noAnnouncementsDiv.innerHTML = '<h1>لا توجد إعلانات حالياً</h1>';
            }
            lastDataHash = currentHash;
            localStorage.setItem('announcements', currentDataStr);
            return;
        }

        container.style.display = 'flex'; // Flex column from CSS
        if (noAnnouncementsDiv) noAnnouncementsDiv.style.display = 'none';

        announcements.forEach((announcement, index) => {
            const card = createAnnouncementCard(announcement, index);
            container.appendChild(card);
        });

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
        case 'absent': cardContent = createAbsentCard(announcement); break;
        case 'devoir': cardContent = createDevoirCard(announcement); break;
        case 'exclusion': cardContent = createExclusionCard(announcement); break;
        case 'other': cardContent = createOtherCard(announcement); break;
    }

    card.innerHTML = cardContent;
    return card;
}

// Create Absent Teacher Card (Arabic)
function createAbsentCard(data) {
    const icon = '👨‍🏫';
    const title = `الأستاذ(ة) ${data.professeur}`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-content">
                 <div class="card-detail">
                    <span>غياب مادة <strong>${data.matiere}</strong></span>
                </div>
                 <div class="card-detail">
                    <span>المدة: <strong>${data.period}</strong></span>
                </div>
                <div class="card-detail">
                    <span>الأقسام: <strong>${data.classes}</strong></span>
                </div>
                 ${data.notes ? `<div class="card-detail"><span>ملاحظة: ${data.notes}</span></div>` : ''}
            </div>
        </div>
    `;
}

// Create Devoir/Exam Card (Arabic)
function createDevoirCard(data) {
    const icon = '📝';
    const typeLabel = data.devoirType === 'Contrôle' ? 'فرض مراقبة' : 'فرض تأليفي';
    const title = `${typeLabel} في ${data.matiere}`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
             <h3 class="card-title">${title}</h3>
             <div class="card-content">
                <div class="card-detail">
                    <span>القسم: <strong>${data.class}</strong></span>
                </div>
                <div class="card-detail">
                    <span>تاريخ: <strong>${formatDate(data.date)}</strong></span>
                </div>
                <div class="card-detail">
                    <span>التوقيت: من ${data.startTime} إلى ${data.endTime}</span>
                </div>
                <div class="card-detail">
                    <span>القاعة: <strong>${data.salle}</strong></span>
                </div>
             </div>
        </div>
    `;
}

// Create Exclusion Card (Arabic)
function createExclusionCard(data) {
    const icon = '🚫';
    const typeLabel = data.exclusionType === 'permanent' ? 'طرد نهائي' : 'طرد مؤقت';
    const title = `التلميذ(ة) ${data.student} (${data.class})`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-content">
                <div class="card-detail">
                    <span>${typeLabel} - السبب: <strong>${data.reason}</strong></span>
                </div>
                 <div class="card-detail">
                    <span>المدة: <strong>${data.period}</strong></span>
                </div>
            </div>
        </div>
    `;
}

// Create Other Announcement Card (Arabic)
function createOtherCard(data) {
    const icons = { info: 'ℹ️', event: '🎉', urgent: '⚠️', holiday: '🏖️', activity: '🎨', reminder: '🔔', director: '👔' };
    const icon = icons[data.category] || '📢';

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${data.title}</h3>
             <div class="card-content">
                <div class="card-detail">
                    ${data.description}
                </div>
                 ${data.date ? `<div class="card-detail"><span>التاريخ: ${formatDate(data.date)}</span></div>` : ''}
                 ${data.location ? `<div class="card-detail"><span>المكان: ${data.location}</span></div>` : ''}
             </div>
        </div>
    `;
}

function formatTimestamp(timestamp) {
    return ""; // Hidden in new design
}

// Format Date Arabic
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-TN', {
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
