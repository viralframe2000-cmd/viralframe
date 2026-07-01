---
name: ui-ux-pro-max
description: >
  AI-powered design intelligence for building professional UI/UX. Use when the user asks
  about UI styles, color palettes, font pairings, chart types, UX guidelines, or design
  systems for any platform (web, mobile, desktop). Provides searchable databases of
  84 UI styles, 161 color palettes, 73 font pairings, 99 UX guidelines, and 25 chart
  types across 17 tech stacks. Trigger when user says things like: "build a landing page",
  "choose a color palette", "what font should I use", "recommend a UI style", "dark mode",
  "glassmorphism", "design system", "UX best practices", "chart type", "dashboard design".
---

# UI/UX Pro Max Skill

AI-powered design intelligence with 84 UI styles, 161 color palettes, 73 font pairings, 99 UX guidelines, and 25 chart types across 17 tech stacks.

## Prerequisites

Ensure Python is available (no external dependencies required):

```powershell
python --version
```

## How to Use This Skill

The skill provides a Python search engine. Use it via:

```powershell
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "<query>" --domain <domain>
```

### Available Domains

| Domain | Description |
|--------|-------------|
| `product` | Product type recommendations (SaaS, e-commerce, portfolio) |
| `style` | UI styles (glassmorphism, minimalism, brutalism) + AI prompts and CSS keywords |
| `typography` | Font pairings with Google Fonts imports |
| `color` | Color palettes by product type |
| `landing` | Page structure and CTA strategies |
| `chart` | Chart types and library recommendations |
| `ux` | Best practices and anti-patterns |

### Available Stacks

`html-tailwind` (default), `react`, `nextjs`, `astro`, `vue`, `nuxtjs`, `nuxt-ui`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`, `angular`, `laravel`, `javafx`

## Workflow

### Step 1: Analyze User Requirements

Extract from user request:
- **Product type**: Entertainment, Tool, Productivity, or hybrid
- **Target audience** and context (commute, leisure, work)
- **Style keywords**: playful, vibrant, minimal, dark mode, immersive, etc.
- **Tech stack** being used

### Step 2: Generate Full Design System (ALWAYS START HERE)

```powershell
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"
```

This command searches domains in parallel and returns:
- Complete design system (pattern, style, colors, typography, effects)
- Anti-patterns to avoid

**Example:**
```powershell
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "video promo social media viral" --design-system -p "Best Promos"
```

### Step 3: Domain-Specific Search

```powershell
# Style recommendations
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "glassmorphism dark" --domain style

# Color palettes
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "vibrant social media" --domain color

# Typography
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "modern bold" --domain typography

# UX guidelines
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "mobile navigation" --domain ux

# Charts
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "analytics dashboard" --domain chart
```

### Step 4: Stack-Specific Best Practices

```powershell
py .agents\skills\ui-ux-pro-max-skill\src\ui-ux-pro-max\scripts\search.py "<query>" --stack <stack>
```

### Step 5: Implement

After gathering design recommendations:
1. Apply the suggested color palette (CSS variables or Tailwind config)
2. Import recommended Google Fonts
3. Apply UI style (glassmorphism, brutalism, etc.)
4. Follow UX guidelines from the output
5. Use recommended chart library if applicable

## Usage Scenarios

| Scenario | Command |
|----------|---------|
| New landing page | `--design-system` |
| New component | `--domain style --domain ux` |
| Choose style/color/font | `--design-system` |
| Review existing UI | `--domain ux` |
| Add charts | `--domain chart` |
| Stack best practices | `--stack <stack>` |

## Important Notes

- On Windows, use `python` instead of `python3`
- No external Python dependencies required
- Always run `--design-system` first for new projects
- The search engine uses BM25 ranking + regex matching
- Domain auto-detection works when `--domain` is omitted
