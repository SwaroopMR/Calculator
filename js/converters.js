/* Unified Converters Module */

import { showToast } from './app.js';

// State
let currentConverterType = 'length';
let currencyRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 160.2,
  INR: 83.5,
  CAD: 1.37,
  AUD: 1.49,
  CNY: 7.26,
  CHF: 0.89
};
let ratesLastUpdated = 'Using offline default rates (2026)';

// --------------------------------------------------------------------------
// 1. CONVERSION DATA STRUCTURES
// --------------------------------------------------------------------------
const CONVERTER_UNITS = {
  currency: {
    base: 'USD',
    units: [
      { code: 'USD', name: 'USD - US Dollar' },
      { code: 'EUR', name: 'EUR - Euro' },
      { code: 'GBP', name: 'GBP - British Pound' },
      { code: 'JPY', name: 'JPY - Japanese Yen' },
      { code: 'INR', name: 'INR - Indian Rupee' },
      { code: 'CAD', name: 'CAD - Canadian Dollar' },
      { code: 'AUD', name: 'AUD - Australian Dollar' },
      { code: 'CNY', name: 'CNY - Chinese Yuan' },
      { code: 'CHF', name: 'CHF - Swiss Franc' }
    ]
  },
  volume: {
    base: 'L',
    units: [
      { code: 'L', name: 'Liters (L)', factor: 1.0 },
      { code: 'mL', name: 'Milliliters (mL)', factor: 0.001 },
      { code: 'm3', name: 'Cubic Meters (m³)', factor: 1000.0 },
      { code: 'cm3', name: 'Cubic Centimeters (cm³)', factor: 0.001 },
      { code: 'gal', name: 'Gallons (US gal)', factor: 3.78541 },
      { code: 'qt', name: 'Quarts (US qt)', factor: 0.946353 },
      { code: 'pt', name: 'Pints (US pt)', factor: 0.473176 },
      { code: 'cup', name: 'Cups (US cup)', factor: 0.236588 },
      { code: 'floz', name: 'Fluid Ounces (US fl oz)', factor: 0.0295735 }
    ]
  },
  length: {
    base: 'm',
    units: [
      { code: 'm', name: 'Meters (m)', factor: 1.0 },
      { code: 'km', name: 'Kilometers (km)', factor: 1000.0 },
      { code: 'cm', name: 'Centimeters (cm)', factor: 0.01 },
      { code: 'mm', name: 'Millimeters (mm)', factor: 0.001 },
      { code: 'mi', name: 'Miles (mi)', factor: 1609.34 },
      { code: 'yd', name: 'Yards (yd)', factor: 0.9144 },
      { code: 'ft', name: 'Feet (ft)', factor: 0.3048 },
      { code: 'in', name: 'Inches (in)', factor: 0.0254 },
      { code: 'nm', name: 'Nanometers (nm)', factor: 1e-9 },
      { code: 'um', name: 'Micrometers (µm)', factor: 1e-6 }
    ]
  },
  weight: {
    base: 'kg',
    units: [
      { code: 'kg', name: 'Kilograms (kg)', factor: 1.0 },
      { code: 'g', name: 'Grams (g)', factor: 0.001 },
      { code: 't', name: 'Metric Tons (t)', factor: 1000.0 },
      { code: 'lb', name: 'Pounds (lb)', factor: 0.453592 },
      { code: 'oz', name: 'Ounces (oz)', factor: 0.0283495 },
      { code: 'st', name: 'Stones (st)', factor: 6.35029 },
      { code: 'ton', name: 'Short Tons (US ton)', factor: 907.185 }
    ]
  },
  temperature: {
    base: 'C',
    units: [
      { code: 'C', name: 'Celsius (°C)' },
      { code: 'F', name: 'Fahrenheit (°F)' },
      { code: 'K', name: 'Kelvin (K)' }
    ]
  },
  energy: {
    base: 'J',
    units: [
      { code: 'J', name: 'Joules (J)', factor: 1.0 },
      { code: 'kJ', name: 'Kilojoules (kJ)', factor: 1000.0 },
      { code: 'cal', name: 'Calories (cal)', factor: 4.184 },
      { code: 'kcal', name: 'Kilocalories (kcal)', factor: 4184.0 },
      { code: 'Wh', name: 'Watt-hours (Wh)', factor: 3600.0 },
      { code: 'kWh', name: 'Kilowatt-hours (kWh)', factor: 3600000.0 },
      { code: 'eV', name: 'Electronvolts (eV)', factor: 1.60218e-19 },
      { code: 'btu', name: 'BTUs (BTU)', factor: 1055.06 }
    ]
  },
  area: {
    base: 'm2',
    units: [
      { code: 'm2', name: 'Square Meters (m²)', factor: 1.0 },
      { code: 'km2', name: 'Square Kilometers (km²)', factor: 1e6 },
      { code: 'mi2', name: 'Square Miles (mi²)', factor: 2.59e6 },
      { code: 'yd2', name: 'Square Yards (yd²)', factor: 0.836127 },
      { code: 'ft2', name: 'Square Feet (ft²)', factor: 0.092903 },
      { code: 'in2', name: 'Square Inches (in²)', factor: 0.00064516 },
      { code: 'ac', name: 'Acres (ac)', factor: 4046.86 },
      { code: 'ha', name: 'Hectares (ha)', factor: 10000.0 }
    ]
  },
  speed: {
    base: 'm/s',
    units: [
      { code: 'ms', name: 'Meters per second (m/s)', factor: 1.0 },
      { code: 'kmh', name: 'Kilometers per hour (km/h)', factor: 0.277778 },
      { code: 'mph', name: 'Miles per hour (mph)', factor: 0.44704 },
      { code: 'kn', name: 'Knots (kn)', factor: 0.514444 },
      { code: 'mach', name: 'Mach (mach)', factor: 340.29 }
    ]
  },
  time: {
    base: 's',
    units: [
      { code: 's', name: 'Seconds (s)', factor: 1.0 },
      { code: 'ms', name: 'Milliseconds (ms)', factor: 0.001 },
      { code: 'min', name: 'Minutes (min)', factor: 60.0 },
      { code: 'h', name: 'Hours (h)', factor: 3600.0 },
      { code: 'd', name: 'Days (d)', factor: 86400.0 },
      { code: 'wk', name: 'Weeks (wk)', factor: 604800.0 },
      { code: 'mo', name: 'Months (mo)', factor: 2.628e6 }, // Avg 30.4 days
      { code: 'yr', name: 'Years (yr)', factor: 3.154e7 } // 365 days
    ]
  },
  power: {
    base: 'W',
    units: [
      { code: 'W', name: 'Watts (W)', factor: 1.0 },
      { code: 'kW', name: 'Kilowatts (kW)', factor: 1000.0 },
      { code: 'MW', name: 'Megawatts (MW)', factor: 1e6 },
      { code: 'hp', name: 'Horsepower (hp)', factor: 745.7 }
    ]
  },
  data: {
    base: 'B',
    units: [
      { code: 'bit', name: 'Bits (b)', factor: 0.125 },
      { code: 'B', name: 'Bytes (B)', factor: 1.0 },
      { code: 'KB', name: 'Kilobytes (KB - Dec)', factor: 1000.0 },
      { code: 'MB', name: 'Megabytes (MB - Dec)', factor: 1e6 },
      { code: 'GB', name: 'Gigabytes (GB - Dec)', factor: 1e9 },
      { code: 'TB', name: 'Terabytes (TB - Dec)', factor: 1e12 },
      { code: 'PB', name: 'Petabytes (PB - Dec)', factor: 1e15 },
      { code: 'KiB', name: 'Kibibytes (KiB - Bin)', factor: 1024.0 },
      { code: 'MiB', name: 'Mebibytes (MiB - Bin)', factor: 1048576.0 },
      { code: 'GiB', name: 'Gibibytes (GiB - Bin)', factor: 1073741824.0 },
      { code: 'TiB', name: 'Tebibytes (TiB - Bin)', factor: 1099511627776.0 }
    ]
  },
  pressure: {
    base: 'Pa',
    units: [
      { code: 'Pa', name: 'Pascals (Pa)', factor: 1.0 },
      { code: 'kPa', name: 'Kilopascals (kPa)', factor: 1000.0 },
      { code: 'bar', name: 'Bars (bar)', factor: 100000.0 },
      { code: 'psi', name: 'Pounds per sq inch (psi)', factor: 6894.76 },
      { code: 'atm', name: 'Atmospheres (atm)', factor: 101325.0 }
    ]
  },
  angle: {
    base: 'deg',
    units: [
      { code: 'deg', name: 'Degrees (deg)', factor: 1.0 },
      { code: 'rad', name: 'Radians (rad)', factor: 57.2958 }, // 180 / PI
      { code: 'grad', name: 'Gradians (grad)', factor: 0.9 } // 360 / 400
    ]
  }
};

