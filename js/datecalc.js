/* Date Calculation Module */

import { showToast } from './app.js';

// DOM Elements
const tabDateDiff = document.getElementById('tabDateDiff');
const tabDateAddSub = document.getElementById('tabDateAddSub');
const panelDateDiff = document.getElementById('panelDateDiff');
const panelDateAddSub = document.getElementById('panelDateAddSub');

// Diff View Inputs
const dateFrom = document.getElementById('dateFrom');
const dateTo = document.getElementById('dateTo');
const dateDiffResult = document.getElementById('dateDiffResult');
const dateDiffSubResult = document.getElementById('dateDiffSubResult');

// Add/Sub View Inputs
const dateStart = document.getElementById('dateStart');
const dateYears = document.getElementById('dateYears');
const dateMonths = document.getElementById('dateMonths');
const dateDays = document.getElementById('dateDays');
const dateAddSubResult = document.getElementById('dateAddSubResult');

// --------------------------------------------------------------------------
// 1. TABS MANAGEMENT
// --------------------------------------------------------------------------
if (tabDateDiff && tabDateAddSub && panelDateDiff && panelDateAddSub) {
  tabDateDiff.addEventListener('click', () => {
    tabDateDiff.classList.add('active');
    tabDateAddSub.classList.remove('active');
    panelDateDiff.classList.add('active');
    panelDateAddSub.classList.remove('active');
  });
  
  tabDateAddSub.addEventListener('click', () => {
    tabDateAddSub.classList.add('active');
    tabDateDiff.classList.remove('active');
    panelDateAddSub.classList.add('active');
    panelDateDiff.classList.remove('active');
  });
}

// --------------------------------------------------------------------------
// 2. COMPUTE DATE DIFFERENCE
// --------------------------------------------------------------------------
function updateDateDifference() {
  if (!dateFrom.value || !dateTo.value) return;
  
  const d1 = new Date(dateFrom.value);
  const d2 = new Date(dateTo.value);
  
  // Set times to midnight to avoid daylight savings discrepancies
  d1.setHours(0,0,0,0);
  d2.setHours(0,0,0,0);
  
  if (d1.getTime() === d2.getTime()) {
    dateDiffResult.textContent = 'Same date';
    dateDiffSubResult.textContent = '0 days';
    return;
  }
  
  // Exact day difference
  const msDiff = Math.abs(d2.getTime() - d1.getTime());
  const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  
  // Year/Month/Day Breakdown
  let start = d1 < d2 ? d1 : d2;
  let end = d1 < d2 ? d2 : d1;
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  
  if (days < 0) {
    months--;
    // Days in previous month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Format visual result
  const parts = [];
  if (years > 0) parts.push(years === 1 ? '1 year' : `${years} years`);
  if (months > 0) parts.push(months === 1 ? '1 month' : `${months} months`);
  if (days > 0) parts.push(days === 1 ? '1 day' : `${days} days`);
  
  dateDiffResult.textContent = parts.join(', ');
  dateDiffSubResult.textContent = totalDays === 1 ? '1 day' : `${totalDays.toLocaleString()} days`;
}

// --------------------------------------------------------------------------
// 3. COMPUTE DATE ADDITION / SUBTRACTION
// --------------------------------------------------------------------------
function updateDateAddSub() {
  if (!dateStart.value) return;
  
  const baseDate = new Date(dateStart.value);
  baseDate.setHours(0,0,0,0);
  
  const op = document.querySelector('input[name="dateOp"]:checked').value;
  const factor = op === 'subtract' ? -1 : 1;
  
  const yOffset = (parseInt(dateYears.value) || 0) * factor;
  const mOffset = (parseInt(dateMonths.value) || 0) * factor;
  const dOffset = (parseInt(dateDays.value) || 0) * factor;
  
  baseDate.setFullYear(baseDate.getFullYear() + yOffset);
  baseDate.setMonth(baseDate.getMonth() + mOffset);
  baseDate.setDate(baseDate.getDate() + dOffset);
  
  // Format long date string
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateAddSubResult.textContent = baseDate.toLocaleDateString('en-US', options);
}

// --------------------------------------------------------------------------
// 4. SETUP LISTENERS & DEFAULTS
// --------------------------------------------------------------------------
function setupDefaults() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (dateFrom) dateFrom.value = todayStr;
  if (dateTo) dateTo.value = todayStr;
  if (dateStart) dateStart.value = todayStr;
  
  updateDateDifference();
  updateDateAddSub();
}

// Listen to Diff view changes
[dateFrom, dateTo].forEach(input => {
  if (input) {
    input.addEventListener('change', updateDateDifference);
  }
});

// Listen to Add/Sub view changes
[dateStart, dateYears, dateMonths, dateDays].forEach(input => {
  if (input) {
    input.addEventListener('input', updateDateAddSub);
  }
});

document.querySelectorAll('input[name="dateOp"]').forEach(radio => {
  radio.addEventListener('change', updateDateAddSub);
});

// Watch view trigger to reload
window.addEventListener('viewchanged', (e) => {
  if (e.detail.viewName === 'datecalc') {
    updateDateDifference();
    updateDateAddSub();
  }
});

// Init
setupDefaults();
