/* Core Orchestrator & View Controller */

// Global state and configurations
export const state = {
  activeView: 'standard',
  activeConverter: null,
  theme: 'black',
  options: {
    commas: true,
    sounds: false
  }
};

// Available Themes map
const THEMES = {
  black: 'Black Theme',
  white: 'White Theme',
  yellow: 'Yellow Theme',
  green: 'Green Theme',
  pink: 'Pink Theme',
  red: 'Red Theme',
  blue: 'Blue Theme',
  orange: 'Orange Theme'
};

// --------------------------------------------------------------------------
// 1. SOUND GENERATOR (Web Audio API)
// --------------------------------------------------------------------------
export function playClickSound() {
  if (!state.options.sounds) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitched clean click
    gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime); // soft volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.04);
  } catch (error) {
    console.warn("Sound play block: browser requires interaction first.", error);
  }
}

// Attach sound to all key presses if option enabled
document.addEventListener('click', (e) => {
  if (e.target.closest('button')) {
    playClickSound();
  }
});

// --------------------------------------------------------------------------
// 2. TOAST SYSTEM
// --------------------------------------------------------------------------
export function showToast(message, icon = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
  
  container.appendChild(toast);
  lucide.createIcons(); // Initialize the icon dynamically
  
  // Clean up element after animation finishes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// --------------------------------------------------------------------------
// 3. NUMERIC DISPLAY FORMATTERS
// --------------------------------------------------------------------------

/**
 * Format string representing number to have commas (e.g. 12345.67 -> 12,345.67)
 */
export function formatDisplayNumber(strVal) {
  if (!state.options.commas) return strVal;
  if (strVal === 'Error' || strVal === 'Infinity' || strVal === 'NaN') return strVal;
  
  // If scientific notation, return as is
  if (strVal.includes('e') || strVal.includes('E')) return strVal;
  
  // Split signs, integer, and decimal parts
  let cleanVal = strVal.replace(/,/g, '');
  let isNegative = cleanVal.startsWith('-');
  if (isNegative) cleanVal = cleanVal.substring(1);
  
  const parts = cleanVal.split('.');
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  
  // Add comma separators to integer part
  if (integerPart && !isNaN(integerPart)) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  return (isNegative ? '-' : '') + integerPart + decimalPart;
}

/**
 * Clears commas from numbers for math computations
 */
export function stripCommas(strVal) {
  if (typeof strVal !== 'string') return strVal;
  return strVal.replace(/,/g, '');
}

// --------------------------------------------------------------------------
// 4. STORAGE PERSISTENCE
// --------------------------------------------------------------------------
function saveToStorage() {
  localStorage.setItem('antigravity_calc_state', JSON.stringify({
    activeView: state.activeView,
    activeConverter: state.activeConverter,
    theme: state.theme,
    options: state.options
  }));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('antigravity_calc_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      state.activeView = parsed.activeView || 'standard';
      state.activeConverter = parsed.activeConverter || null;
      state.theme = parsed.theme || 'black';
      state.options = { ...state.options, ...parsed.options };
    }
  } catch (e) {
    console.error("Storage load failed, clearing defaults.", e);
  }
}

// --------------------------------------------------------------------------
// 5. VIEW MANAGEMENT & ROUTING
// --------------------------------------------------------------------------
const viewViewport = document.getElementById('viewViewport');
const currentViewTitle = document.getElementById('currentViewTitle');
const navItems = document.querySelectorAll('.nav-item');

