/* Scientific Calculator Module */

import { formatDisplayNumber, stripCommas, showToast } from './app.js';

// State variables
let currentInput = '0';
let previousInput = '';
let activeOperator = '';
let shouldResetDisplay = false;
let angleUnit = 'DEG'; // DEG or RAD
let isFEActive = false;
let isSecondActive = false;
let isHypActive = false;

// DOM References
const displayMain = document.getElementById('scientificDisplay');
const displayHistory = document.getElementById('scientificHistoryExpr');
const btnRadDeg = document.getElementById('btnSciRadDeg');
const btnFE = document.getElementById('btnSciFE');
const btnHyp = document.getElementById('btnSciHyp');

// --------------------------------------------------------------------------
// 1. UTILITY FUNCTIONS
// --------------------------------------------------------------------------
function updateDisplay() {
  if (!displayMain) return;
  
  let valToFormat = currentInput;
  if (isFEActive && valToFormat !== 'Error') {
    const num = Number(stripCommas(valToFormat));
    if (!isNaN(num)) {
      valToFormat = num.toExponential(6);
    }
  }
  
  displayMain.textContent = formatDisplayNumber(valToFormat);
}

function updateHistoryExpr(expr = '&nbsp;') {
  if (displayHistory) {
    displayHistory.innerHTML = expr;
  }
}

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) return NaN;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
    if (result === Infinity) return Infinity;
  }
  return result;
}

// --------------------------------------------------------------------------
// 2. MATH COMPUTATION ENGINE
// --------------------------------------------------------------------------
function calculate() {
  let prev = Number(stripCommas(previousInput));
  let curr = Number(stripCommas(currentInput));
  let result = 0;
  
  if (isNaN(prev) || isNaN(curr)) return;
  
  switch (activeOperator) {
    case '+': result = prev + curr; break;
    case '-': result = prev - curr; break;
    case '*': result = prev * curr; break;
    case '/':
      if (curr === 0) {
        showToast("Cannot divide by zero", "x-circle");
        return 'Error';
      }
      result = prev / curr;
      break;
    case 'xy':
      result = Math.pow(prev, curr);
      break;
    case 'mod':
      result = prev % curr;
      break;
    case 'exp':
      // prev * 10^curr
      result = prev * Math.pow(10, curr);
      break;
    default: return;
  }
  
  const resultStr = String(result);
  if (resultStr.includes('.') && resultStr.split('.')[1].length > 10) {
    return String(Number(result.toFixed(10)));
  }
  return resultStr;
}

