# ⚜️ SOC X — Complete Frontend Design System & Engineering Blueprint
> **A Comprehensive Specification for AI Agents & Engineers to Replicate the Luxury Stealth Glassmorphic SOC X Interface**

---

## 1. Aesthetic Vision & Design Philosophy

The **SOC X** design system represents an **Executive Stealth Cyber Luxury** aesthetic. Unlike standard neon-green terminal screens or generic corporate dashboards, SOC X blends **high-translucency frosted glassmorphism**, **deep obsidian backgrounds**, **champagne gold telemetry accents**, **metallic silver structural borders**, and **high-fidelity 3D interactive canvases**.

### Core Tenets:
1. **Uncluttered & Spacious**: Generous padding (`p-6` to `p-8`), comfortable card margins (`gap-6`, `space-y-6`), and clear hierarchical separation.
2. **Living, Breathing Atmosphere**: An interactive particle constellation background and custom magnetic cursor that respond fluidly to user movement.
3. **True Crystal Glassmorphism**: Translucent multi-stop glass gradients, specular top edge highlights, and high-intensity backdrop blur that lets background light orbs filter through.
4. **Precision Typography**: Syne & Space Grotesk for executive headlines; Inter for high-readability UI metrics; JetBrains Mono for cryptographic/SIEM telemetry.

---

## 2. Global Color Palette & Design Tokens

### CSS Custom Variables (`:root`):

```css
:root {
  /* Background Hierarchy */
  --bg-main: #040407;                     /* Deep Obsidian Base */
  --bg-surface: #0a0a10;                  /* Charcoal Surface */
  --bg-card: rgba(12, 12, 20, 0.45);      /* Translucent Glass Base */
  --bg-card-hover: rgba(20, 20, 32, 0.58);

  /* Primary Typography */
  --text-primary: #ffffff;                /* Pure Crisp White */
  --text-secondary: #c4c4d6;              /* Slate Silver */
  --text-muted: #7e7e96;                  /* Muted Grey */

  /* Luxury Gold Accents */
  --accent-gold: #d4af37;                 /* Metallic Gold */
  --accent-gold-light: #f5d77f;           /* Champagne Gold */
  --accent-gold-dark: #9a7b20;            /* Deep Bronze Gold */
  --accent-gold-glow: rgba(212, 175, 55, 0.3);

  /* Metallic Silver Accents */
  --accent-silver: #e2e8f0;               /* Bright Metallic Silver */
  --accent-silver-dark: #94a3b8;          /* Slate Metallic */

  /* Borders & Highlights */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-card: rgba(255, 255, 255, 0.18);
  --border-gold: rgba(212, 175, 55, 0.4);

  /* Cybersecurity Threat Status Colors */
  --status-critical: #ff3366;             /* Neon Crimson */
  --status-high: #f59e0b;                 /* Amber Gold */
  --status-nominal: #10b981;              /* Emerald Defense */
}
```

---

## 3. Typography Hierarchy

### Required Google Fonts Imports (`index.html`):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
```

### Font Stacks & Usage:
- **Display Headlines & Branding (`.font-display`)**: `'Syne', 'Space Grotesk', sans-serif` — Used for main brand names, modal headers, and section titles.
- **SIEM Telemetry & Code (`.font-mono`)**: `'JetBrains Mono', monospace` — Used for IP addresses, timestamps, packet sizes, entropy values, and raw logs.
- **UI Metrics & Labels (`font-sans`)**: `'Inter', sans-serif` — Used for body copy, metric values, and navigation tabs.

---

## 4. Frosted Glassmorphism Master Formulas

### The Master Glass Card (`.soc-card`):
```css
.soc-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(20, 20, 32, 0.45) 40%,
    rgba(10, 10, 18, 0.60) 100%
  );
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.35),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.soc-card:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(26, 26, 42, 0.55) 40%,
    rgba(14, 14, 24, 0.70) 100%
  );
  border-color: rgba(212, 175, 55, 0.55);
  box-shadow: 
    0 20px 52px 0 rgba(0, 0, 0, 0.75),
    0 0 32px var(--accent-gold-glow),
    inset 0 1px 2px rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
}
```

---

## 5. Luxury Interactive Buttons & Badges

### Button Classes:
```css
/* Gold Executive Action Button */
.soc-btn-gold {
  background: linear-gradient(135deg, #d4af37 0%, #f5d77f 50%, #b89320 100%);
  color: #000000;
  font-weight: 700;
  border: 1px solid #f5d77f;
  border-radius: 8px;
  height: 40px;
  padding: 0 20px;
  box-shadow: 0 4px 18px rgba(212, 175, 55, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}

.soc-btn-gold:hover {
  background: linear-gradient(135deg, #f5d77f 0%, #ffffff 50%, #d4af37 100%);
  box-shadow: 0 6px 26px rgba(212, 175, 55, 0.55), inset 0 1px 0 #ffffff;
  transform: translateY(-1px);
}

/* Metallic Silver Glass Button */
.soc-btn-silver {
  background: rgba(22, 22, 34, 0.65);
  color: #e2e8f0;
  border: 1px solid rgba(226, 232, 240, 0.22);
  backdrop-filter: blur(12px);
  border-radius: 8px;
  height: 40px;
  padding: 0 18px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}

.soc-btn-silver:hover {
  background: rgba(36, 36, 52, 0.85);
  border-color: rgba(212, 175, 55, 0.55);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.25);
  transform: translateY(-1px);
}

/* Critical Threat Red Button */
.soc-btn-danger {
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.25), rgba(30, 5, 12, 0.75) 100%);
  color: #ff99bb;
  border: 1px solid rgba(255, 51, 102, 0.55);
  box-shadow: 0 4px 16px rgba(255, 51, 102, 0.2);
  border-radius: 8px;
  height: 40px;
  padding: 0 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}
