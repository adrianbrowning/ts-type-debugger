---
description: Build components using the TS Type Debugger design system (Dracula theme). Use for UI styling, layouts, buttons, code display, debug components, and theming.
---

# TS Type Debugger - Component Skills Guide

## Purpose

This guide teaches you how to build components using the TS Type Debugger design system. Each section provides step-by-step instructions for implementing common UI patterns.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Building Layouts](#building-layouts)
3. [Creating Buttons](#creating-buttons)
4. [Code Display Components](#code-display-components)
5. [Interactive Sections](#interactive-sections)
6. [Debug Components](#debug-components)
7. [Badges & Indicators](#badges--indicators)
8. [Theme Implementation](#theme-implementation)

---

## Getting Started

### Step 1: Include Required Resources

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App</title>
  
  <!-- Google Fonts: Fira Code -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Your CSS -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Content -->
</body>
</html>
```

### Step 2: Initialize Design Tokens

Copy the design tokens from `references/design-tokens.md` into your CSS:

```css
:root {
  /* Core colors */
  --bg: #282a36;
  --bg-secondary: #21222c;
  --bg-highlight: #44475a;
  --foreground: #f8f8f2;
  --comment: #6272a4;
  
  /* Accent colors */
  --cyan: #8be9fd;
  --green: #50fa7b;
  --orange: #ffb86c;
  --pink: #ff79c6;
  --purple: #bd93f9;
  --red: #ff5555;
  --yellow: #f1fa8c;
  
  /* UI */
  --border: #44475a;
  --radius: 6px;
}

/* Light theme */
body.theme-light {
  --bg: #f8f8f2;
  --bg-secondary: #f1f1f0;
  --bg-highlight: #e8e8e4;
  --foreground: #282a36;
  --comment: #7c8db5;
  --cyan: #0fb9d2;
  --green: #2ecc71;
  --orange: #e6a050;
  --pink: #e06ba8;
  --purple: #9b6dff;
  --red: #e04545;
  --yellow: #d4b830;
  --border: #d6d6d0;
  --shadow: rgba(40, 42, 54, 0.08);
}
```

### Step 3: Set Base Styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--foreground);
  line-height: 1.5;
}
```

---

## Building Layouts

### Skill: Create a Two-Panel Split View

**When to use:** Main application layout with code on left, info on right

**HTML Structure:**
```html
<div class="main-container">
  <!-- Left panel -->
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">Source Code</span>
      <span class="panel-badge">Lines 1-50</span>
    </div>
    <div class="panel-content">
      <!-- Content here -->
    </div>
  </div>
  
  <!-- Right panel -->
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">Debug Info</span>
      <span class="panel-badge">Active</span>
    </div>
    <div class="panel-content">
      <!-- Content here -->
    </div>
  </div>
</div>
```

**CSS:**
```css
.main-container {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 50/50 split */
  height: calc(100vh - 57px);      /* Full height minus header */
}

.panel {
  background: var(--bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.panel:last-child {
  border-right: none;
}

.panel-header {
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--cyan);
}

.panel-badge {
  font-family: 'Fira Code', monospace;
  font-size: 0.75rem;
  padding: 3px 10px;
  background: var(--bg-highlight);
  border-radius: 20px;
  color: var(--comment);
}

.panel-content {
  flex: 1;
  overflow-y: auto;  /* Scrollable content */
}
```

**Responsive Version:**
```css
@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;  /* Stack vertically */
  }
  
  .panel {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}
```

---

## Creating Buttons

### Skill: Standard Button

**When to use:** General actions, form submissions

```html
<button class="btn">Cancel</button>
<button class="btn btn-primary">Save</button>
```

```css
.btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--foreground);
}

.btn:hover {
  background: var(--bg-highlight);
  border-color: var(--purple);
}

.btn-primary {
  background: var(--purple);
  color: var(--bg);
  border-color: var(--purple);
}

body.theme-light .btn-primary {
  color: #fff;
}

.btn-primary:hover {
  background: var(--pink);
  border-color: var(--pink);
}
```

### Skill: Debug Step Buttons

**When to use:** Step-through controls, playback controls

```html
<div class="debug-toolbar">
  <button class="step-btn">◄</button>
  <button class="step-btn primary">▶</button>
  <button class="step-btn">↓ Into</button>
  <button class="step-btn">→ Over</button>
  <button class="step-btn">↑ Out</button>
  <span class="step-counter">Step <span>5</span> / 100</span>
</div>
```

```css
.debug-toolbar {
  padding: 10px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-btn {
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--foreground);
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.step-btn:hover {
  background: var(--bg-highlight);
  border-color: var(--cyan);
  color: var(--cyan);
}

.step-btn.primary {
  background: var(--green);
  color: var(--bg);
  border-color: var(--green);
}

body.theme-light .step-btn.primary {
  color: #fff;
}

.step-btn.primary:hover {
  background: var(--cyan);
  border-color: var(--cyan);
}

.step-counter {
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--comment);
}

.step-counter span {
  color: var(--orange);
  font-weight: 500;
}
```

---

## Code Display Components

### Skill: Syntax-Highlighted Code Block

**When to use:** Displaying TypeScript/JavaScript code

```html
<div class="code-container">
  <div class="code-line">
    <span class="line-num">1</span>
    <span class="line-code">
      <span class="kw">type</span> <span class="type">User</span> = {
    </span>
  </div>
  <div class="code-line active">
    <span class="line-num">2</span>
    <span class="line-code">
      name: <span class="type">string</span>;
    </span>
  </div>
  <div class="code-line">
    <span class="line-num">3</span>
    <span class="line-code">};</span>
  </div>
</div>
```

```css
.code-container {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.7;
  padding: 16px 0;
}

.code-line {
  display: flex;
  padding: 2px 20px;
}

.code-line:hover {
  background: var(--bg-highlight);
}

.line-num {
  width: 50px;
  color: var(--comment);
  text-align: right;
  padding-right: 20px;
  user-select: none;
}

.line-code {
  flex: 1;
}

.code-line.active {
  background: var(--current-line);
  border-left: 3px solid var(--yellow);
  padding-left: 17px;
}

body.theme-light .code-line.active {
  background: rgba(212, 184, 48, 0.15);
}

/* Syntax highlighting */
.kw { color: var(--pink); }
.type { color: var(--cyan); font-style: italic; }
.str { color: var(--yellow); }
.num { color: var(--purple); }
.comment { color: var(--comment); }

body.theme-light .kw { font-weight: 500; }
body.theme-light .type { font-style: normal; }
body.theme-light .str { color: var(--green); }
```

**Pro Tip:** Use a syntax highlighter library like Prism.js or highlight.js to automatically generate the span tags.

---

## Interactive Sections

### Skill: Collapsible Section

**When to use:** Organizing information hierarchically, scope viewers, settings panels

```html
<div class="detail-section">
  <div class="section-header" onclick="toggleSection(this)">
    <span>▼ Variables<span class="section-badge">3</span></span>
    <span class="section-toggle">[-]</span>
  </div>
  <div class="section-body">
    <div class="info-row">
      <span class="info-label">userName</span>
      <span class="info-value">"alice"</span>
    </div>
    <div class="info-row">
      <span class="info-label">userId</span>
      <span class="info-value">123</span>
    </div>
  </div>
</div>
```

```css
.detail-section {
  border-bottom: 1px solid var(--border);
}

.section-header {
  padding: 12px 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--foreground);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
}

.section-header:hover {
  background: var(--bg-highlight);
}

.section-toggle {
  color: var(--comment);
  font-size: 0.75rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  background: var(--bg-highlight);
  border-radius: 11px;
  font-size: 0.75rem;
  color: var(--comment);
}

.section-body {
  padding: 8px 20px 16px;
}

.section-body.collapsed {
  display: none;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.85rem;
}

.info-label {
  color: var(--comment);
}

.info-value {
  font-family: 'Fira Code', monospace;
  color: var(--foreground);
}
```

**JavaScript:**
```javascript
function toggleSection(header) {
  const body = header.nextElementSibling;
  const toggle = header.querySelector('.section-toggle');
  const arrow = header.querySelector('span:first-child');
  
  body.classList.toggle('collapsed');
  
  if (body.classList.contains('collapsed')) {
    toggle.textContent = '[+]';
    arrow.textContent = arrow.textContent.replace('▼', '▶');
  } else {
    toggle.textContent = '[-]';
    arrow.textContent = arrow.textContent.replace('▶', '▼');
  }
}
```

---

## Debug Components

### Skill: Call Stack Display

**When to use:** Showing execution stack, navigation history

```html
<div class="detail-section">
  <div class="section-header">
    <span>▼ Call Stack</span>
  </div>
  <div style="padding: 0;">
    <div class="stack-item">
      <div class="stack-marker"></div>
      <span class="stack-name">main():1</span>
    </div>
    <div class="stack-item current">
      <div class="stack-marker"></div>
      <span class="stack-name">processUser():15</span>
    </div>
  </div>
</div>
```

```css
.stack-item {
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  transition: background 0.15s;
}

.stack-item:hover {
  background: var(--bg-highlight);
}

.stack-item.current {
  background: var(--current-line);
  border-left: 3px solid var(--yellow);
  padding-left: 17px;
}

body.theme-light .stack-item.current {
  background: rgba(212, 184, 48, 0.12);
}

.stack-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--comment);
}

.stack-item.current .stack-marker {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}

body.theme-light .stack-item.current .stack-marker {
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.5);
}

.stack-name {
  font-family: 'Fira Code', monospace;
}
```

### Skill: Expression Value Box

**When to use:** Highlighting current values, showing evaluation results

```html
<div class="expression-box">
  <div class="expression-label">Current Expression</div>
  <div class="expression-value">{ name: string; age: number }</div>
</div>
```

```css
.expression-box {
  margin: 16px 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

body.theme-light .expression-box {
  box-shadow: 0 2px 6px var(--shadow);
}

.expression-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--comment);
  margin-bottom: 8px;
}

.expression-value {
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  color: var(--purple);
}
```

---

## Badges & Indicators

### Skill: Count Badge

**When to use:** Showing item counts, notification indicators

```html
<span>Variables<span class="section-badge">3</span></span>
```

```css
.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  background: var(--bg-highlight);
  border-radius: 11px;
  font-size: 0.75rem;
  color: var(--comment);
}
```

### Skill: Status Indicator Dot

**When to use:** Connection status, active states

```html
<div class="stack-marker"></div>
<div class="stack-marker active"></div>
```

```css
.stack-marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--comment);
}

.stack-marker.active {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}
```

---

## Theme Implementation

### Skill: Add Theme Switching

**Step 1: Add Theme Controls**
```html
<div class="theme-selector">
  <button class="btn" id="theme-system" onclick="setTheme('system')">System</button>
  <button class="btn" id="theme-light" onclick="setTheme('light')">Light</button>
  <button class="btn" id="theme-dark" onclick="setTheme('dark')">Dark</button>
</div>
```

**Step 2: Add JavaScript**
```javascript
const THEME_KEY = 'app-theme';

function setTheme(theme) {
  // Update button states
  document.querySelectorAll('.theme-selector .btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`theme-${theme}`).classList.add('active');
  
  // Store preference
  localStorage.setItem(THEME_KEY, theme);
  
  // Apply theme
  if (theme === 'system') {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('theme-light');
    }
  } else if (theme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  }
}

// Initialize
const savedTheme = localStorage.getItem(THEME_KEY) || 'system';
setTheme(savedTheme);

// Listen for system changes
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (localStorage.getItem(THEME_KEY) === 'system') {
    setTheme('system');
  }
});
```

**Step 3: Add System Theme CSS**
```css
@media (prefers-color-scheme: light) {
  body:not(.theme-dark) {
    --bg: #f8f8f2;
    --foreground: #282a36;
    /* ... all light theme tokens */
  }
}
```

---

## Common Patterns

### Pattern: Empty State

```html
<div class="section-body">
  <div class="empty-state">No variables in scope</div>
</div>
```

```css
.empty-state {
  color: var(--comment);
  font-size: 0.85rem;
  padding: 16px 0;
}
```

### Pattern: Loading State

```html
<div class="section-body">
  <div class="loading-state">
    <div class="spinner"></div>
    <span>Loading...</span>
  </div>
</div>
```

```css
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: var(--comment);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--bg-highlight);
  border-top-color: var(--purple);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Pattern: Header with Logo

```html
<header>
  <div class="logo">
    <div class="logo-icon">TS</div>
    <span class="logo-text">Type Visualizer</span>
  </div>
  <div class="header-actions">
    <button class="btn">Export</button>
    <button class="btn btn-primary">Run</button>
  </div>
</header>
```

```css
header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--purple);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fira Code', monospace;
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--bg);
}

body.theme-light .logo-icon {
  color: #fff;
}

.logo-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--foreground);
}

.header-actions {
  display: flex;
  gap: 10px;
}
```

---

## Troubleshooting

### Issue: Colors not changing with theme

**Solution:** Make sure you're using CSS variables, not hardcoded colors:
```css
/* ❌ Wrong */
background: #282a36;

/* ✅ Correct */
background: var(--bg);
```

### Issue: Fira Code not loading

**Solution:** Check font is loaded and applied correctly:
```css
.code-line {
  font-family: 'Fira Code', monospace; /* Quotes required */
}
```

### Issue: Hover states not working

**Solution:** Add transitions and check specificity:
```css
.btn {
  transition: all 0.15s; /* Required for smooth hover */
}

.btn:hover {
  background: var(--bg-highlight);
}
```

---

## Next Steps

1. **Practice**: Build each component from scratch
2. **Customize**: Adjust spacing and colors to your needs
3. **Extend**: Add new components following the same patterns
4. **Reference**: Keep the design guidelines handy

---

## Additional Resources

- [Complete Design Guidelines](design-guidelines-complete.md)
- [Design Tokens Reference](references/design-tokens.md)
- [Interactive Style Guide](reference-styleguide-complete.html)
- [Template HTML](assets/template.html)