// DOM References
const selectFrom = document.getElementById('convertFromUnit');
const selectTo = document.getElementById('convertToUnit');
const inputFrom = document.getElementById('convertFromVal');
const inputTo = document.getElementById('convertToVal');

const currencyUpdateBar = document.getElementById('currencyUpdateBar');
const btnUpdateRates = document.getElementById('btnUpdateRates');
const ratesStatus = document.getElementById('ratesStatus');
const btnSwap = document.getElementById('btnSwapUnits');

// --------------------------------------------------------------------------
// 2. CONVERSION ENGINE LOGIC
// --------------------------------------------------------------------------
function convert(val, fromCode, toCode) {
  if (isNaN(val)) return NaN;
  if (fromCode === toCode) return val;
  
  // Custom Temp calculation
  if (currentConverterType === 'temperature') {
    let tempInCelsius = val;
    
    // Convert to base Celsius first
    if (fromCode === 'F') tempInCelsius = (val - 32) * 5/9;
    else if (fromCode === 'K') tempInCelsius = val - 273.15;
    
    // Convert from base Celsius to target
    if (toCode === 'C') return tempInCelsius;
    if (toCode === 'F') return tempInCelsius * 9/5 + 32;
    if (toCode === 'K') return tempInCelsius + 273.15;
  }
  
  // Custom Currency calculation
  if (currentConverterType === 'currency') {
    const rateFrom = currencyRates[fromCode] || 1.0;
    const rateTo = currencyRates[toCode] || 1.0;
    // convert from currency to base USD, then base USD to target currency
    return (val / rateFrom) * rateTo;
  }
  
  // Standard conversion using factor weights
  const db = CONVERTER_UNITS[currentConverterType].units;
  const unitFrom = db.find(u => u.code === fromCode);
  const unitTo = db.find(u => u.code === toCode);
  
  if (!unitFrom || !unitTo) return val;
  
  // val * unitFromFactor = base unit value
  // base unit value / unitToFactor = final value
  return (val * unitFrom.factor) / unitTo.factor;
}

