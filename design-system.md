# UI/UX & Brand Design System: Ad Waste Finder

> **Source Project:** Stitch Workspace — `"Ad Waste Finder UI & Brand System"` (`projects/15930574063233645432`)  
> **File Name:** `design-system.md`  
> **Status:** Fully Integrated with Stitch Design System + Fluid Motion Architecture  
> **Visual Direction:** Editorial Precision & Financial Elegance (Newsreader Serif Headlines + High-Legibility Inter Body/Data + Silky Smooth Framer Motion Dynamics)

---

## 1. Brand Identity & Aesthetic Principles

The design language of Ad Waste Finder balances **editorial authority** with **action-oriented financial clarity**:
- **Editorial Authority:** Uses **Newsreader** for prominent titles and section headers, giving the application the gravitas and measured tone of an investigative financial report.
- **Data Precision:** Uses **Inter** for dense tabular metrics, campaign status pills, and numeric displays, ensuring instant legibility.
- **Restraint Over Noise:** Low-saturation backgrounds with intentional semantic highlights. Actions are calm, deliberative, and evidence-grounded.
- **Organic, Flowing Motion:** UI elements must never feel like disjointed "floating boxes" or pop abruptly into place. Everything moves with cohesive, spring-driven physical fluidity.

---

## 2. Color System & Design Tokens (Strict Reference)

Directly extracted from your Stitch design theme tokens:

### 2.1 Surfaces & Canvas (Light Theme Baseline)
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `background` / `surface` | `#F8F9FF` | Application base canvas (cool soft paper white) |
| `surface_container_lowest` | `#FFFFFF` | Primary card background, active modals, data table containers |
| `surface_container_low` | `#EFF4FF` | Filter bars, subtle hover states, segmented controls |
| `surface_container` | `#E5EEFF` | Sub-headers, simulator control panel background |
| `surface_container_high` | `#DCE9FF` | Secondary card headers, active tab highlights |
| `surface_container_highest`| `#D3E4FE` | Table column headers, active borders, card outlines |
| `on_surface` / `on_background` | `#0B1C30` | Deep slate primary text color |
| `on_surface_variant` | `#45464D` | Secondary body text and labels |
| `outline` | `#76777D` | Card and component borders |
| `outline_variant` | `#C6C6CD` | Subtle divider lines and inactive element borders |

### 2.2 Primary Brand & Semantic Accents
| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| `primary` / `overridePrimary` | `#0F172A` | Primary brand slate, high-emphasis action buttons, active navigation |
| `primary_container` | `#131B2E` | Dark contrast cards, terminal banners, emphasis callouts |
| `secondary` | `#755937` | Warm bronze/amber secondary accents |
| `secondary_container` | `#FDD6AB` | Warm highlighted callouts, pending verification tags |
| `tertiary` / `overrideTertiary`| `#334155` | Supporting technical badges and secondary button borders |
| `neutral` / `overrideNeutral` | `#64748B` | Timestamp text, inactive indicators, microcopy |
| `error` | `#BA1A1A` | Underperforming flag badges, wasted spend metrics, critical warnings |
| `error_container` | `#FFDAD6` | Underperforming card backgrounds, alert banner fills |

### 2.3 Status Badge Colors
- **`Collecting Data`**: Surface Gray (`bg-[#EFF4FF] text-[#45464D] border-[#C6C6CD]`) with gray dot (`#76777D`).
- **`Healthy`**: Sage / Emerald (`bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]`) with green dot (`#10B981`).
- **`Watch`**: Warm Ochre (`bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]`) with amber dot (`#F59E0B`).
- **`Underperforming`**: Muted Crimson (`bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]`) with red pulse dot (`#BA1A1A`).
- **`Strong`**: Ocean Slate (`bg-[#E5EEFF] text-[#0B1C30] border-[#B9C7E0]`) with navy dot (`#0F172A`).
- **`Saturated`**: Bronze (`bg-[#FDD6AB] text-[#5B4222] border-[#E5C096]`) with amber dot (`#755937`).
- **`Awareness`**: Iris Violet (`bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]`) with violet dot (`#8B5CF6`).

---

## 3. Typography Hierarchy (Stitch Tokens)

### 3.1 Headline Scale (Font: Newsreader)
- **`headline-xl`**: `fontSize: 40px`, `fontWeight: 500`, `lineHeight: 48px`, `letterSpacing: -0.02em`  
  *Usage:* Executive dashboard main titles, report cover headlines.
- **`headline-lg`**: `fontSize: 32px`, `fontWeight: 500`, `lineHeight: 40px`, `letterSpacing: -0.015em`  
  *Usage:* Primary section titles (e.g., "Active Campaigns Analysis", "Recommendation Center").
