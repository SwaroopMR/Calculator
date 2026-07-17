/* Standard Calculator Module */

import { formatDisplayNumber, stripCommas, showToast } from './app.js';

// State variables
let currentInput = '0';
let previousInput = '';
let activeOperator = '';
let shouldResetDisplay = false;
let memoryValue = 0;
let hasMemory = false;

// History logs array
let historyLog = [];

// DOM References
const displayMain = document.getElementById('standardDisplay');
const displayHistory = document.getElementById('standardHistoryExpr');
const sidePanel = document.getElementById('standardSidePanel');
const historyList = document.getElementById('historyList');
const memoryList = document.getElementById('memoryList');

const btnMC = document.getElementById('memClear');
const btnMR = document.getElementById('memRecall');
const btnMPlus = document.getElementById('memAdd');
const btnMMinus = document.getElementById('memSubtract');
const btnMS = document.getElementById('memStore');
const btnMv = document.getElementById('memToggleList');

const tabHistory = document.getElementById('tabHistory');
const tabMemory = document.getElementById('tabMemory');
const btnClearHistory = document.getElementById('btnClearHistory');

// --------------------------------------------------------------------------
// 1. RENDER FUNCTIONS
// --------------------------------------------------------------------------
function updateDisplay() {
  if (displayMain) {
    displayMain.textContent = formatDisplayNumber(currentInput);
  }
}

function updateHistoryExpr(expr = '&nbsp;') {
  if (displayHistory) {
    displayHistory.innerHTML = expr;
  }
}

function updateMemoryButtons() {
  if (btnMC && btnMR) {
    btnMC.disabled = !hasMemory;
    btnMR.disabled = !hasMemory;
  }
}

