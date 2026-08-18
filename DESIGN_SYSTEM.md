# Shopora Design System

## Brand Identity
- **Brand Name**: Shopora
- **Tagline**: Premium Beauty & Lifestyle
- **Icon**: Sparkles (`<Sparkles />` from lucide-react)
- **Gold Accent**: `#D4AF37`

---

## Color Palette

### Primary Colors
- **Black**: `#000000` / `hsl(0 0% 0%)` — Primary actions, active states, text
- **White**: `#FFFFFF` / `hsl(0 0% 100%)` — Backgrounds, cards
- **Gold Accent**: `#D4AF37` — Brand accents, sparkle icons, highlights

### Neutral Colors
- **Neutral 50**: `#FAFAFA` — Light backgrounds
- **Neutral 100**: `#F5F5F5` — Hover backgrounds
- **Neutral 200**: `#E5E5E5` — Borders (`border-neutral-200`)
- **Neutral 300**: `#D4D4D4` — Disabled states
- **Neutral 400**: `#A3A3A3` — Placeholder text, icons
- **Neutral 500**: `#737373` — Secondary text
- **Neutral 600**: `#525252` — Body text
- **Neutral 700**: `#404040` — Headings
- **Neutral 800**: `#262626` — Subheadings
- **Neutral 900**: `#171717` — Primary headings

### Semantic Colors
- **Success**: `bg-green-100 text-green-800`
- **Warning**: `bg-yellow-100 text-yellow-800`
- **Error**: `bg-red-100 text-red-800`
- **Info**: `bg-blue-100 text-blue-800`

---

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Rendering**: `antialiased`, `subpixel-antialiased`

### Font Sizes
- **Hero Title**: `text-6xl` / `sm:text-8xl` — Main brand title
- **Page Title**: `text-3xl` / `sm:text-4xl` — Section headings
- **Card Title**: `text-2xl` — Card headers
- **Body Large**: `text-lg` — Lead paragraphs
- **Body**: `text-base` — Default body text
- **Small**: `text-sm` — Secondary text
- **Label**: `text-xs` — Uppercase labels, badges

### Font Styles
- **Headings**: `font-semibold`, `tracking-tight`
- **Labels**: `font-medium`, `tracking-[0.2em]`, `uppercase`
- **Body**: `font-normal`, `leading-relaxed`

---

## Spacing System

### Padding
- **Page Content**: `p-8` — Main content areas
- **Card Content**: `p-6` — Card internal padding
- **Card Header**: `p-6` — Card header padding
- **Form Inputs**: `px-4 py-3` — Input fields
- **Buttons**: `px-8 py-3` — Button padding

### Gaps
- **Section Spacing**: `space-y-8` — Between major sections
- **Card Grid**: `gap-6` — Between cards
- **Form Fields**: `space-y-5` — Between form inputs
- **Inline Elements**: `gap-2`, `gap-3`, `gap-4` — Small spacing

---

## Components

### Cards
```tsx
className="border border-neutral-200 shadow-sm bg-white hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
```
- Border: `border-neutral-200`
- Shadow: `shadow-sm` → `hover:shadow-lg`
- Background: `bg-white`
- Radius: `rounded-xl`
- Hover: `hover:border-neutral-300`

### Buttons

#### Primary Button
```tsx
className="rounded-full bg-black text-white hover:bg-neutral-800 h-12 px-8 text-base font-medium transition-all duration-200"
```
- Shape: `rounded-full` (pill-shaped)
- Background: `bg-black`
- Hover: `hover:bg-neutral-800`
- Height: `h-12`
- Text: `text-base font-medium`

#### Secondary Button
```tsx
className="rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 h-12 px-8 text-base font-medium"
```
- Shape: `rounded-full`
- Border: `border border-neutral-200`
- Hover: `hover:bg-neutral-50`

#### Ghost Button
```tsx
className="rounded-full hover:bg-neutral-100 transition-colors"
```

### Inputs
```tsx
className="rounded-xl border border-neutral-200 h-12 px-4 text-base focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
```
- Border: `border-neutral-200`
- Radius: `rounded-xl`
- Height: `h-12`
- Focus: `focus:ring-2 focus:ring-black`