```

### Threat Badges:
```css
.badge-gold {
  background: rgba(212, 175, 55, 0.14);
  color: #f5d77f;
  border: 1px solid rgba(212, 175, 55, 0.35);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.badge-critical {
  background: rgba(255, 51, 102, 0.15);
  color: #ff88a8;
  border: 1px solid rgba(255, 51, 102, 0.45);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}
```

---

## 6. Interactive Background Constellation Component

### React/TypeScript Specification (`InteractiveBackground.tsx`):
- Uses full-viewport HTML5 Canvas (`fixed inset-0 pointer-events-none z-0`).
- Generates floating cyber particles with randomized velocities and coordinates.
- **Ambient Light Orbs**: Renders 2 floating radial color orbs (warm gold at top-left, subtle deep silver at bottom-right) and a third dynamic mouse-following gold aura.
- **Proximity Links**: Draws delicate golden line segments (`rgba(212, 175, 55, alpha)`) between particles within a 125px radius.
- **Mouse Repulsion/Attraction**: When mouse is within 200px of any particle, the particle glows brighter and gently shifts away from the cursor.

---

## 7. Custom Dual-Layer Cyber Cursor Component

### React/TypeScript Specification (`CustomCursor.tsx`):
- Replaces native browser cursor on non-touch screens (`@media (hover: hover) and (pointer: fine)`).
- **Layer 1 (Dot)**: Precision 6px gold dot (`#d4af37`) tracking `clientX` and `clientY` with zero lag.
- **Layer 2 (Trailing Ring)**: 34px frosted silver/gold ring with smooth lerp physics ($pos = pos + (target - pos) \times 0.18$).
- **Interactive State**: Automatically detects hover over `button`, `a`, `input`, `select`, `tr`, `tab` and scales the ring to 52px with gold glow while shrinking the center dot.

---

## 8. Three.js 3D Visualizer Architecture

### 1. 3D Global Threat Globe (`ThreeGlobe.tsx`):
- **Camera Setup**: `PerspectiveCamera(45, width/height, 0.1, 1000)` at `(0, 0, 25)` looking at origin `(0, 0, 0)`.
- **Globe Sphere**: Radius `5.8` wireframe sphere (`color: 0x2e2e42`, `opacity: 0.45`).
- **Continent Particle Points**: 750 points distributed on sphere surface with randomized Gold (`#d4af37`) and Silver (`#ffffff`) vertex colors.
- **Orbital Gold Rings**: `RingGeometry(RADIUS * 1.25, RADIUS * 1.28)` rotated at angle $\pi / 2.3$.
- **Ballistic Attack Arcs**: Uses `QuadraticBezierCurve3` calculated between source Geo coordinates (`latLngToVector3`) and destination SOC HQ (`37.77° N, -122.41° W`).

### 2. 3D Defense Grid Topology (`ThreeTopology.tsx`):
- **Camera Setup**: `PerspectiveCamera(45, width/height, 0.1, 1000)` at `(0, 6.8, 16.0)` looking at `(0, 0.2, 0)`.
- **Base Grid**: Gold & dark charcoal `GridHelper(13, 18, 0xd4af37, 0x222233)` at $y = -1.6$.
- **Asset Meshes**: Octahedrons (`size: 0.52`) representing Perimeter Firewall (Gold), DMZ, Juice Shop, DB, and SIEM Core with animated pulsing halo rings (`UNDER_ATTACK` nodes pulse in crimson).

---

## 9. Full Layout Grid Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  HEADER: SOC X Branding & Live Status  |  Threat Score  | Quick Actions │
├────────────────────────────────────────────────────────────────────────┤
│  5 CORE METRIC CARDS: Total Events | Failed | Success | Suspicious | Risk│
├────────────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION: [3D Command Center] [Event Stream] [HTTP/DNS] [Grid]  │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │                                    │
│   3D GLOBAL THREAT GLOBE          │   3D NETWORK ASSET TOPOLOGY        │
│   (Ballistic Attack Vectors)      │   (Defense Grid & Host Status)     │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│  SECURITY ANALYSIS: Correlated MITRE ATT&CK Incidents & Rule Matrix   │
├───────────────────────────────────┬────────────────────────────────────┤
│  TOP THREAT ORIGIN IPS (Rankings) │  TOP TARGETED ACCOUNTS (Fail/OK)   │
├───────────────────────────────────┴────────────────────────────────────┤
│  EVENT TIMELINE: Real-time Ingestion Stream & Forensic Modal Inspector │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Summary Checklist for Frontend Engineers

When building or replicating the SOC X frontend:
1. Load Google Fonts: `Syne`, `Space Grotesk`, `Inter`, and `JetBrains Mono`.
2. Do not use plain solid grey backgrounds. Always use the multi-layer glassmorphism formula with `backdrop-filter: blur(24px)`.
3. Keep container camera distances backed up (`z=25` for globe, `z=16` for topology) so 3D models are centered and unzoomed.
4. Mount `<InteractiveBackground />` and `<CustomCursor />` at the root of `App.tsx`.
5. Apply luxury gold gradients (`#d4af37` to `#f5d77f`) exclusively for executive highlights, badges, and primary action buttons.
