/* Programmer Calculator Module */

import { showToast } from './app.js';

// State
let currentVal = 0n; // Use BigInt to prevent precision loss at 64-bit
let activeBase = 'DEC'; // HEX, DEC, OCT, BIN
let wordSizeBits = 64n; // 64 (QWORD), 32 (DWORD), 16 (WORD), 8 (BYTE)
let inputBuffer = '0'; // Buffer string for key inputs
let activeOperator = '';
let previousVal = 0n;
let shouldResetDisplay = false;

// DOM elements
const rowHEX = document.getElementById('rowHEX');
const rowDEC = document.getElementById('rowDEC');
const rowOCT = document.getElementById('rowOCT');
const rowBIN = document.getElementById('rowBIN');

const valHEX = document.getElementById('valHEX');
const valDEC = document.getElementById('valDEC');
const valOCT = document.getElementById('valOCT');
const valBIN = document.getElementById('valBIN');

const bitGrid = document.getElementById('bitGrid');
const btnWordSize = document.getElementById('btnWordSize');

// --------------------------------------------------------------------------
// 1. BASE MATH UTIL KEYS
// --------------------------------------------------------------------------
function getMask() {
  return (1n << wordSizeBits) - 1n;
}

function wrapValue(val) {
  const mask = getMask();
  let v = BigInt(val) & mask;
  return v;
}

function toSignedDecString(val) {
  const mask = getMask();
  let bigVal = val & mask;
  const signBit = 1n << (wordSizeBits - 1n);
  
  if ((bigVal & signBit) !== 0n) {
    // Value is negative in signed 2's complement
    return String(bigVal - (1n << wordSizeBits));
  }
  return String(bigVal);
}

// --------------------------------------------------------------------------
// 2. RENDERING DISPLAY AND BIT GRID
// --------------------------------------------------------------------------
function formatBinaryString(val) {
  const mask = getMask();
  let binStr = (val & mask).toString(2);
  binStr = binStr.padStart(Number(wordSizeBits), '0');
  
  // Group in 4 bits chunks
  const chunks = [];
  for (let i = 0; i < binStr.length; i += 4) {
    chunks.push(binStr.substring(i, i + 4));
  }
  return chunks.join(' ');
}

function updateBasesDisplays() {
  if (!valHEX || !valDEC || !valOCT || !valBIN) return;
  
  const wrapped = wrapValue(currentVal);
  
  valHEX.textContent = wrapped.toString(16).toUpperCase();
  valDEC.textContent = toSignedDecString(wrapped);
  valOCT.textContent = wrapped.toString(8);
  valBIN.textContent = formatBinaryString(wrapped);
  
  // Also render active state in input line based on selected base
  updateKeypadBorders();
  renderBitGrid();
}

function renderBitGrid() {
  if (!bitGrid) return;
  bitGrid.innerHTML = '';
  
  // Draw 64 bits starting from bit 63 down to 0
  for (let i = 63; i >= 0; i--) {
    const bitIndex = BigInt(i);
    const isOutOfRange = bitIndex >= wordSizeBits;
    
    const isSet = (currentVal & (1n << bitIndex)) !== 0n;
    
    const cell = document.createElement('div');
    cell.className = 'bit-box';
    if (isOutOfRange) cell.classList.add('out-of-range');
    if (isSet && !isOutOfRange) cell.classList.add('active');
    
    cell.innerHTML = `
      <span class="bit-label">${i}</span>
      <span class="bit-value">${isSet && !isOutOfRange ? '1' : '0'}</span>
    `;
    
    if (!isOutOfRange) {
      cell.addEventListener('click', () => {
        // Toggle bit
        currentVal = currentVal ^ (1n << bitIndex);
        currentVal = wrapValue(currentVal);
        inputBuffer = wrapValue(currentVal).toString(getBaseRadix());
        updateBasesDisplays();
      });
    }
    bitGrid.appendChild(cell);
  }
}

function getBaseRadix() {
  switch (activeBase) {
    case 'HEX': return 16;
    case 'OCT': return 8;
    case 'BIN': return 2;
    default: return 10;
  }
}

// --------------------------------------------------------------------------
// 3. KEYPAD ACCESSIBILITY MANAGEMENT
// --------------------------------------------------------------------------
function updateKeypadBorders() {
  // Disable buttons not matching current base
  const buttons = document.querySelectorAll('.programmer-keypad button');
  buttons.forEach(btn => {
    const val = btn.getAttribute('data-val');
    if (!val) return;
    
    // Hex letters A-F
    const isHexDigit = ['A','B','C','D','E','F','C_HEX'].includes(val);
    const isDigit89 = ['8','9'].includes(val);
    const isDigit27 = ['2','3','4','5','6','7'].includes(val);
    
    let shouldDisable = false;
    
    if (activeBase === 'DEC') {
      if (isHexDigit) shouldDisable = true;
    } else if (activeBase === 'OCT') {
      if (isHexDigit || isDigit89) shouldDisable = true;
    } else if (activeBase === 'BIN') {
      if (isHexDigit || isDigit89 || isDigit27) shouldDisable = true;
    }
    
    btn.classList.toggle('disabled', shouldDisable);
    btn.disabled = shouldDisable;
  });
}

