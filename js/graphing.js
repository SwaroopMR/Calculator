/* Graphing Calculator Module */

import { showToast } from './app.js';

// Graphing View State
let centerX = 0;
let centerY = 0;
let scale = 40; // Pixels per unit
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

// Equations array
const equations = [
  { id: 1, expr: 'x^2 - 2', color: '#f87171', visible: true, fn: null },
  { id: 2, expr: '3*sin(x)', color: '#60a5fa', visible: true, fn: null },
  { id: 3, expr: '', color: '#34d399', visible: false, fn: null }
];

// DOM references
const canvas = document.getElementById('graphCanvas');
let ctx = null;

if (canvas) {
  ctx = canvas.getContext('2d');
}

// --------------------------------------------------------------------------
// 1. EXPRESSION COMPILER
// --------------------------------------------------------------------------
function compileExpression(expr) {
  let clean = expr.trim().toLowerCase();
  if (!clean) return null;
  
  // Clean mathematical input formatting
  // Replace implied multiplications like "2x" or "2(x)" with "2*x"
  clean = clean.replace(/(\d)(x)/g, '$1*$2');
  clean = clean.replace(/(\d)(\()/g, '$1*$2');
  clean = clean.replace(/(\))(\d)/g, '$1*$2');
  clean = clean.replace(/(\))(x)/g, '$1*$2');
  
  // Syntax whitelist safety check
  const allowedChars = /^[a-z0-9\s.+\-*/%()^]+$/;
  if (!allowedChars.test(clean)) {
    return null;
  }

  // Swap keywords with Javascript Math utilities
  clean = clean
    .replace(/\^/g, '**')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\blog\b/g, 'Math.log10')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E');

  try {
    const compiled = new Function('x', `try { return ${clean}; } catch(err) { return NaN; }`);
    compiled(1); // Test calculation
    return compiled;
  } catch (e) {
    return null;
  }
}

// Update equations formulas
function parseEquations() {
  equations.forEach(eq => {
    const row = document.querySelector(`.equation-row[data-id="${eq.id}"]`);
    if (row) {
      const input = row.querySelector('.eq-input');
      const visibleCheck = row.querySelector('.eq-visible');
      
      eq.expr = input.value;
      eq.visible = visibleCheck.checked;
      eq.fn = eq.visible ? compileExpression(eq.expr) : null;
    }
  });
}

// --------------------------------------------------------------------------
// 2. CANVAS COORDINATE TRANSFORMS
// --------------------------------------------------------------------------
function toScreenX(x) {
  return canvas.width / 2 + (x - centerX) * scale;
}

function toScreenY(y) {
  return canvas.height / 2 - (y - centerY) * scale;
}

function toGraphX(screenX) {
  return (screenX - canvas.width / 2) / scale + centerX;
}

function toGraphY(screenY) {
  return -(screenY - canvas.height / 2) / scale + centerY;
}

// Query styling color properties from body stylesheet
function getThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    bg: styles.getPropertyValue('--bg-card').trim() || '#18181b',
    text: styles.getPropertyValue('--text-main').trim() || '#f4f4f5',
    textMuted: styles.getPropertyValue('--text-muted').trim() || '#a1a1aa',
    border: styles.getPropertyValue('--border-color').trim() || 'rgba(255, 255, 255, 0.08)',
    primary: styles.getPropertyValue('--primary').trim() || '#c084fc'
  };
}