export function switchView(viewName, converterType = null) {
  // 1. Hide active visible sections
  const sections = document.querySelectorAll('.calc-view');
  sections.forEach(s => s.classList.remove('active'));
  
  // 2. Select target view element
  let targetViewId = `view-${viewName}`;
  const targetSection = document.getElementById(targetViewId);
  
  if (targetSection) {
    targetSection.classList.add('active');
    state.activeView = viewName;
    state.activeConverter = converterType;
    
    // Update Header Text
    if (viewName === 'converter' && converterType) {
      // Capitalize type
      const title = converterType.charAt(0).toUpperCase() + converterType.slice(1);
      currentViewTitle.textContent = `${title} Converter`;
    } else {
      const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]:not([data-converter])`);
      if (activeNav) {
        currentViewTitle.textContent = activeNav.textContent.trim();
      } else {
        // Fallback title formatting
        currentViewTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1) + " Calculator";
      }
    }
    
    // 3. Highlight active nav list item
    navItems.forEach(item => {
      item.classList.remove('active');
      const v = item.getAttribute('data-view');
      const c = item.getAttribute('data-converter');
      
      if (viewName === 'converter' && converterType) {
        if (v === 'converter' && c === converterType) item.classList.add('active');
      } else {
        if (v === viewName && !c) item.classList.add('active');
      }
    });

    // Close mobile sidebar automatically
    const sidebar = document.getElementById('appSidebar');
    sidebar.classList.remove('sidebar-open');
    
    saveToStorage();
    
    // Dispatch a custom event to notify individual modules that view has changed
    window.dispatchEvent(new CustomEvent('viewchanged', { detail: { viewName, converterType } }));
  }
}

// Bind Navigation Clicks
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.getAttribute('data-view');
    const converter = item.getAttribute('data-converter');
    switchView(view, converter);
  });
});

// Sidebar Toggle controls
const btnSidebarToggle = document.getElementById('btnSidebarToggle');
const btnCloseSidebar = document.getElementById('btnCloseSidebar');
const appSidebar = document.getElementById('appSidebar');

if (btnSidebarToggle && appSidebar) {
  btnSidebarToggle.addEventListener('click', () => {
    appSidebar.classList.add('sidebar-open');
  });
}
if (btnCloseSidebar && appSidebar) {
  btnCloseSidebar.addEventListener('click', () => {
    appSidebar.classList.remove('sidebar-open');
  });
}

// --------------------------------------------------------------------------
// 6. THEME SWITCHER
// --------------------------------------------------------------------------
const quickThemeIndicator = document.getElementById('quickThemeIndicator');

export function applyTheme(themeId) {
  if (!THEMES[themeId]) return;
  
  // Set HTML theme attribute
  document.documentElement.setAttribute('data-theme', themeId);
  state.theme = themeId;
  
  // Update header labels
  if (quickThemeIndicator) {
    quickThemeIndicator.querySelector('.theme-name').textContent = THEMES[themeId];
  }
  
  // Set active badge state in settings UI
  const themeButtons = document.querySelectorAll('.theme-btn-card');
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme-id') === themeId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  saveToStorage();
}

// Bind Theme clicks in Settings
document.querySelectorAll('.theme-btn-card').forEach(btn => {
  btn.addEventListener('click', () => {
    const themeId = btn.getAttribute('data-theme-id');
    applyTheme(themeId);
    showToast(`Switched to ${THEMES[themeId]}`, 'palette');
  });
});

// Bind Options change checkboxes
const optCommas = document.getElementById('optCommas');
const optSounds = document.getElementById('optSounds');

if (optCommas) {
  optCommas.addEventListener('change', (e) => {
    state.options.commas = e.target.checked;
    saveToStorage();
    showToast(`Commas formatting ${state.options.commas ? 'enabled' : 'disabled'}`, 'settings');
  });
}

if (optSounds) {
  optSounds.addEventListener('change', (e) => {
    state.options.sounds = e.target.checked;
    saveToStorage();
    showToast(`Click audio sound ${state.options.sounds ? 'enabled' : 'disabled'}`, 'volume-2');
  });
}

// Reset application data handler
const btnResetAppData = document.getElementById('btnResetAppData');
if (btnResetAppData) {
  btnResetAppData.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all calculations, configurations, themes, and local storage data? This action is irreversible.")) {
      localStorage.clear();
      showToast("Application data reset successfully", "rotate-ccw");
      setTimeout(() => location.reload(), 1000);
    }
  });
}

// --------------------------------------------------------------------------
// 7. FEEDBACK FORM RATING AND SUBMISSION
// --------------------------------------------------------------------------
const stars = document.querySelectorAll('#feedbackRating .star');
let selectedRating = 5;

// Initial rating visually
highlightStars(selectedRating);

stars.forEach(star => {
  star.addEventListener('mouseenter', () => {
    const rating = parseInt(star.getAttribute('data-rating'));
    highlightStars(rating, true);
  });
  
  star.addEventListener('mouseleave', () => {
    highlightStars(selectedRating);
  });
  
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-rating'));
    highlightStars(selectedRating);
  });
});

function highlightStars(rating, isHover = false) {
  stars.forEach(star => {
    const r = parseInt(star.getAttribute('data-rating'));
    if (r <= rating) {
      if (isHover) {
        star.classList.add('hovered');
      } else {
        star.classList.remove('hovered');
        star.classList.add('selected');
      }
    } else {
      star.classList.remove('hovered', 'selected');
    }
  });
}

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('fbName').value;
    const email = document.getElementById('fbEmail').value;
    const msg = document.getElementById('fbMessage').value;
    
    // Visual success
    showToast("Feedback compiled successfully!", "check-circle");
    
    // Simulate sending by constructing email content in toast and mailto link
    const subject = encodeURIComponent("Antigravity Calculator Feedback");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nRating: ${selectedRating}/5 Stars\nFeedback:\n${msg}`);
    
    // Open email client in background
    window.open(`mailto:support@antigravitycalc.example.com?subject=${subject}&body=${body}`, '_blank');
    
    feedbackForm.reset();
    selectedRating = 5;
    highlightStars(selectedRating);
  });
}

// --------------------------------------------------------------------------
// 8. LEGAL ACCORDIONS
// --------------------------------------------------------------------------
const accordionTriggers = document.querySelectorAll('.accordion-trigger');
accordionTriggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    const targetId = trigger.getAttribute('data-target');
    const content = document.getElementById(targetId);
    const isActive = trigger.classList.contains('active');
    
    // Close other items
    accordionTriggers.forEach(t => {
      t.classList.remove('active');
      const c = document.getElementById(t.getAttribute('data-target'));
      if (c) c.style.maxHeight = null;
    });
    
    if (!isActive) {
      trigger.classList.add('active');
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

// --------------------------------------------------------------------------
// 9. MODULE INITIALIZERS (Dynamic Imports)
// --------------------------------------------------------------------------
async function initializeModules() {
  try {
    // Dynamically load sub-module scripts
    await import('./standard.js');
    await import('./scientific.js');
    await import('./graphing.js');
    await import('./programmer.js');
    await import('./datecalc.js');
    await import('./converters.js');
  } catch (error) {
    console.error("Module initialization failed:", error);
  }
}

// --------------------------------------------------------------------------
// 10. INITIALIZATION RUNNER
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Load configuration from local storage
  loadFromStorage();
  
  // Set saved option checkboxes
  if (optCommas) optCommas.checked = state.options.commas;
  if (optSounds) optSounds.checked = state.options.sounds;
  
  // Set theme
  applyTheme(state.theme);
  
  // Load initial view
  switchView(state.activeView, state.activeConverter);
  
  // Start up Lucide icons replacement
  lucide.createIcons();
  
  // Run modules initializers
  initializeModules();
});