function switchInputBase(base) {
  activeBase = base;
  
  // Highlight row in DOM
  [rowHEX, rowDEC, rowOCT, rowBIN].forEach(row => {
    if (row) row.classList.remove('active');
  });
  
  const activeRow = document.getElementById(`row${base}`);
  if (activeRow) activeRow.classList.add('active');
  
  // Reset buffer to represent current number in new base
  const radix = getBaseRadix();
  if (base === 'DEC') {
    inputBuffer = toSignedDecString(wrapValue(currentVal));
  } else {
    inputBuffer = wrapValue(currentVal).toString(radix).toUpperCase();
  }
  
  updateKeypadBorders();
  showToast(`Switched input base to ${base}`, 'terminal');
}

// Attach Base click events
[rowHEX, rowDEC, rowOCT, rowBIN].forEach(row => {
  if (row) {
    row.addEventListener('click', () => {
      const base = row.getAttribute('data-base');
      switchInputBase(base);
    });
  }
});

// --------------------------------------------------------------------------
// 4. COMPUTATIONS ENGINE
// --------------------------------------------------------------------------
function calculate() {
  const prev = wrapValue(previousVal);
  const curr = wrapValue(currentVal);
  let result = 0n;
  
  switch (activeOperator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0n) {
        showToast("Cannot divide by zero", "x-circle");
        return 0n;
      }
      result = prev / curr;
      break;
    case 'AND': result = prev & curr; break;
    case 'OR': result = prev | curr; break;
    case 'XOR': result = prev ^ curr; break;
    default: return curr;
  }
  return wrapValue(result);
}

// --------------------------------------------------------------------------
// 5. BUTTON CLICKS AND COMMANDS
// --------------------------------------------------------------------------
function handleButton(val) {
  // Digit checks (strictly length 1 to avoid matching longer HEX commands like CE)
  const isDigit = val.length === 1 && ((val >= '0' && val <= '9') || (val >= 'A' && val <= 'F'));
  
  if (isDigit) {
    // If CE or equals result state
    if (inputBuffer === '0' || shouldResetDisplay) {
      inputBuffer = val;
      shouldResetDisplay = false;
    } else {
      if (inputBuffer.length < 24) { // safety bounds check
        inputBuffer += val;
      }
    }
    
    // Parse input buffer to BigInt
    try {
      const radix = getBaseRadix();
      if (activeBase === 'DEC' && inputBuffer.startsWith('-')) {
        currentVal = wrapValue(BigInt(inputBuffer));
      } else {
        currentVal = wrapValue(BigInt(parseInt(inputBuffer, radix)));
      }
    } catch (e) {
      // Input fallback
    }
    updateBasesDisplays();
  }
  
  else if (val === 'backspace') {
    if (shouldResetDisplay) {
      return;
    }
    if (inputBuffer.length > 1) {
      inputBuffer = inputBuffer.slice(0, -1);
      if (inputBuffer === '-') inputBuffer = '0';
    } else {
      inputBuffer = '0';
    }
    
    try {
      const radix = getBaseRadix();
      if (inputBuffer === '0') {
        currentVal = 0n;
      } else {
        currentVal = wrapValue(BigInt(parseInt(inputBuffer, radix)));
      }
    } catch (e) {
      currentVal = 0n;
    }
    updateBasesDisplays();
  }
  
  else if (val === 'CE') {
    currentVal = 0n;
    inputBuffer = '0';
    updateBasesDisplays();
  }
  
  else if (val === 'C_CLEAR') {
    currentVal = 0n;
    previousVal = 0n;
    activeOperator = '';
    inputBuffer = '0';
    shouldResetDisplay = false;
    updateBasesDisplays();
  }
  
  else if (val === '+/-') {
    currentVal = wrapValue(-currentVal);
    inputBuffer = wrapValue(currentVal).toString(getBaseRadix()).toUpperCase();
    updateBasesDisplays();
  }
  
  // Bitwise Unary Shifts / Rotates
  else if (['Lsh', 'Rsh', 'RoL', 'RoR', 'NOT'].includes(val)) {
    let wrapped = wrapValue(currentVal);
    let result = 0n;
    
    switch (val) {
      case 'Lsh':
        result = wrapped << 1n;
        break;
      case 'Rsh':
        result = wrapped >> 1n;
        break;
      case 'RoL':
        // Rotates MSB to LSB
        let msb = (wrapped & (1n << (wordSizeBits - 1n))) !== 0n ? 1n : 0n;
        result = (wrapped << 1n) | msb;
        break;
      case 'RoR':
        // Rotates LSB to MSB
        let lsb = wrapped & 1n;
        result = (wrapped >> 1n) | (lsb << (wordSizeBits - 1n));
        break;
      case 'NOT':
        result = ~wrapped;
        break;
    }
    
    currentVal = wrapValue(result);
    inputBuffer = wrapValue(currentVal).toString(getBaseRadix()).toUpperCase();
    shouldResetDisplay = true;
    updateBasesDisplays();
    showToast(`Applied ${val}`, 'cpu');
  }
  
  // Binary operators (+, -, *, /, AND, OR, XOR)
  else if (['+', '-', '*', '/', 'AND', 'OR', 'XOR'].includes(val)) {
    if (activeOperator && !shouldResetDisplay) {
      currentVal = calculate();
      updateBasesDisplays();
    }
    previousVal = currentVal;
    activeOperator = val;
    shouldResetDisplay = true;
  }
  
  else if (val === '=') {
    if (!activeOperator) return;
    currentVal = calculate();
    inputBuffer = wrapValue(currentVal).toString(getBaseRadix()).toUpperCase();
    activeOperator = '';
    shouldResetDisplay = true;
    updateBasesDisplays();
  }
}