// --------------------------------------------------------------------------
// 3. CANVAS PLOT DRAWING
// --------------------------------------------------------------------------
function drawGraph() {
  if (!ctx || !canvas) return;
  
  const colors = getThemeColors();
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);
  
  // 1. Draw Grid Lines
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 0.5;
  ctx.fillStyle = colors.textMuted;
  ctx.font = '10px var(--font-mono)';
  
  // Determine grid intervals based on zoom scale
  let interval = 1;
  if (scale < 10) interval = 10;
  else if (scale < 25) interval = 5;
  else if (scale > 150) interval = 0.2;
  else if (scale > 300) interval = 0.1;
  
  const minX = toGraphX(0);
  const maxX = toGraphX(width);
  const minY = toGraphY(height);
  const maxY = toGraphY(0);
  
  // Vertical grid lines
  let startGridX = Math.floor(minX / interval) * interval;
  for (let x = startGridX; x <= maxX; x += interval) {
    const sx = toScreenX(x);
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
    
    // Label X ticks
    if (Math.abs(x) > 0.0001) {
      const sy = Math.max(15, Math.min(height - 5, toScreenY(0) + 12));
      ctx.fillText(Number(x.toFixed(2)), sx + 4, sy);
    }
  }
  
  // Horizontal grid lines
  let startGridY = Math.floor(minY / interval) * interval;
  for (let y = startGridY; y <= maxY; y += interval) {
    const sy = toScreenY(y);
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
    ctx.stroke();
    
    // Label Y ticks
    if (Math.abs(y) > 0.0001) {
      const sx = Math.max(5, Math.min(width - 25, toScreenX(0) + 4));
      ctx.fillText(Number(y.toFixed(2)), sx, sy - 4);
    }
  }
  
  // 2. Draw Main Cartesian Axes
  ctx.strokeStyle = colors.textMuted;
  ctx.lineWidth = 1.5;
  
  const axesY = toScreenY(0);
  const axesX = toScreenX(0);
  
  // X axis
  ctx.beginPath();
  ctx.moveTo(0, axesY);
  ctx.lineTo(width, axesY);
  ctx.stroke();
  
  // Y axis
  ctx.beginPath();
  ctx.moveTo(axesX, 0);
  ctx.lineTo(axesX, height);
  ctx.stroke();
  
  // Label Origin
  ctx.fillText('0', axesX + 6, axesY - 6);
  
  // 3. Draw Equations Curves
  equations.forEach(eq => {
    if (!eq.visible || !eq.fn) return;
    
    ctx.strokeStyle = eq.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    let isDrawingLine = false;
    let prevY = 0;
    
    for (let sx = 0; sx <= width; sx++) {
      const x = toGraphX(sx);
      const y = eq.fn(x);
      
      if (typeof y === 'number' && isFinite(y) && !isNaN(y)) {
        const sy = toScreenY(y);
        
        // Detect huge jumps (asymptotes like tan(x) or 1/x)
        const isDiscontinuous = isDrawingLine && Math.abs(y - prevY) * scale > height;
        
        if (!isDrawingLine || isDiscontinuous) {
          ctx.moveTo(sx, sy);
          isDrawingLine = true;
        } else {
          ctx.lineTo(sx, sy);
        }
        prevY = y;
      } else {
        isDrawingLine = false;
      }
    }
    ctx.stroke();
  });
}

function resizeCanvas() {
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (parent) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    drawGraph();
  }
}

// --------------------------------------------------------------------------
// 4. USER MOUSE / INTERACTION CONTROLS
// --------------------------------------------------------------------------
if (canvas) {
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    centerX -= dx / scale;
    centerY += dy / scale;
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    drawGraph();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    
    centerX -= dx / scale;
    centerY += dy / scale;
    
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    
    drawGraph();
  });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zooming via scrollwheel
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    
    // Zoom centered on cursor position
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    const graphMouseX = toGraphX(mouseX);
    const graphMouseY = toGraphY(mouseY);
    
    scale *= zoomFactor;
    // Bound scale limit
    if (scale < 4) scale = 4;
    if (scale > 1000) scale = 1000;
    
    centerX = graphMouseX - (mouseX - canvas.width / 2) / scale;
    centerY = graphMouseY + (mouseY - canvas.height / 2) / scale;
    
    drawGraph();
  }, { passive: false });
}

// Zoom Overlays clicks
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnResetView = document.getElementById('btnResetView');

if (btnZoomIn) {
  btnZoomIn.addEventListener('click', () => {
    scale *= 1.25;
    drawGraph();
  });
}
if (btnZoomOut) {
  btnZoomOut.addEventListener('click', () => {
    scale /= 1.25;
    drawGraph();
  });
}
if (btnResetView) {
  btnResetView.addEventListener('click', () => {
    centerX = 0;
    centerY = 0;
    scale = 40;
    drawGraph();
    showToast("Plot view reset", "maximize-2");
  });
}

// --------------------------------------------------------------------------
// 5. INPUT LISTENERS
// --------------------------------------------------------------------------
document.querySelectorAll('.equation-row').forEach(row => {
  const input = row.querySelector('.eq-input');
  const checkbox = row.querySelector('.eq-visible');
  
  if (input) {
    input.addEventListener('input', () => {
      parseEquations();
      drawGraph();
    });
  }
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      parseEquations();
      drawGraph();
    });
  }
});

// Preset presets bindings
document.querySelectorAll('.btn-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const expr = btn.getAttribute('data-expr');
    
    // Inject into Equation 1
    const eq1Row = document.querySelector('.equation-row[data-id="1"]');
    if (eq1Row) {
      const input = eq1Row.querySelector('.eq-input');
      const checkbox = eq1Row.querySelector('.eq-visible');
      if (input && checkbox) {
        input.value = expr;
        checkbox.checked = true;
        
        parseEquations();
        drawGraph();
        showToast(`Loaded Preset: ${expr}`, "line-chart");
      }
    }
  });
});

// Listen to View Changes or Theme updates
window.addEventListener('viewchanged', (e) => {
  if (e.detail.viewName === 'graphing') {
    // Redraw and recalculate when layout shows up
    setTimeout(() => {
      resizeCanvas();
    }, 150);
  }
});

// Watch window resizes
window.addEventListener('resize', resizeCanvas);

// Watch theme selection updates
const themeObserver = new MutationObserver(() => {
  if (document.getElementById('view-graphing').classList.contains('active')) {
    drawGraph();
  }
});
themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

// Init
parseEquations();
setTimeout(resizeCanvas, 200);