- **`headline-md`**: `fontSize: 24px`, `fontWeight: 500`, `lineHeight: 32px`, `letterSpacing: -0.01em`  
  *Usage:* Card group headers, modal dialog titles, campaign names on detail screens.
- **`headline-sm`**: `fontSize: 20px`, `fontWeight: 500`, `lineHeight: 28px`, `letterSpacing: 0em`  
  *Usage:* Sub-section titles, drawer headers.

### 3.2 Body, Labels & Numerical Scale (Font: Inter)
- **`numeric-lg`**: `fontSize: 28px`, `fontWeight: 600`, `lineHeight: 34px`, `letterSpacing: -0.02em`  
  *Usage:* Top-level KPI metrics (Spend Today, Total Waste, Blended CPA).
- **`numeric-md`**: `fontSize: 18px`, `fontWeight: 500`, `lineHeight: 24px`, `letterSpacing: -0.01em`  
  *Usage:* Table numeric cells, secondary KPI figures, confidence percentages.
- **`title-md`**: `fontSize: 16px`, `fontWeight: 600`, `lineHeight: 24px`, `letterSpacing: -0.01em`  
  *Usage:* Table column headers, card titles, button text.
- **`title-sm`**: `fontSize: 14px`, `fontWeight: 600`, `lineHeight: 20px`, `letterSpacing: -0.005em`  
  *Usage:* Small button labels, input labels, badge text.
- **`body-lg`**: `fontSize: 16px`, `fontWeight: 400`, `lineHeight: 26px`  
  *Usage:* Introductory narrative paragraphs, audit notes.
- **`body-md`**: `fontSize: 14px`, `fontWeight: 400`, `lineHeight: 22px`  
  *Usage:* Standard explanatory text, recommendation reasons.
- **`body-sm`**: `fontSize: 12px`, `fontWeight: 400`, `lineHeight: 18px`  
  *Usage:* Table footnotes, secondary labels, helper text.
- **`label-md`**: `fontSize: 13px`, `fontWeight: 500`, `lineHeight: 18px`, `letterSpacing: 0.01em`  
  *Usage:* Form input labels, metadata tags.
- **`label-sm`**: `fontSize: 11px`, `fontWeight: 600`, `lineHeight: 16px`, `letterSpacing: 0.04em` (Uppercase)  
  *Usage:* Mini pill badges, table category tags, status tags.

---

## 4. Spacing, Elevation & Corner Radius

### 4.1 Spacing Scale (Scale Factor: 2)
- **`space-xs`**: `0.25rem` (4px) — Icon/text gaps, pill internal padding
- **`space-sm`**: `0.5rem` (8px) — Stack gaps, compact button padding
- **`space-md`**: `1.0rem` (16px) — Card internal padding, standard form field spacing
- **`space-lg`**: `1.5rem` (24px) — Section gaps, grid gutters
- **`space-xl`**: `2.5rem` (40px) — Page layout vertical margins, hero gaps
- **`gutter`**: `1.5rem` (24px) desktop / `0.75rem` (12px) mobile
- **`margin`**: `2.0rem` (32px) desktop / `1.0rem` (16px) mobile

### 4.2 Corner Radius
- **Theme Setting:** `ROUND_FOUR` (`rounded` = 4px border radius)
- Cards, buttons, inputs, and modals strictly adhere to subtle 4px rounded corners (`rounded-[4px]`) to maintain a crisp, structured data layout.

---

## 5. Motion & Animation Architecture (Framer Motion)

To ensure the interface feels cohesive, elegant, and avoids choppy transitions or detached "floating boxes":

### 5.1 Physics & Easing Specifications
- **Spring Physics (Interactions & Modals):**
  - `stiffness: 280`, `damping: 28`, `mass: 0.8` (Snappy, natural settling with zero perceptible oscillation).
- **Cubic Bezier (Page & Layout Transitions):**
  - Transition curve: `[0.22, 1, 0.36, 1]` (Out-Quint: rapid acceleration with long, gentle deceleration).
  - Duration: `350ms` for page views, `200ms` for micro-interactions.

### 5.2 Page & View Transitions
- Wrapped in Framer Motion's `<AnimatePresence mode="wait">`.
- Initial entry: `opacity: 0, y: 6` $\to$ Active: `opacity: 1, y: 0` $\to$ Exit: `opacity: 0, y: -4`.
- Prevents jarring layout pops when switching between Dashboard, Campaign Deep Dive, Recommendations, and Settings.