function formatResult(val) {
  if (isNaN(val) || !isFinite(val)) return '';
  if (val === 0) return '0';
  
  // Exponent notation for extremely micro or macro numbers
  if (Math.abs(val) < 1e-7 || Math.abs(val) > 1e12) {
    return val.toExponential(6);
  }
  
  // Return fixed to 8 decimals but stripped of trailing zeroes
  return Number(val.toFixed(8)).toString();
}

function executeConversion() {
  if (!inputFrom || !inputTo || !selectFrom || !selectTo) return;
  
  const fromVal = parseFloat(inputFrom.value);
  const fromUnit = selectFrom.value;
  const toUnit = selectTo.value;
  
  if (isNaN(fromVal)) {
    inputTo.value = '';
    return;
  }
  
  const result = convert(fromVal, fromUnit, toUnit);
  inputTo.value = formatResult(result);
}

// --------------------------------------------------------------------------
// 3. UI GENERATOR AND POPULATION
// --------------------------------------------------------------------------
function populateUnits() {
  if (!selectFrom || !selectTo) return;
  
  selectFrom.innerHTML = '';
  selectTo.innerHTML = '';
  
  const db = CONVERTER_UNITS[currentConverterType];
  if (!db) return;
  
  db.units.forEach(unit => {
    const opt1 = document.createElement('option');
    opt1.value = unit.code;
    opt1.textContent = unit.name;
    
    const opt2 = opt1.cloneNode(true);
    
    selectFrom.appendChild(opt1);
    selectTo.appendChild(opt2);
  });
  
  // Default selections: select base first and second unit as default
  if (db.units.length > 1) {
    selectFrom.value = db.units[0].code;
    selectTo.value = db.units[1].code;
  }
}

