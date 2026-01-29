# Implementation Plan - Interactive Story Points Guide

## Goal
Make the static Story Points Guide table interactive to help users calculate the complexity score based on different criteria (Effort, Risk, etc.).

## Components

### 1. `VotingGuide.tsx` Refactor
- **Data Structure:** Move hardcoded table rows into a `const GUIDE_DATA`.
- **State:** `selectedLevels` map: `{ [category: string]: number }` (stores selected SP index for each column).
- **Interaction:**
  - `handleCellClick(category, spValue)`: Updates state for that category.
  - Clicking a cell highlights that cell and all cells above it in the same column.
- **Calculation:**
  - `suggestedSP`: Use `Math.max(...Object.values(selectedLevels))` to find the "worst case".
- **Visual Feedback:**
  - Highlight the Row in the "Story Points" column that matches `suggestedSP`.
  - Pass `suggestedSP` up to `Page.tsx` (optional) to highlight main cards (if requested later, currently sticking to table highlight).
  - Use conditional classes (`bg-primary/20`, etc.) for selected cells.

## Step-by-Step (Complete Refactor)
1. [x] Extract `GUIDE_ROWS` data structure → DONE
2. [x] Add `useState` for selections → DONE
3. [ ] **REFACTOR: Implement strict single-select logic** (no cumulative highlighting)
4. [ ] **REFACTOR: Implement 2-state visual system** (default: transparent, selected: primary)
5. [ ] **REFACTOR: Result column (SP) as READ-ONLY** with GREEN highlight for max SP
6. [ ] **REMOVE: All layout-shift sources** (`font-bold`, `scale`, `transform`, border changes)
7. [ ] **ENSURE: Fixed dimensions** (only bg/text colors change between states)
8. [ ] **TEST: Table stability** (no jitter, no scroll overflow, no column shifts)

## Critical Rules
**Layout Stability:**
- ❌ NEVER: `font-bold`, `scale`, `transform`, changing `border-width`
- ✅ ONLY: `bg-*`, `text-*`, `shadow-inner`, `ring-inset` (no dimension changes)
- ✅ Use: `font-medium` or maintain font weight

**Visual States (Input Cells):**
- Default: `bg-transparent text-foreground` (shows row color)
- Selected: `bg-primary text-primary-foreground` (optional: `shadow-inner` or `ring-inset`)
- Hover: `hover:bg-black/5`

**Result Column (Story Points):**
- First column is READ-ONLY
- Highlight max SP in GREEN (`bg-green-500 text-white` or similar)
- Clearly separates "Input" from "Output"

**Interaction:**
- Single cell select per column (toggle on/off)
- Clicking different cell in same column: deselects previous, selects new
- No cumulative highlighting

## AI Mode Implementation
1. [x] **State:** Add `isAiMode` (boolean) to `VotingGuide`. → DONE
2. [x] **UI:** Add Toggle Switch in CardHeader ("I code with AI 😎🤙"). → DONE
3. [x] **Logic:** Create mapping function/object for SP values. → DONE
   - Normal: 1, 2, 3, 5, 8, 13, 21, 34
   - AI Mode: 1, 1, 1, 2, 3, 5, 8, 13
4. [x] **Render:** Display dynamic SP values in the first column based on mode. → DONE
5. [x] **Calculation:** Ensure `suggestedSpIndex` points to the correct row, and the displayed Max SP value reflects the current mode. → DONE

