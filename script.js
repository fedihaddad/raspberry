// ========================================
// DISPLAY SCREEN SCRIPT (index.html)
// ========================================

let globalReferenceDate = '2024-09-02'; // Default fallback Reference Date (Start of Week A)

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
    const date = now.toLocaleDateString('ar-TN', dateOptions);

    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;

    // Update Week Info daily (checking every second is cheap enough)
    if (now.getSeconds() === 0) {
        updateWeekInfo();
    }
}

// Calculate and Update Week A/B Info
function updateWeekInfo() {
    const weekBanner = document.getElementById('week-text');
    if (!weekBanner) return;

    // Use dynamic reference date from Config
    // Format YYYY-MM-DD ensures correct parsing
    const referenceDate = new Date(globalReferenceDate + 'T00:00:00');

    const now = new Date();
    // Reset hours to avoid timezone issues
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

    // Calculate difference in weeks
    const diffTime = today - ref;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If diffDays is negative (before start), handle gracefully
    const weeksPassed = Math.floor(diffDays / 7);

    // Logic: Even weeks from reference = A, Odd = B
    // 0 weeks (first week) -> Even -> A
    // 1 week -> Odd -> B
    const isWeekA = (Math.abs(weeksPassed) % 2 === 0);
    const weekLetter = isWeekA ? 'أ (A)' : 'ب (B)';

    // Get start (Monday) and end (Saturday) of current week
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const dayIndex = (dayOfWeek + 6) % 7; // Mon=0 .. Sun=6

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayIndex);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5); // Saturday

    const formatDateLong = (d) => d.toLocaleDateString('ar-TN', { day: 'numeric', month: 'long', year: 'numeric' });


    weekBanner.textContent = `الأسبوع ${weekLetter} - من ${formatDateLong(startOfWeek)} إلى ${formatDateLong(endOfWeek)}`;
}

// Load and Display Announcements
async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    const noAnnouncementsDiv = document.getElementById('no-announcements');

    try {
        const announcements = await window.announcementAPI.getAll();

        // 0. Extract Configuration (Find latest config_week)
        // API returns timestamp DESC, so first 'config_week' is the latest.
        const configItems = announcements.filter(a => a.type === 'config_week');
        if (configItems.length > 0) {
            const latestConfig = configItems[0];
            if (latestConfig.referenceDate) {
                // Only update if changed to verify logs
                if (globalReferenceDate !== latestConfig.referenceDate) {
                    console.log('Update Week Reference:', latestConfig.referenceDate);
                    globalReferenceDate = latestConfig.referenceDate;
                    updateWeekInfo(); // Refresh immediately
                }
            }
        }

        // 1. Separate & Filter Announcements
        // Filter out CONFIG items and Flash items for the main grid
        const standardAnnouncements = announcements.filter(a => a.type !== 'flash' && a.type !== 'config_week');
        const flashAnnouncements = announcements.filter(a => a.type === 'flash');

        // 2. Handle Flash Announcements
        checkFlash(flashAnnouncements);

        // 3. Handle Standard Announcements
        const currentDataStr = JSON.stringify(standardAnnouncements);
        const currentHash = currentDataStr.length + '_' + currentDataStr.substring(0, 50);

        if (lastDataHash === currentHash) return;

        container.innerHTML = '';

        if (standardAnnouncements.length === 0) {
            container.style.display = 'none';
            if (noAnnouncementsDiv) {
                noAnnouncementsDiv.style.display = 'flex';
            }
            lastDataHash = currentHash;
            localStorage.setItem('announcements', currentDataStr);
            return;
        }

        container.style.display = 'flex';
        if (noAnnouncementsDiv) noAnnouncementsDiv.style.display = 'none';

        standardAnnouncements.forEach((announcement, index) => {
            const card = createAnnouncementCard(announcement, index);
            container.appendChild(card);
        });

        localStorage.setItem('announcements', currentDataStr);
        lastDataHash = currentHash;

    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

// Check if any Flash announcement should be displayed
function checkFlash(flashAnnouncements) {
    const overlay = document.getElementById('flash-overlay');
    const titleEl = document.getElementById('flash-title-display');
    const messageEl = document.getElementById('flash-message-display');

    if (!overlay) return;

    // TEST MODE: Force display if URL contains ?testflash=1
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('testflash')) {
        titleEl.textContent = "تجميد ومضة (Test Mode)";
        messageEl.textContent = "هذه رسالة اختبار تظهر لأنك استخدمت ?testflash=1";
        if (!overlay.classList.contains('active')) {
            overlay.style.display = 'flex';
            void overlay.offsetWidth;
            overlay.classList.add('active');
        }
        return;
    }

    if (!flashAnnouncements || flashAnnouncements.length === 0) {
        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (!overlay.classList.contains('active')) overlay.style.display = 'none';
            }, 500);
        }
        return;
    }

    const now = new Date();
    let activeFlash = null;

    for (const flash of flashAnnouncements) {
        if (!flash.date || !flash.startTime) continue;

        try {
            const [year, month, day] = flash.date.split('-').map(Number);
            const [hours, minutes] = flash.startTime.split(':').map(Number);

            const flashStart = new Date(year, month - 1, day, hours, minutes, 0);
            const durationMin = parseInt(flash.duration || 5);
            const flashEnd = new Date(flashStart.getTime() + durationMin * 60000);

            if (now >= flashStart && now <= flashEnd) {
                activeFlash = flash;
                break;
            }
        } catch (e) {
            console.error("Error parsing flash date:", e, flash);
        }
    }

    if (activeFlash) {
        titleEl.textContent = activeFlash.title;
        messageEl.textContent = activeFlash.message;

        if (!overlay.classList.contains('active')) {
            overlay.style.display = 'flex';
            void overlay.offsetWidth; // Force Reflow
            overlay.classList.add('active');
        }
    } else {
        if (overlay.classList.contains('active')) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (!overlay.classList.contains('active')) {
                    overlay.style.display = 'none';
                }
            }, 500);
        }
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
    // 'غياب' prefix added in previous step
    const title = `غياب الأستاذ(ة) ${data.professeur}`;

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
    const action = data.exclusionType === 'permanent' ? 'رفت' : 'طرد';

    const title = `تم ${action} التلميذ(ة) ${data.student} المرسم(ة) بالقسم ${data.class}`;

    return `
        <div class="card-header">
            <span class="card-icon">${icon}</span>
        </div>
        <div class="card-body">
            <h3 class="card-title">${title}</h3>
            <div class="card-content">
                <div class="card-detail">
                    <span>السبب: <strong>${data.reason}</strong></span>
                </div>
                 <div class="card-detail">
                    // Fix 'Définitive' legacy data on the fly
                    <span>المدة: <strong>${data.period === 'Définitive' ? 'نهائي' : data.period}</strong></span>
                </div>
                ${data.notes ? `<div class="card-detail"><span>${data.notes}</span></div>` : ''}
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
    return "";
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
        window.location.href = 'login.html'; // Redirect to login, not add directly for security
        clickCount = 0;
    }

    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 1000);
});

// Track last known data state
let lastDataHash = '';

// Initialize
updateDateTime();
setInterval(updateDateTime, 1000);

// Initial load
loadAnnouncements();

// Poll API for updates every 5 seconds
setInterval(loadAnnouncements, 5000);
