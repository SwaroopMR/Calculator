# 🧮CALCI Premium Calculator

A premium, feature-rich, and highly polished **frontend-only calculator application** designed with modern typography, glassmorphic interfaces, and responsive layouts. Built entirely using raw vanilla technologies (HTML5, CSS3, and ES6 Javascript modules) with **zero dependencies**.

## 🎨 Themes
Customize your workspace with **8 vibrant, responsive color themes** configurable via the application settings:
- 🖤 **Black** (Sleek deep dark default)
- 🤍 **White** (Clean modern light)
- 💛 **Yellow** (Warm golden accents)
- 💚 **Green** (Emerald forest)
- 💗 **Pink** (Vibrant rose)
- ❤️ **Red** (Ruby crimson)
- 💙 **Blue** (Royal blue)
- 🧡 **Orange** (Vibrant pumpkin)

---

## 🚀 Calculator Modes

### 1. 🎛️ Standard Calculator
- Supports basic arithmetic, decimals, signs, bracket scopes, and percentage calculations.
- Houses a dedicated memory bank register (`MC`, `MR`, `M+`, `M-`, `MS`).
- Features a side history panel (desktop) to log previous computations, allowing you to click entries to load them back into the workspace.

### 2. 🧪 Scientific Calculator
- Implements logarithmic (`log`, `ln`), exponential (`10^x`, `e^x`, `F-E`), factorials (`n!`), absolute values, and constants ($\pi$ and $e$).
- Supports trigonometric (`sin`, `cos`, `tan`) and hyperbolic (`sinh`, `cosh`, `tanh`) functions.
- Toggles between **DEG** (Degrees) and **RAD** (Radians) angle units.
- Features a `2nd` shift mode to unlock inverse trigonometric arcs (`sin⁻¹`, `cos⁻¹`, `tan⁻¹`).

### 3. 📈 Graphing Calculator
- Renders an interactive Cartesian coordinate plane on a high-performance `<canvas>`.
- Allows dragging to pan the grid and using the scrollwheel (or zoom overlay buttons) to zoom in and out.
- Renders multiple custom equations (e.g. `y = x^2 - 2` or `y = sin(x)`) simultaneously in color-coded plots.
- Features safety regex scanning to prevent code execution injection, and discontinuity logic to prevent vertical connector lines crossing asymptotes (like `1/x` or `tan(x)`).

### 4. 💻 Programmer Calculator
- Concurrently displays number values across **HEX** (Hexadecimal), **DEC** (Decimal), **OCT** (Octal), and **BIN** (Binary) formats.
- Built on native JS `BigInt` to handle large 64-bit precision without rounding errors.
- Integrates a **64-bit Bit Toggle Visualizer** where users can click individual bits to toggle values.
- Supports bitwise operations: `AND`, `OR`, `XOR`, `NOT`, logical shifts (`Lsh`, `Rsh`), and bitwise rotations (`RoL`, `RoR`).
- Sets bit depths to **QWORD** (64-bit), **DWORD** (32-bit), **WORD** (16-bit), or **BYTE** (8-bit), auto-disabling out-of-range keys.

### 5. 📅 Date Calculation
- **Difference Calculator**: Computes exact duration difference (years, months, weeks, days) between two selected calendar dates.
- **Arithmetic Calculator**: Adds or subtracts custom offsets (years, months, days) to a starting date to compute resulting calendar dates.

---

## 🔄 Converter Modes
Features **13 unified converter views** with two-way calculations (typing in either field recalculates the other):
- 💵 **Currency**: Automatically fetches live currency exchange rates from the `open.er-api.com` API, showing rates metadata timestamps, and falling back gracefully to hardcoded offline rates.
- 💧 **Volume**: Milliliters, Liters, Cubic meters, Cups, Gallons, Fluid Ounces, Quarts, Pints, etc.
- 📏 **Length**: Millimeters, Centimeters, Meters, Kilometers, Inches, Feet, Yards, Miles, etc.
- ⚖️ **Weight & Mass**: Grams, Kilograms, Pounds, Ounces, Stones, Tons.
- 🌡️ **Temperature**: Celsius, Fahrenheit, Kelvin (utilizing formula conversions).
- ⚡ **Energy**: Joules, Calories, Kilocalories, Watt-hours, Kilowatt-hours, BTUs, etc.
- 🗺️ **Area**: Square Meters, Square Kilometers, Acres, Hectares, Square Feet, etc.
- 🚀 **Speed**: Meters per second, Kilometers per hour, Miles per hour, Knots, Mach.
- ⏱️ **Time**: Milliseconds, Seconds, Minutes, Hours, Days, Weeks, Months, Years.
- 🔌 **Power**: Watts, Kilowatts, Megawatts, Horsepower.
- 💾 **Data (Storage)**: Bits, Bytes, Kilobytes, Megabytes, Gigabytes (Decimal), Kibibytes, Mebibytes, Gibibytes (Binary).
- 🌬️ **Pressure**: Pascals, Kilopascals, Bars, PSI, Atmospheres.
- 📐 **Angle**: Degrees, Radians, Gradians.

---

## 🛠️ Technology Stack
- **Structure**: Semantic HTML5.
- **Styling**: Vanilla CSS3, Grid/Flexbox layouts, glassmorphic styling filters, custom variable system, responsive media queries.
- **Logic**: Vanilla ES6 JS Modules.
- **Icons**: Lucide Icons CDN.
- **Micro-Interactions**: Web Audio API (subtle synthetic clicks synthesized in real time on-the-fly).

---

## 🚀 How to Run Locally

Since this is a client-side frontend application built with native ES Modules, it can be run instantly in any modern web browser:
1. Clone this repository:
   ```bash
   git clone https://github.com/SwaroopMR/Calculator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Calculator
   ```
3. Open `index.html` directly in your browser, or run a simple local server if using strict CORS rules:
   ```bash
   # Python 3
   python -m http.server 8000
   # Node.js
   npx serve .
   ```

---

## 📜 License & Agreements
Distributed under the **MIT License**. View terms and agreements inside the **About** section of the app. 

*© 2026 Antigravity Calculator. All rights reserved.*