### 5.3 Shared Layout Morphing (`layoutId`)
- Status changes (e.g., campaign moving from `Collecting Data` to `Watch` or `Underperforming`) use Framer Motion `layout` prop. Cards smoothly slide and adjust their vertical stack rather than popping in and out.
- Tab selection and segmented filters use an active indicator pill backed by `layoutId="activeTab"` that slides seamlessly beneath active labels.

### 5.4 Live Metric Number Rolling
- When the simulator clock advances, KPI numbers (Spend, Conversions, Waste) do not snap abruptly.
- Numbers use smooth numerical interpolation (`Intl.NumberFormat` with Framer Motion spring values), gently spinning up to the new value like a high-precision digital meter.

### 5.5 Staggered Content Ingestion
- Top KPI cards, table rows, and alert feed items load with a micro-stagger:
  ```js
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };
  ```

### 5.6 Drawer & Modal Dynamics
- **Campaign Improvement Drawer:**
  - Enters smoothly from `x: "100%"` with a backdrop blur overlay (`backdrop-blur-sm bg-[#0B1C30]/20` with `transition: { duration: 0.25 }`).
  - Action items cascade into view sequentially with a 20ms stagger.

---

## 6. Screen Layouts & Component Patterns

### 6.1 Simulator Control Banner (Top Sticky Bar)
- **Background:** `surface_container` (`#E5EEFF`) with `outline_variant` border.
- **Controls:**
  - Play/Pause toggle with glowing pulse indicator when active.
  - Speed toggle (1x / 2x).
  - Virtual Date & Day Counter: Newsreader font (`Day 14 | Oct 28`).
  - Scenario Injectors: Compact outline buttons for `Sudden Failure`, `Inject Lag Spike`, `Reset to Seed`.

### 6.2 Live Dashboard View
- **Top Row (4 KPI Cards):**
  - Surface: `surface_container_lowest` (`#FFFFFF`).
  - Metric: `numeric-lg` font.
  - Subtitle: `label-sm` font in `on_surface_variant`.
  - Highlight Card: **Estimated Waste So Far** with `error_container` subtle background tint.
- **Main Trend Chart:**
  - Solid dark line (`#0F172A`) for daily spend.
  - Secondary line (`#755937`) for CPA against dashed target benchmark (`#BA1A1A`).
  - 3-day maturity shaded band at chart tail (`#DCE9FF` with opacity 0.4) labeled `"Data still arriving"`.
- **Campaign Data Table:**
  - Header: `surface_container_highest` (`#D3E4FE`), `title-sm` font.
  - Rows: Alternating hover state (`hover:bg-[#EFF4FF]`), `numeric-md` for figures.

### 6.3 Campaign Improvement Drawer (Slide-Out)
- **Trigger:** Outline button labeled `"Suggest Improvements"` with sparkle icon.
- **Width:** `480px` on desktop, full-width on mobile.
- **Components:**
  - Health score gauge with Newsreader headline.
  - Bottleneck banner (e.g., *"Creative Hook Fatigue"*).
  - 4 categorized sections:
    - 🎨 **Creative & Ad Copy**
    - 🎯 **Targeting & Audience**
    - 📄 **Landing Page & CVR**
    - ⚙️ **Bidding & Technical Setup**
  - Impact badge (`High Impact` in `#10B981`, `Med Impact` in `#755937`) and difficulty score.

### 6.4 Recommendation Cards (Screen 4)
- Border: `2px solid #D3E4FE`.
- Transfer Equation Header: `[Weak Campaign] ── ₹Amount/day ──> [Receiving Campaign]`.
- What-If Slider: Interactive range selector from 10% to 50% updating expected weekly conversions dynamically.
- Action Group:
  - `Approve Shift` (`#0F172A` filled button with white text).
  - `View Improvement Ideas First` (`#EFF4FF` button with `#0F172A` text).
  - `Snooze 7 Days` (Ghost button).
  - `Dismiss` (Ghost button with prompt).

---

## 7. Implementation Guidelines for Code

When generating React/Next.js components and Tailwind styles:
1. **Font Setup in Tailwind Config:**
   ```js
   fontFamily: {
     headline: ['var(--font-newsreader)', 'serif'],
     sans: ['var(--font-inter)', 'sans-serif'],
   }
   ```
2. **Apply 4px Roundness:** Use `rounded` (or `rounded-[4px]`) across cards, badges, and inputs.
3. **Strict Color Matching:** Always reference the token colors (`#F8F9FF`, `#0B1C30`, `#0F172A`, `#BA1A1A`, `#755937`) to maintain 100% fidelity to the Stitch design workspace.
4. **Motion Engine:** Standardize on `framer-motion` for all transitions, springs, number tickers, and modals.
