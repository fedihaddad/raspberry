// ========================================
// ADMIN FORM SCRIPT (add.html)
// ========================================

let currentType = 'absent';
let editMode = false;
let editIndex = -1;
let currentAnnouncementId = null; // Track ID for API updates
let cachedAnnouncements = []; // Store fetched announcements

// Select Announcement Type
function selectType(type) {
  currentType = type;

  // Update button states
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`).classList.add('active');

  // Show corresponding form
  document.querySelectorAll('.announcement-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(`form-${type}`).classList.add('active');
}

// ========================================
// ABSENT TEACHER FORM
// ========================================
const absentForm = document.getElementById('form-absent');
const startDateInput = document.getElementById('absent-start');
const endDateInput = document.getElementById('absent-end');
const calculatedPeriod = document.getElementById('calculated-period');

// Calculate period between dates
function calculatePeriod() {
  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (!startDateInput.value || !endDateInput.value) {
    calculatedPeriod.textContent = 'Sélectionnez les dates pour calculer la période';
    calculatedPeriod.style.borderColor = 'var(--primary)';
    return;
  }

  if (endDate < startDate) {
    calculatedPeriod.textContent = '⚠️ La date de fin doit être après la date de début';
    calculatedPeriod.style.borderColor = 'var(--danger)';
    calculatedPeriod.style.color = 'var(--danger)';
    return;
  }

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

  const startFormatted = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endFormatted = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  let periodText = `Du ${startFormatted} au ${endFormatted}`;
  if (diffDays === 1) {
    periodText += ` (1 jour)`;
  } else {
    periodText += ` (${diffDays} jours)`;
  }

  calculatedPeriod.textContent = `✓ ${periodText}`;
  calculatedPeriod.style.borderColor = 'var(--success)';
  calculatedPeriod.style.color = 'var(--success)';
}

startDateInput?.addEventListener('change', calculatePeriod);
endDateInput?.addEventListener('change', calculatePeriod);

// Handle Absent Form Submission
absentForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);

  if (endDate < startDate) {
    alert('⚠️ La date de fin doit être après la date de début');
    return;
  }

  const professeur = document.getElementById('absent-prof').value.trim();
  const matiere = document.getElementById('absent-matiere').value.trim();
  const classes = document.getElementById('absent-classes').value.trim();
  const notes = document.getElementById('absent-notes').value.trim();

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const startFormatted = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endFormatted = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  let period = `Du ${startFormatted} au ${endFormatted}`;
  if (diffDays === 1) {
    period += ` (1 jour)`;
  } else {
    period += ` (${diffDays} jours)`;
  }

  const announcement = {
    type: 'absent',
    professeur,
    matiere,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    period,
    classes,
    notes,
    timestamp: new Date().toISOString()
  };

  saveAnnouncement(announcement);
});

// ========================================
// DEVOIR/EXAM FORM
// ========================================
const devoirForm = document.getElementById('form-devoir');
const startTimeInput = document.getElementById('devoir-start-time');
const endTimeInput = document.getElementById('devoir-end-time');
const calculatedDuration = document.getElementById('calculated-duration');

// Calculate duration between times
function calculateDuration() {
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (!startTime || !endTime) {
    calculatedDuration.textContent = 'Sélectionnez les heures pour calculer la durée';
    calculatedDuration.style.borderColor = 'var(--primary)';
    return;
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    calculatedDuration.textContent = '⚠️ L\'heure de fin doit être après l\'heure de début';
    calculatedDuration.style.borderColor = 'var(--danger)';
    calculatedDuration.style.color = 'var(--danger)';
    return;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let durationText = '✓ Durée: ';
  if (hours > 0) {
    durationText += `${hours}h`;
    if (minutes > 0) durationText += ` ${minutes}min`;
  } else {
    durationText += `${minutes}min`;
  }

  calculatedDuration.textContent = durationText;
  calculatedDuration.style.borderColor = 'var(--success)';
  calculatedDuration.style.color = 'var(--success)';
}

startTimeInput?.addEventListener('change', calculateDuration);
endTimeInput?.addEventListener('change', calculateDuration);

// Handle Devoir Form Submission
devoirForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    alert('⚠️ L\'heure de fin doit être après l\'heure de début');
    return;
  }

  const diffMinutes = endMinutes - startMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  let duration = '';
  if (hours > 0) {
    duration += `${hours}h`;
    if (minutes > 0) duration += ` ${minutes}min`;
  } else {
    duration += `${minutes}min`;
  }

  const devoirType = document.getElementById('devoir-type').value;
  const matiere = document.getElementById('devoir-matiere').value.trim();
  const devoirClass = document.getElementById('devoir-class').value.trim();
  const salle = document.getElementById('devoir-salle').value.trim();
  const date = document.getElementById('devoir-date').value;
  const notes = document.getElementById('devoir-notes').value.trim();

  const announcement = {
    type: 'devoir',
    devoirType,
    matiere,
    class: devoirClass,
    salle,
    date,
    startTime,
    endTime,
    duration,
    notes,
    timestamp: new Date().toISOString()
  };

  saveAnnouncement(announcement);
});

// ========================================
// STUDENT EXCLUSION FORM
// ========================================
const exclusionForm = document.getElementById('form-exclusion');
const exclusionStartInput = document.getElementById('exclusion-start');
const exclusionEndInput = document.getElementById('exclusion-end');
const calculatedExclusionPeriod = document.getElementById('calculated-exclusion-period');

// Toggle exclusion dates based on type
function toggleExclusionDates() {
  const exclusionType = document.getElementById('exclusion-type').value;
  const datesSection = document.getElementById('exclusion-dates');

  if (exclusionType === 'temporary') {
    datesSection.style.display = 'block';
    exclusionStartInput.required = true;
    exclusionEndInput.required = true;
  } else {
    datesSection.style.display = 'none';
    exclusionStartInput.required = false;
    exclusionEndInput.required = false;
  }
}

// Calculate exclusion period
function calculateExclusionPeriod() {
  const startDate = new Date(exclusionStartInput.value);
  const endDate = new Date(exclusionEndInput.value);

  if (!exclusionStartInput.value || !exclusionEndInput.value) {
    calculatedExclusionPeriod.textContent = 'Sélectionnez les dates pour calculer la période';
    calculatedExclusionPeriod.style.borderColor = 'var(--primary)';
    calculatedExclusionPeriod.style.color = 'var(--primary)';
    return;
  }

  if (endDate < startDate) {
    calculatedExclusionPeriod.textContent = '⚠️ La date de fin doit être après la date de début';
    calculatedExclusionPeriod.style.borderColor = 'var(--danger)';
    calculatedExclusionPeriod.style.color = 'var(--danger)';
    return;
  }

  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const startFormatted = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endFormatted = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  let periodText = `Du ${startFormatted} au ${endFormatted}`;
  if (diffDays === 1) {
    periodText += ` (1 jour)`;
  } else {
    periodText += ` (${diffDays} jours)`;
  }

  calculatedExclusionPeriod.textContent = `✓ ${periodText}`;
  calculatedExclusionPeriod.style.borderColor = 'var(--success)';
  calculatedExclusionPeriod.style.color = 'var(--success)';
}

exclusionStartInput?.addEventListener('change', calculateExclusionPeriod);
exclusionEndInput?.addEventListener('change', calculateExclusionPeriod);

// Handle Exclusion Form Submission
exclusionForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const student = document.getElementById('exclusion-student').value.trim();
  const studentClass = document.getElementById('exclusion-class').value.trim();
  const reason = document.getElementById('exclusion-reason').value.trim();
  const exclusionType = document.getElementById('exclusion-type').value;
  const notes = document.getElementById('exclusion-notes').value.trim();

  let period = '';
  let startDate = '';
  let endDate = '';

  if (exclusionType === 'temporary') {
    startDate = exclusionStartInput.value;
    endDate = exclusionEndInput.value;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert('⚠️ La date de fin doit être après la date de début');
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const startFormatted = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    const endFormatted = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    period = `Du ${startFormatted} au ${endFormatted}`;
    if (diffDays === 1) {
      period += ` (1 jour)`;
    } else {
      period += ` (${diffDays} jours)`;
    }
  } else {
    period = 'نهائي'; // Changed from 'Définitive' to Arabic
  }

  const announcement = {
    type: 'exclusion',
    student,
    class: studentClass,
    reason,
    exclusionType,
    period,
    startDate,
    endDate,
    notes,
    timestamp: new Date().toISOString()
  };

  saveAnnouncement(announcement);
});

// ========================================
// OTHER ANNOUNCEMENT FORM
// ========================================
const otherForm = document.getElementById('form-other');

otherForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('other-title').value.trim();
  const category = document.getElementById('other-category').value;
  const description = document.getElementById('other-description').value.trim();
  const date = document.getElementById('other-date').value;
  const time = document.getElementById('other-time').value;
  const location = document.getElementById('other-location').value.trim();

  const announcement = {
    type: 'other',
    title,
    category,
    description,
    date,
    time,
    location,
    timestamp: new Date().toISOString()
  };

  saveAnnouncement(announcement);
});

// ========================================
// FLASH INFO FORM (NEW)
// ========================================
const flashForm = document.getElementById('form-flash');

flashForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('flash-title').value.trim();
  const message = document.getElementById('flash-message').value.trim();
  const date = document.getElementById('flash-date').value;
  const startTime = document.getElementById('flash-start').value;
  const duration = parseInt(document.getElementById('flash-duration').value);

  const announcement = {
    type: 'flash',
    title,
    message,
    date,
    startTime,
    duration, // minutes
    timestamp: new Date().toISOString()
  };

  saveAnnouncement(announcement);
});

// ========================================
// SAVE & MANAGE ANNOUNCEMENTS
// ========================================
let isSubmitting = false; // Prevent double submission

async function saveAnnouncement(announcement) {
  // Prevent double submission
  if (isSubmitting) {
    console.log('⚠️ يرجى الانتظار، جاري الحفظ...');
    return;
  }

  isSubmitting = true;

  try {
    if (editMode && editIndex >= 0) {
      if (!currentAnnouncementId) {
        throw new Error("No announcement ID found for update");
      }

      announcement.id = currentAnnouncementId;
      await window.announcementAPI.update(announcement);
      alert('✅ تم تحديث الإعلان بنجاح!');

      // Exit edit mode
      exitEditMode();
    } else {
      // Add new announcement
      await window.announcementAPI.create(announcement);
      alert('✅ تم نشر الإعلان بنجاح!');
    }

    // Reset form
    document.querySelector('.announcement-form.active').reset();

    // Reset calculated fields
    if (currentType === 'absent' && typeof calculatedPeriod !== 'undefined') {
      if (calculatedPeriod) {
        calculatedPeriod.textContent = 'اختر التواريخ لحساب المدة';
        calculatedPeriod.style.borderColor = 'var(--primary)';
        calculatedPeriod.style.color = 'var(--primary)';
      }
    } else if (currentType === 'devoir' && typeof calculatedDuration !== 'undefined') {
      if (calculatedDuration) {
        calculatedDuration.textContent = 'اختر التوقيت لحساب المدة';
        calculatedDuration.style.borderColor = 'var(--primary)';
        calculatedDuration.style.color = 'var(--primary)';
      }
    }

    // Reload manage list
    await loadManageList();

  } catch (error) {
    console.error('Error saving announcement:', error);
    alert('❌ خطأ في الحفظ: ' + error.message);
  } finally {
    // Re-enable submission after a short delay
    setTimeout(() => {
      isSubmitting = false;
    }, 500);
  }
}

function editAnnouncement(index) {
  // Use cached announcements from loadManageList
  const announcements = cachedAnnouncements;
  const announcement = announcements[index];

  if (!announcement) return;

  // Set edit mode
  editMode = true;
  editIndex = index;
  currentAnnouncementId = announcement.id; // Store ID for update

  // Switch to correct form type
  selectType(announcement.type);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update header to show edit mode
  const formContainer = document.querySelector('.form-container');
  let editBanner = document.getElementById('edit-banner');

  if (!editBanner) {
    editBanner = document.createElement('div');
    editBanner.id = 'edit-banner';
    editBanner.style.cssText = `
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      direction: rtl;
    `;
    formContainer.insertBefore(editBanner, formContainer.firstChild);
  }

  editBanner.innerHTML = `
    <span>✏️ وضع التعديل - جاري تعديل الإعلان</span>
    <button onclick="exitEditMode()" style="
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    ">إلغاء</button>
  `;

  // Pre-fill form based on type
  setTimeout(() => {
    if (announcement.type === 'absent') {
      document.getElementById('absent-prof').value = announcement.professeur || '';
      document.getElementById('absent-matiere').value = announcement.matiere || '';
      document.getElementById('absent-start').value = announcement.startDate || '';
      document.getElementById('absent-end').value = announcement.endDate || '';
      document.getElementById('absent-classes').value = announcement.classes || '';
      document.getElementById('absent-notes').value = announcement.notes || '';
      calculatePeriod();
    } else if (announcement.type === 'devoir') {
      document.getElementById('devoir-type').value = announcement.devoirType || '';
      document.getElementById('devoir-matiere').value = announcement.matiere || '';
      document.getElementById('devoir-class').value = announcement.class || '';
      document.getElementById('devoir-salle').value = announcement.salle || '';
      document.getElementById('devoir-date').value = announcement.date || '';
      document.getElementById('devoir-start-time').value = announcement.startTime || '';
      document.getElementById('devoir-end-time').value = announcement.endTime || '';
      document.getElementById('devoir-notes').value = announcement.notes || '';
      calculateDuration();
    } else if (announcement.type === 'exclusion') {
      document.getElementById('exclusion-student').value = announcement.student || '';
      document.getElementById('exclusion-class').value = announcement.class || '';
      document.getElementById('exclusion-reason').value = announcement.reason || '';
      document.getElementById('exclusion-type').value = announcement.exclusionType || '';
      toggleExclusionDates();
      if (announcement.exclusionType === 'temporary') {
        document.getElementById('exclusion-start').value = announcement.startDate || '';
        document.getElementById('exclusion-end').value = announcement.endDate || '';
        calculateExclusionPeriod();
      }
      document.getElementById('exclusion-notes').value = announcement.notes || '';
    } else if (announcement.type === 'other') {
      document.getElementById('other-title').value = announcement.title || '';
      document.getElementById('other-category').value = announcement.category || '';
      document.getElementById('other-description').value = announcement.description || '';
      document.getElementById('other-date').value = announcement.date || '';
      document.getElementById('other-time').value = announcement.time || '';
      document.getElementById('other-location').value = announcement.location || '';
    } else if (announcement.type === 'flash') {
      document.getElementById('flash-title').value = announcement.title || '';
      document.getElementById('flash-message').value = announcement.message || '';
      document.getElementById('flash-date').value = announcement.date || '';
      document.getElementById('flash-start').value = announcement.startTime || '';
      document.getElementById('flash-duration').value = announcement.duration || 5;
    }

    // Update submit button text
    const submitBtn = document.querySelector('.announcement-form.active .btn-submit');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>💾</span> حفظ التعديلات';
    }
  }, 100);
}

function exitEditMode() {
  editMode = false;
  editIndex = -1;
  currentAnnouncementId = null; // Clear ID

  // Remove edit banner
  const editBanner = document.getElementById('edit-banner');
  if (editBanner) {
    editBanner.remove();
  }

  // Reset form
  document.querySelector('.announcement-form.active')?.reset();

  // Reset submit button text
  const submitBtn = document.querySelector('.announcement-form.active .btn-submit');
  if (submitBtn) {
    submitBtn.innerHTML = '<span>✓</span> نشر الإعلان';
  }

  // Reset calculated fields
  if (currentType === 'absent' && typeof calculatedPeriod !== 'undefined') {
    if (calculatedPeriod) {
      calculatedPeriod.textContent = 'اختر التواريخ لحساب المدة';
      calculatedPeriod.style.borderColor = 'var(--primary)';
      calculatedPeriod.style.color = 'var(--primary)';
    }
  } else if (currentType === 'devoir' && typeof calculatedDuration !== 'undefined') {
    if (calculatedDuration) {
      calculatedDuration.textContent = 'اختر التوقيت لحساب المدة';
      calculatedDuration.style.borderColor = 'var(--primary)';
      calculatedDuration.style.color = 'var(--primary)';
    }
  }
}

async function loadManageList() {
  const manageList = document.getElementById('manage-list');

  try {
    const announcements = await window.announcementAPI.getAll();
    cachedAnnouncements = announcements; // Store for edit/delete access

    if (announcements.length === 0) {
      manageList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>لا توجد إعلانات حالياً</p>
                </div>
            `;
      return;
    }

    manageList.innerHTML = '';

    announcements.forEach((announcement, index) => {
      const item = document.createElement('div');
      item.className = 'manage-item';

      let title = '';
      let meta = '';

      switch (announcement.type) {
        case 'absent':
          title = `${announcement.professeur} - ${announcement.matiere}`;
          meta = `غياب • ${announcement.period}`;
          break;
        case 'devoir':
          title = `${announcement.devoirType} - ${announcement.matiere}`;
          meta = `${announcement.class} • قاعة ${announcement.salle}`;
          break;
        case 'exclusion':
          title = `${announcement.student} - ${announcement.class}`;
          meta = `طرد ${announcement.exclusionType === 'permanent' ? 'نهائي' : 'مؤقت'} • ${announcement.period}`;
          break;
        case 'other':
          title = announcement.title;
          meta = announcement.category;
          break;
        case 'flash':
          title = `⚡ ${announcement.title}`;
          meta = `ومضة • المدة: ${announcement.duration}د`;
          break;
      }

      item.innerHTML = `
                <div class="manage-item-info">
                    <div class="manage-item-title">${title}</div>
                    <div class="manage-item-meta">${meta} • ${formatTimestamp(announcement.timestamp)}</div>
                </div>
                <div class="manage-item-actions">
                    <button class="btn-edit" onclick="editAnnouncement(${index})">
                        ✏️ تعديل
                    </button>
                    <button class="btn-delete" onclick="deleteAnnouncement('${announcement.id}')">
                        🗑️ حذف
                    </button>
                </div>
            `;

      manageList.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading manage list:", error);
    manageList.innerHTML = `<div style="color:red; padding:20px;">خطأ في التحميل: ${error.message}</div>`;
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
    return;
  }

  try {
    await window.announcementAPI.delete(id);
    await loadManageList();
    alert('✅ تم الحذف');

    // Exit edit mode if we're editing this announcement
    if (editMode && currentAnnouncementId == id) {
      exitEditMode();
    }
  } catch (error) {
    console.error("Error deleting announcement:", error);
    alert('❌ خطأ: ' + error.message);
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ar-TN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Initialize
loadManageList();

// Set default dates to today
if (startDateInput) {
  const today = new Date().toISOString().split('T')[0];
  startDateInput.value = today;
  endDateInput.value = today;
  calculatePeriod();
}

if (document.getElementById('devoir-date')) {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('devoir-date').value = today;
}

if (document.getElementById('other-date')) {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('other-date').value = today;
}

if (document.getElementById('flash-date')) {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('flash-date').value = today;
}