### Badges
```tsx
className="px-2 py-0.5 rounded-full text-xs font-medium"
```
- Shape: `rounded-full`
- Size: `text-xs`
- Variants: green, yellow, red, blue, purple, orange

---

## Layout Patterns

### Page Structure
```tsx
<div className="space-y-8">
  {/* Section Header */}
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Sparkles className="h-5 w-5 text-[#D4AF37]" />
      <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Label</span>
    </div>
    <h1 className="text-3xl font-semibold tracking-tight">Page Title</h1>
    <p className="text-neutral-600 mt-2">Description text</p>
  </div>
  
  {/* Content */}
</div>
```

### Section Header Pattern
- **Icon**: `<Sparkles className="h-5 w-5 text-[#D4AF37]" />`
- **Label**: `text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase`
- **Title**: `text-3xl font-semibold tracking-tight`
- **Description**: `text-neutral-600 mt-2`

### Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => (
    <Card key={item.id} className="border border-neutral-200 shadow-sm">
      {/* Card content */}
    </Card>
  ))}
</div>
```

---

## Sidebar Navigation

### Structure
```tsx
<aside className="fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white transition-all duration-300 w-64">
  {/* Logo */}
  <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
    <Link href="/portal" className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-[#D4AF37]" />
      <span className="text-lg font-semibold tracking-tight">Shopora</span>
    </Link>
  </div>
  
  {/* Navigation */}
  <nav className="flex-1 space-y-1 p-3">
    {navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-black text-white shadow-sm"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0 mr-3" />
        <span>{item.label}</span>
      </Link>
    ))}
  </nav>
</aside>
```

### Active State
- Background: `bg-black`
- Text: `text-white`
- Shadow: `shadow-sm`

### Inactive State
- Text: `text-neutral-700`
- Hover: `hover:bg-neutral-100`

---

## Animation & Transitions

### Standard Transitions
- **Duration**: `duration-300` (default), `duration-500` (hover effects)
- **Easing**: `ease-out` or default cubic-bezier
- **Properties**: `transition-all` for comprehensive transitions

### Hover Effects
```tsx
className="transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-neutral-300"
```

### Scale Animations
```tsx
className="group-hover:scale-110 transition-transform duration-500"
```

---

## Icons

### Library
- **Lucide React** — All icons imported from `lucide-react`

### Common Icons
- `<Sparkles />` — Brand accent, gold color
- `<User />` — Buyer/User related
- `<Store />` — Seller related
- `<Truck />` — Courier related
- `<Shield />` — Admin related
- `<Package />` — Orders/Products
- `<ShoppingCart />` — Cart
- `<ArrowRight />` — Navigation
- `<Menu />` — Collapsed sidebar
- `<ChevronLeft />` — Expand sidebar
- `<LogOut />` — Logout action
- `<Search />` — Search functionality
- `<Plus />` — Add actions
- `<Edit />` — Edit actions
- `<Trash2 />` — Delete actions
- `<Star />` — Ratings

### Icon Sizing
- **Small**: `h-4 w-4`
- **Medium**: `h-5 w-5`
- **Large**: `h-6 w-6` to `h-8 w-8`
- **Extra Large**: `h-12 w-12`

---

## Shadows

### Shadow Scale
- **None**: `shadow-none`
- **Small**: `shadow-sm` — Default cards
- **Medium**: `shadow-md` — Hover states
- **Large**: `shadow-lg` — Elevated elements
- **Extra Large**: `shadow-xl` — Modals, dropdowns
- **Colored**: `shadow-black/5` — Subtle black tint

### Shadow Usage
```tsx
// Default card
className="shadow-sm"

// Hover state
className="hover:shadow-lg hover:shadow-black/5"