// --------------------------------------------------------------------------
// 3. SCIENTIFIC KEYPAD EVENT ROUTING
// --------------------------------------------------------------------------
function handleButton(val) {
  // 1. Digits
  if (val >= '0' && val <= '9') {
    if (currentInput === '0' || shouldResetDisplay) {
      currentInput = val;
      shouldResetDisplay = false;
    } else {
      if (currentInput.replace(/,/g, '').length < 16) {
        currentInput += val;
      }
    }
    updateDisplay();
  } 
  
  else if (val === '.') {
    if (shouldResetDisplay) {
      currentInput = '0.';
      shouldResetDisplay = false;
      updateDisplay();
      return;
    }
    if (!currentInput.includes('.')) {
      currentInput += '.';
      updateDisplay();
    }
  } 
  
  else if (val === '+/-') {
    if (currentInput !== '0') {
      if (currentInput.startsWith('-')) {
        currentInput = currentInput.substring(1);
      } else {
        currentInput = '-' + currentInput;
      }
      updateDisplay();
    }
  } 
  
  else if (val === 'backspace') {
    if (shouldResetDisplay) {
      updateHistoryExpr('&nbsp;');
      return;
    }
    if (currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
      if (currentInput === '-') currentInput = '0';
    } else {
      currentInput = '0';
    }
    updateDisplay();
  } 
  
  else if (val === 'C') {
    currentInput = '0';
    previousInput = '';
    activeOperator = '';
    shouldResetDisplay = false;
    updateDisplay();
    updateHistoryExpr('&nbsp;');
  } 
  
  // Constants
  else if (val === 'pi') {
    currentInput = String(Math.PI);
    shouldResetDisplay = true;
    updateDisplay();
  } 
  
  else if (val === 'e') {
    currentInput = String(Math.E);
    shouldResetDisplay = true;
    updateDisplay();
  } 
  
  // Single operand immediate operations
  else if ([
    'x2', '1/x', 'abs', 'fact', 'sqrt', 'log', 'ln', '10x', 
    'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh'
  ].includes(val)) {
    let numVal = Number(stripCommas(currentInput));
    if (isNaN(numVal)) return;
    
    let result = 0;
    let label = '';
    
    switch (val) {
      case 'x2':
        result = Math.pow(numVal, 2);
        label = `sqr(${numVal})`;
        break;
      case '1/x':
        if (numVal === 0) {
          showToast("Cannot divide by zero", "x-circle");
          currentInput = 'Error';
          updateDisplay();
          return;
        }
        result = 1 / numVal;
        label = `1/(${numVal})`;
        break;
      case 'abs':
        result = Math.abs(numVal);
        label = `abs(${numVal})`;
        break;
      case 'fact':
        if (numVal < 0 || !Number.isInteger(numVal)) {
          showToast("Invalid Input", "x-circle");
          currentInput = 'Error';
          updateDisplay();
          return;
        }
        result = factorial(numVal);
        label = `fact(${numVal})`;
        break;
      case 'sqrt':
        if (numVal < 0) {
          showToast("Invalid Input", "x-circle");
          currentInput = 'Error';
          updateDisplay();
          return;
        }
        result = Math.sqrt(numVal);
        label = `sqrt(${numVal})`;
        break;
      case 'log':
        if (numVal <= 0) {
          showToast("Invalid Input", "x-circle");
          currentInput = 'Error';
          updateDisplay();
          return;
        }
        result = Math.log10(numVal);
        label = `log(${numVal})`;
        break;
      case 'ln':
        if (numVal <= 0) {
          showToast("Invalid Input", "x-circle");
          currentInput = 'Error';
          updateDisplay();
          return;
        }
        result = Math.log(numVal);
        label = `ln(${numVal})`;
        break;
      case '10x':
        result = Math.pow(10, numVal);
        label = `10^(${numVal})`;
        break;
      
      // Trigonometric (Trig) Operations
      case 'sin':
        let angleSin = angleUnit === 'DEG' ? numVal * (Math.PI / 180) : numVal;
        result = isSecondActive ? Math.asin(numVal) : Math.sin(angleSin);
        label = isSecondActive ? `asin(${numVal})` : `sin(${numVal})`;
        break;
      case 'cos':
        let angleCos = angleUnit === 'DEG' ? numVal * (Math.PI / 180) : numVal;
        result = isSecondActive ? Math.acos(numVal) : Math.cos(angleCos);
        label = isSecondActive ? `acos(${numVal})` : `cos(${numVal})`;
        break;
      case 'tan':
        let angleTan = angleUnit === 'DEG' ? numVal * (Math.PI / 180) : numVal;
        result = isSecondActive ? Math.atan(numVal) : Math.tan(angleTan);
        label = isSecondActive ? `atan(${numVal})` : `tan(${numVal})`;
        break;
      case 'sinh':
        result = Math.sinh(numVal);
        label = `sinh(${numVal})`;
        break;
      case 'cosh':
        result = Math.cosh(numVal);
        label = `cosh(${numVal})`;
        break;
      case 'tanh':
        result = Math.tanh(numVal);
        label = `tanh(${numVal})`;
        break;
    }
    
    if (isNaN(result)) {
      currentInput = 'Error';
    } else {
      // Fix float inaccuracies
      const resultStr = String(result);
      if (resultStr.includes('.') && resultStr.split('.')[1].length > 10) {
        currentInput = String(Number(result.toFixed(10)));
      } else {
        currentInput = resultStr;
      }
    }
    
    updateHistoryExpr(label);
    shouldResetDisplay = true;
    updateDisplay();
  }
  
  // Binary operators (+, -, *, /, xy, mod, exp)
  else if (['+', '-', '*', '/', 'xy', 'mod', 'exp'].includes(val)) {
    if (activeOperator && !shouldResetDisplay) {
      const result = calculate();
      if (result === 'Error') {
        currentInput = '0';
        previousInput = '';
        activeOperator = '';
        updateDisplay();
        return;
      }
      previousInput = result;
      currentInput = result;
      updateDisplay();
    } else {
      previousInput = currentInput;
    }
    
    activeOperator = val;
    let symbol = val;
    if (val === '*') symbol = '×';
    if (val === '/') symbol = '÷';
    if (val === 'xy') symbol = '^';
    if (val === 'mod') symbol = 'mod';
    if (val === 'exp') symbol = ',e+';
    
    updateHistoryExpr(`${formatDisplayNumber(previousInput)} ${symbol}`);
    shouldResetDisplay = true;
  }
  
  // Equals Calculation
  else if (val === '=') {
    if (!activeOperator) return;
    
    let symbol = activeOperator;
    if (activeOperator === '*') symbol = '×';
    if (activeOperator === '/') symbol = '÷';
    if (activeOperator === 'xy') symbol = '^';
    if (activeOperator === 'mod') symbol = 'mod';
    if (activeOperator === 'exp') symbol = ',e+';
    
    let expr = `${formatDisplayNumber(previousInput)} ${symbol} ${formatDisplayNumber(currentInput)} =`;
    const result = calculate();
    
    if (result !== undefined) {
      if (result === 'Error') {
        currentInput = '0';
        previousInput = '';
        activeOperator = '';
        updateDisplay();
        updateHistoryExpr('&nbsp;');
        return;
      }
      
      currentInput = result;
      previousInput = '';
      activeOperator = '';
      shouldResetDisplay = true;
      updateDisplay();
      updateHistoryExpr(expr);
    }
  }
  
  // 2nd row function shifting
  else if (val === '2nd') {
    isSecondActive = !isSecondActive;
    const btn2nd = document.querySelector('.btn-sci[data-val="2nd"]');
    
    // Update visual styles of trigonometric labels
    const btnSin = document.querySelector('.btn-sci[data-val="sin"]');
    const btnCos = document.querySelector('.btn-sci[data-val="cos"]');
    const btnTan = document.querySelector('.btn-sci[data-val="tan"]');
    
    if (isSecondActive) {
      btn2nd.classList.add('active');
      if (btnSin) btnSin.innerHTML = 'sin<sup>-1</sup>';
      if (btnCos) btnCos.innerHTML = 'cos<sup>-1</sup>';
      if (btnTan) btnTan.innerHTML = 'tan<sup>-1</sup>';
    } else {
      btn2nd.classList.remove('active');
      if (btnSin) btnSin.textContent = 'sin';
      if (btnCos) btnCos.textContent = 'cos';
      if (btnTan) btnTan.textContent = 'tan';
    }
  }
}