// --------------------------------------------------------------------------
// 6. WORD SIZE CONTROL
// --------------------------------------------------------------------------
if (btnWordSize) {
  btnWordSize.addEventListener('click', () => {
    switch (wordSizeBits) {
      case 64n:
        wordSizeBits = 32n;
        btnWordSize.textContent = 'DWORD (32 bits)';
        break;
      case 32n:
        wordSizeBits = 16n;
        btnWordSize.textContent = 'WORD (16 bits)';
        break;
      case 16n:
        wordSizeBits = 8n;
        btnWordSize.textContent = 'BYTE (8 bits)';
        break;
      default:
        wordSizeBits = 64n;
        btnWordSize.textContent = 'QWORD (64 bits)';
        break;
    }
    currentVal = wrapValue(currentVal);
    inputBuffer = wrapValue(currentVal).toString(getBaseRadix()).toUpperCase();
    updateBasesDisplays();
    showToast(`Bit depth set to ${wordSizeBits} bits`, 'sliders');
  });
}

// Bind Programmer Grid click events
document.querySelectorAll('.programmer-keypad button').forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-val');
    
    // Check custom C clear symbol (since trigs also contain clear)
    if (val === 'C_CLEAR') {
      handleButton('C_CLEAR');
    } else if (val === 'C_HEX') {
      handleButton('C'); // Hex letter C
    } else if (val && val !== 'backspace') {
      handleButton(val);
    }
  });
});

const btnProgBackspace = document.querySelector('.programmer-keypad button[data-val="backspace"]');
if (btnProgBackspace) {
  btnProgBackspace.addEventListener('click', () => handleButton('backspace'));
}

// Operators grid clicks
document.querySelectorAll('.programmer-operators button').forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-val');
    if (val) handleButton(val);
  });
});

// Keydowns mapping (active in Programmer view)
document.addEventListener('keydown', (e) => {
  const progView = document.getElementById('view-programmer');
  if (!progView || !progView.classList.contains('active')) return;

  const key = e.key.toUpperCase();
  
  // Digit checks
  const isDigit = (key >= '0' && key <= '9') || (key >= 'A' && key <= 'F');
  
  if (isDigit) {
    // Only allow if base permits
    const isHexDigit = ['A','B','C','D','E','F'].includes(key);
    const isDigit89 = ['8','9'].includes(key);
    const isDigit27 = ['2','3','4','5','6','7'].includes(key);
    
    if (activeBase === 'DEC' && isHexDigit) return;
    if (activeBase === 'OCT' && (isHexDigit || isDigit89)) return;
    if (activeBase === 'BIN' && (isHexDigit || isDigit89 || isDigit27)) return;
    
    handleButton(key);
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    e.preventDefault();
    handleButton(key);
  } else if (key === 'ENTER' || key === '=') {
    e.preventDefault();
    handleButton('=');
  } else if (key === 'BACKSPACE') {
    handleButton('backspace');
  } else if (key === 'ESCAPE') {
    handleButton('C_CLEAR');
  }
});

// Initialization
updateBasesDisplays();
updateKeypadBorders();
renderBitGrid();