// Elevated element
className="shadow-lg"
```

---

## Borders

### Border Color
- **Default**: `border-neutral-200`
- **Hover**: `hover:border-neutral-300`
- **Light**: `border-neutral-100`
- **Dark**: `border-neutral-300`

### Border Radius
- **Small**: `rounded-lg` — `0.5rem`
- **Medium**: `rounded-xl` — `0.75rem`
- **Large**: `rounded-2xl` — `1rem`
- **Full**: `rounded-full` — Pills, badges
- **None**: `rounded-none` — Tabs

---

## Responsive Breakpoints

### Grid Systems
- **Mobile**: `grid-cols-1`
- **Tablet**: `md:grid-cols-2`
- **Desktop**: `lg:grid-cols-3` or `lg:grid-cols-4`

### Common Patterns
```tsx
// 4-column grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// 2-column grid
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// 3-column grid
className="grid grid-cols-1 md:grid-cols-3 gap-6"
```

---

## Status Colors

### Order Status
- **PENDING**: `bg-yellow-100 text-yellow-800`
- **CONFIRMED**: `bg-blue-100 text-blue-800`
- **PROCESSING**: `bg-purple-100 text-purple-800`
- **TO_SHIP**: `bg-orange-100 text-orange-800`
- **IN_TRANSIT**: `bg-indigo-100 text-indigo-800`
- **OUT_FOR_DELIVERY**: `bg-pink-100 text-pink-800`
- **DELIVERED**: `bg-green-100 text-green-800`
- **CANCELLED**: `bg-red-100 text-red-800`

### User Roles
- **ADMIN**: `bg-purple-100 text-purple-800`
- **SELLER**: `bg-green-100 text-green-800`
- **BUYER**: `bg-blue-100 text-blue-800`
- **COURIER**: `bg-orange-100 text-orange-800`

---

## Form Patterns

### Input Groups
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium">Label Text</Label>
  <Input
    className="rounded-xl border-neutral-200 h-12"
    placeholder="Placeholder text"
  />
</div>
```

### Select Inputs
```tsx
<Select>
  <SelectTrigger className="rounded-xl border-neutral-200 h-12">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

---

## Accessibility

### Focus States
- All interactive elements have `focus:ring-2 focus:ring-black focus:ring-offset-2`
- Inputs have visible focus rings
- Buttons have hover and active states

### Color Contrast
- All text meets WCAG AA standards
- Neutral-600 on white backgrounds for body text
- Neutral-900 for headings

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Global styles, CSS variables
│   ├── layout.tsx           # Root layout with Inter font
│   ├── page.tsx             # Homepage with Shopora branding
│   ├── buyer/               # Buyer portal
│   ├── seller/              # Seller portal
│   ├── courier/             # Courier portal
│   ├── admin/               # Admin portal
│   ├── auth/                # Login/Register pages
│   └── register/            # Unified registration
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx       # Button variants
│   │   ├── card.tsx         # Card variants
│   │   ├── input.tsx        # Input component
│   │   └── ...
│   └── layout/              # Layout components
└── lib/
    ├── auth.ts              # NextAuth configuration
    └── prisma.ts            # Prisma client
```

---

## Important Notes

### Always Use
- `rounded-full` for buttons
- `rounded-xl` for cards and inputs
- `border-neutral-200` for borders
- `text-neutral-600` for body text
- `text-neutral-500` for secondary text
- `bg-black` for primary actions
- `text-[#D4AF37]` for gold accents
- `<Sparkles />` icon for brand accents

### Never Use
- Generic blue/green/purple color schemes
- Square buttons (`rounded-none`)
- Thick borders (`border-2` or higher)
- Multiple font families
- `text-slate-*` classes (use `text-neutral-*` instead)

### Image Placeholders
```tsx
<div className="aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center">
  <ShoppingCart className="h-12 w-12 text-neutral-400" />
</div>
```

---

## CSS Variables

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;
  --accent: 42 69% 58%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 88%;
  --input: 0 0% 88%;
  --ring: 0 0% 0%;
  --radius: 0rem;
}
```

---

## Quick Reference

| Element | Class |
|---------|-------|
| Primary Button | `rounded-full bg-black text-white hover:bg-neutral-800 h-12 px-8` |
| Secondary Button | `rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 h-12 px-8` |
| Card | `border border-neutral-200 shadow-sm bg-white rounded-xl` |
| Input | `rounded-xl border border-neutral-200 h-12 px-4` |
| Section Label | `text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase` |
| Page Title | `text-3xl font-semibold tracking-tight` |
| Gold Icon | `<Sparkles className="h-5 w-5 text-[#D4AF37]" />` |
| Badge | `px-2 py-0.5 rounded-full text-xs font-medium` |

---

*Last updated: 2026-08-18*