// --------------------------------------------------------------------------
// 4. MODE TOGGLE HANDLERS (DEG/RAD, F-E, HYP)
// --------------------------------------------------------------------------
if (btnRadDeg) {
  btnRadDeg.addEventListener('click', () => {
    angleUnit = angleUnit === 'DEG' ? 'RAD' : 'DEG';
    btnRadDeg.textContent = angleUnit;
    showToast(`Angle unit set to ${angleUnit}`, 'compass');
  });
}

if (btnFE) {
  btnFE.addEventListener('click', () => {
    isFEActive = !isFEActive;
    btnFE.classList.toggle('active', isFEActive);
    updateDisplay();
    showToast(`Scientific format ${isFEActive ? 'activated' : 'deactivated'}`, 'terminal');
  });
}

if (btnHyp) {
  btnHyp.addEventListener('click', () => {
    isHypActive = !isHypActive;
    btnHyp.classList.toggle('active', isHypActive);
    
    // Toggle hyperbolic trig row visibility (or just handle it smoothly)
    const trigRow = document.querySelector('.trig-row');
    if (trigRow) {
      trigRow.style.display = isHypActive ? 'grid' : 'none';
    }
    showToast(`Hyperbolic trig functions ${isHypActive ? 'shown' : 'hidden'}`, 'layout-grid');
  });
}

// --------------------------------------------------------------------------
// 5. ATTACH SCIENTIFIC BUTTONS CLICK
// --------------------------------------------------------------------------
document.querySelectorAll('.scientific-keypad button').forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-val');
    if (val && val !== 'C' && val !== 'backspace' && val !== '2nd') {
      handleButton(val);
    }
  });
});

// Bind general keys specifically for Scientific clear / delete actions
const btnSciClear = document.querySelector('.scientific-keypad button[data-val="C"]');
const btnSciBackspace = document.querySelector('.scientific-keypad button[data-val="backspace"]');

if (btnSciClear) {
  btnSciClear.addEventListener('click', () => handleButton('C'));
}
if (btnSciBackspace) {
  btnSciBackspace.addEventListener('click', () => handleButton('backspace'));
}

// Add secondary trigs binding directly if they are outside grid
document.querySelectorAll('.trig-row button').forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-val');
    if (val) handleButton(val);
  });
});

// Keyboard bindings (active in Scientific view)
document.addEventListener('keydown', (e) => {
  const sciView = document.getElementById('view-scientific');
  if (!sciView || !sciView.classList.contains('active')) return;

  const key = e.key;
  if (key >= '0' && key <= '9') {
    handleButton(key);
  } else if (key === '.') {
    handleButton('.');
  } else if (key === '+' || key === '-' || key === '*' || key === '/') {
    e.preventDefault();
    handleButton(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    handleButton('=');
  } else if (key === 'Backspace') {
    handleButton('backspace');
  } else if (key === 'Escape') {
    handleButton('C');
  }
});

// Init
updateDisplay();
// Trig row hidden initially
const trigRow = document.querySelector('.trig-row');
if (trigRow) trigRow.style.display = 'none';