// History Tape rendering
function renderHistory() {
  if (!historyList) return;
  
  if (historyLog.length === 0) {
    historyList.innerHTML = '<div class="empty-list-message">There is no history yet.</div>';
    return;
  }
  
  historyList.innerHTML = '';
  historyLog.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span class="history-item-expr">${item.expr}</span>
      <span class="history-item-result">${formatDisplayNumber(item.result)}</span>
    `;
    div.addEventListener('click', () => {
      currentInput = item.result;
      shouldResetDisplay = true;
      updateDisplay();
      updateHistoryExpr(`${item.expr}`);
    });
    historyList.appendChild(div);
  });
}

// Memory List panel rendering
function renderMemoryList() {
  if (!memoryList) return;
  
  if (!hasMemory) {
    memoryList.innerHTML = '<div class="empty-list-message">There is nothing saved in memory.</div>';
    return;
  }
  
  memoryList.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'memory-item';
  div.innerHTML = `
    <span class="memory-item-val">${formatDisplayNumber(String(memoryValue))}</span>
    <div class="memory-item-actions">
      <button class="btn-mem-action" id="memItemClear">MC</button>
      <button class="btn-mem-action" id="memItemAdd">M+</button>
      <button class="btn-mem-action" id="memItemSub">M-</button>
    </div>
  `;
  
  // Attach sub button listeners inside list
  div.querySelector('#memItemClear').addEventListener('click', (e) => {
    e.stopPropagation();
    clearMemory();
  });
  div.querySelector('#memItemAdd').addEventListener('click', (e) => {
    e.stopPropagation();
    addToMemory(Number(currentInput));
  });
  div.querySelector('#memItemSub').addEventListener('click', (e) => {
    e.stopPropagation();
    subtractFromMemory(Number(currentInput));
  });
  
  div.addEventListener('click', () => {
    currentInput = String(memoryValue);
    shouldResetDisplay = true;
    updateDisplay();
  });
  
  memoryList.appendChild(div);
}

// --------------------------------------------------------------------------
// 2. COMPUTATIONAL LOGIC
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
    default: return;
  }
  
  // Format floats carefully
  const resultStr = String(result);
  if (resultStr.includes('.') && resultStr.split('.')[1].length > 10) {
    return String(Number(result.toFixed(10)));
  }
  return resultStr;
}

// --------------------------------------------------------------------------
// 3. EVENT HANDLERS FOR BUTTON PRESSES
// --------------------------------------------------------------------------
function handleButton(val) {
  if (val >= '0' && val <= '9') {
    if (currentInput === '0' || shouldResetDisplay) {
      currentInput = val;
      shouldResetDisplay = false;
    } else {
      // Prevent overflow
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
  
  else if (val === 'CE') {
    currentInput = '0';
    updateDisplay();
  } 
  
  else if (val === '%') {
    // Standard percentage division
    let numVal = Number(stripCommas(currentInput));
    if (!isNaN(numVal)) {
      currentInput = String(numVal / 100);
      updateDisplay();
    }
  } 
  
  else if (val === '1/x') {
    let numVal = Number(stripCommas(currentInput));
    if (numVal === 0) {
      showToast("Cannot divide by zero", "x-circle");
      currentInput = 'Error';
    } else {
      currentInput = String(1 / numVal);
    }
    shouldResetDisplay = true;
    updateDisplay();
  } 
  
  else if (val === 'x2') {
    let numVal = Number(stripCommas(currentInput));
    currentInput = String(Math.pow(numVal, 2));
    shouldResetDisplay = true;
    updateDisplay();
  } 
  
  else if (val === 'sqrt') {
    let numVal = Number(stripCommas(currentInput));
    if (numVal < 0) {
      showToast("Invalid Input", "x-circle");
      currentInput = 'Error';
    } else {
      currentInput = String(Math.sqrt(numVal));
    }
    shouldResetDisplay = true;
    updateDisplay();
  } 
  
  // Basic Operators (+, -, *, /)
  else if (['+', '-', '*', '/'].includes(val)) {
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
    let opSymbol = val === '*' ? '×' : val === '/' ? '÷' : val;
    updateHistoryExpr(`${formatDisplayNumber(previousInput)} ${opSymbol}`);
    shouldResetDisplay = true;
  } 
  
  // Equals Calculation
  else if (val === '=') {
    if (!activeOperator) return;
    
    let opSymbol = activeOperator === '*' ? '×' : activeOperator === '/' ? '÷' : activeOperator;
    let fullExpr = `${formatDisplayNumber(previousInput)} ${opSymbol} ${formatDisplayNumber(currentInput)} =`;
    
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
      
      // Save to History list
      historyLog.unshift({ expr: fullExpr, result: result });
      if (historyLog.length > 50) historyLog.pop(); // Cap history
      renderHistory();
      
      currentInput = result;
      previousInput = '';
      activeOperator = '';
      shouldResetDisplay = true;
      updateDisplay();
      updateHistoryExpr(fullExpr);
    }
  }
}

// --------------------------------------------------------------------------
// 4. MEMORY TRIGGERS
// --------------------------------------------------------------------------
function clearMemory() {
  memoryValue = 0;
  hasMemory = false;
  updateMemoryButtons();
  renderMemoryList();
  showToast("Memory cleared", "trash");
}

function storeMemory(val) {
  memoryValue = val;
  hasMemory = true;
  updateMemoryButtons();
  renderMemoryList();
  showToast(`Saved ${formatDisplayNumber(String(val))} to memory`, "save");
}

function addToMemory(val) {
  memoryValue += val;
  hasMemory = true;
  updateMemoryButtons();
  renderMemoryList();
  showToast(`Added to memory: subtotal ${formatDisplayNumber(String(memoryValue))}`, "plus");
}

function subtractFromMemory(val) {
  memoryValue -= val;
  hasMemory = true;
  updateMemoryButtons();
  renderMemoryList();
  showToast(`Subtracted from memory: subtotal ${formatDisplayNumber(String(memoryValue))}`, "minus");
}

// Bind Memory Buttons
if (btnMC) btnMC.addEventListener('click', () => clearMemory());
if (btnMR) {
  btnMR.addEventListener('click', () => {
    currentInput = String(memoryValue);
    shouldResetDisplay = true;
    updateDisplay();
  });
}
if (btnMPlus) {
  btnMPlus.addEventListener('click', () => {
    let numVal = Number(stripCommas(currentInput));
    if (!isNaN(numVal)) addToMemory(numVal);
  });
}
if (btnMMinus) {
  btnMMinus.addEventListener('click', () => {
    let numVal = Number(stripCommas(currentInput));
    if (!isNaN(numVal)) subtractFromMemory(numVal);
  });
}
if (btnMS) {
  btnMS.addEventListener('click', () => {
    let numVal = Number(stripCommas(currentInput));
    if (!isNaN(numVal)) storeMemory(numVal);
  });
}
if (btnMv) {
  btnMv.addEventListener('click', () => {
    // Toggle active list tab in Side Panel to Memory
    if (tabMemory) {
      tabMemory.click();
    }
  });
}

// --------------------------------------------------------------------------
// 5. SIDE PANEL SIDEBAR LOGIC (History & Memory Tabs)
// --------------------------------------------------------------------------
if (tabHistory && tabMemory) {
  tabHistory.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabMemory.classList.remove('active');
    historyList.classList.add('active');
    memoryList.classList.remove('active');
  });

  tabMemory.addEventListener('click', () => {
    tabMemory.classList.add('active');
    tabHistory.classList.remove('active');
    memoryList.classList.add('active');
    historyList.classList.remove('active');
  });
}

if (btnClearHistory) {
  btnClearHistory.addEventListener('click', () => {
    const isHistoryActive = tabHistory.classList.contains('active');
    if (isHistoryActive) {
      historyLog = [];
      renderHistory();
      showToast("History cleared", "trash-2");
    } else {
      clearMemory();
    }
  });
}

// --------------------------------------------------------------------------
// 6. INITIALIZATION & GLOBAL BINDINGS
// --------------------------------------------------------------------------

// Bind Click on standard buttons
document.querySelectorAll('.standard-keypad button').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.getAttribute('data-val');
    if (value) handleButton(value);
  });
});

// Document Keyboard listener
document.addEventListener('keydown', (e) => {
  // Only handle keys if standard view is active
  const standardView = document.getElementById('view-standard');
  if (!standardView || !standardView.classList.contains('active')) return;

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
  } else if (key === 'Delete') {
    handleButton('CE');
  } else if (key === '%') {
    handleButton('%');
  }
});

// Load defaults
updateDisplay();
updateMemoryButtons();
renderHistory();
renderMemoryList();