function setupConverterView(type) {
  currentConverterType = type;
  
  // Populate dropdown boxes
  populateUnits();
  
  // Currency specific headers toggles
  if (type === 'currency') {
    currencyUpdateBar.classList.add('visible');
    ratesStatus.textContent = ratesLastUpdated;
  } else {
    currencyUpdateBar.classList.remove('visible');
  }
  
  // Set default initial value and execute
  inputFrom.value = '1';
  executeConversion();
}

// --------------------------------------------------------------------------
// 4. API CURRENCY RATE FETCHER
// --------------------------------------------------------------------------
async function fetchCurrencyRates() {
  const icon = btnUpdateRates.querySelector('i');
  btnUpdateRates.disabled = true;
  btnUpdateRates.classList.add('loading');
  ratesStatus.textContent = 'Updating exchange rates...';
  
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error("HTTP connection failed");
    
    const data = await response.json();
    if (data && data.rates) {
      // Overwrite local currency rates mapping
      Object.keys(currencyRates).forEach(code => {
        if (data.rates[code]) {
          currencyRates[code] = data.rates[code];
        }
      });
      
      const now = new Date();
      ratesLastUpdated = `Last updated: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Live rates)`;
      ratesStatus.textContent = ratesLastUpdated;
      showToast("Currency exchange rates updated", "refresh-cw");
      
      // Refresh conversion calculations
      executeConversion();
    }
  } catch (error) {
    console.error("Rates fetch failed, offline fallback remains active.", error);
    ratesLastUpdated = "Offline rates (failed to update)";
    ratesStatus.textContent = ratesLastUpdated;
    showToast("Using local offline exchange rates", "wifi-off");
  } finally {
    btnUpdateRates.disabled = false;
    btnUpdateRates.classList.remove('loading');
  }
}

if (btnUpdateRates) {
  btnUpdateRates.addEventListener('click', fetchCurrencyRates);
}

// --------------------------------------------------------------------------
// 5. INPUT LISTENERS
// --------------------------------------------------------------------------
if (inputFrom) {
  inputFrom.addEventListener('input', () => {
    // Sanitize non-digits
    let clean = inputFrom.value.replace(/[^0-9.-]/g, '');
    
    // Prevent double negative / double decimals
    if (clean.split('-').length > 2) clean = '-' + clean.replace(/-/g, '');
    if (clean.split('.').length > 2) {
      const parts = clean.split('.');
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    
    inputFrom.value = clean;
    executeConversion();
  });
}

if (selectFrom && selectTo) {
  selectFrom.addEventListener('change', executeConversion);
  selectTo.addEventListener('change', executeConversion);
}

if (btnSwap) {
  btnSwap.addEventListener('click', () => {
    const tempUnit = selectFrom.value;
    selectFrom.value = selectTo.value;
    selectTo.value = tempUnit;
    
    const tempVal = inputFrom.value;
    // swap calculations
    executeConversion();
    showToast("Units swapped", "arrow-up-down");
  });
}

// --------------------------------------------------------------------------
// 6. SCREEN KEYPAD LOGIC (CONVERTERS KEYPAD)
// --------------------------------------------------------------------------
function handleKeypadButton(val) {
  if (val >= '0' && val <= '9') {
    if (inputFrom.value === '0') {
      inputFrom.value = val;
    } else {
      inputFrom.value += val;
    }
  } else if (val === '.') {
    if (!inputFrom.value.includes('.')) {
      if (inputFrom.value === '') inputFrom.value = '0';
      inputFrom.value += '.';
    }
  } else if (val === 'clear') {
    inputFrom.value = '0';
  } else if (val === 'backspace') {
    if (inputFrom.value.length > 1) {
      inputFrom.value = inputFrom.value.slice(0, -1);
    } else {
      inputFrom.value = '0';
    }
  }
  executeConversion();
}

document.querySelectorAll('.converter-keypad button').forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-val');
    if (val && val !== 'backspace') {
      handleKeypadButton(val);
    }
  });
});

const btnConvBackspace = document.querySelector('.converter-keypad button[data-val="backspace"]');
if (btnConvBackspace) {
  btnConvBackspace.addEventListener('click', () => handleKeypadButton('backspace'));
}

// Listen to View Routing notifications from app.js
window.addEventListener('viewchanged', (e) => {
  if (e.detail.viewName === 'converter' && e.detail.converterType) {
    setupConverterView(e.detail.converterType);
  }
});
