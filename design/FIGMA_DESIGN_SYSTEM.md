# CatatDuit AI - Figma Design System

## Frame Size
- Mobile: 360 x 800 (Android)

## Color Styles

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | #16A085 | Main actions, income indicators |
| Secondary Green | #1ABC9C | Secondary actions, highlights |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Blue Accent | #3498DB | Links, info states |
| Orange Accent | #F39C12 | Warnings, pending states |
| Red Danger | #E74C3C | Errors, expense indicators |

### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background | #F7F9FB | App background |
| Card | #FFFFFF | Card surfaces |
| Text Primary | #2C3E50 | Main text |
| Text Secondary | #7F8C8D | Secondary text, captions |

### Category Colors
| Category | Hex |
|----------|-----|
| Makanan | #E74C3C |
| Transportasi | #3498DB |
| Tagihan | #F39C12 |
| Keperluan Rumah Tangga | #9B59B6 |
| Belanja | #1ABC9C |
| Hiburan | #E91E63 |
| Kesehatan | #00BCD4 |
| Pemasukan | #16A085 |

## Typography (Inter Font)

| Style | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 24px | 600 (SemiBold) | 32px |
| H2 | 20px | 600 (SemiBold) | 28px |
| Body Large | 16px | 400 (Regular) | 24px |
| Body | 14px | 400 (Regular) | 20px |
| Caption | 12px | 300 (Light) | 16px |
| Small | 10px | 400 (Regular) | 14px |

## Spacing System (8px Grid)

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

## Border Radius

| Element | Radius |
|---------|--------|
| Card | 16px |
| Button | 12px |
| Input | 8px |
| Chip | 8px |
| Avatar | 50% |

## Shadow

```
Box Shadow: 0px 4px 12px rgba(0, 0, 0, 0.08)
```

## Components

### 1. AppBar
- Height: 56px
- Background: #FFFFFF
- Title: H2 style, centered
- Icons: 24px, #2C3E50

### 2. Wallet Card
- Size: 180 x 100px
- Border Radius: 16px
- Gradient: Primary color to 80% opacity
- Shadow: Category color at 30% opacity
- Content:
  - Icon container: 36px, white 20% opacity bg
  - Wallet name: Caption, white 70%
  - Balance: Body Large, white, SemiBold

### 3. Summary Card
- Padding: 20px
- Border Radius: 16px
- Background: #FFFFFF
- Shadow: Default
- Sections:
  - Title: Body, SemiBold
  - Income/Expense boxes: 12px padding, 12px radius
  - Ratio chips: 8px padding, 8px radius

### 4. Analytics Card (Donut Chart)
- Padding: 20px
- Chart size: 160px diameter
- Center space: 80px
- Legend: Right side, vertical list

### 5. Line Chart Card
- Padding: 20px
- Chart height: 200px
- Grid lines: #7F8C8D at 10% opacity
- Income line: #16A085, 3px stroke
- Expense line: #E74C3C, 3px stroke

### 6. Transaction Item
- Height: 72px
- Padding: 16px
- Icon container: 48px, category color at 10% bg
- Content: Left aligned
- Amount: Right aligned, colored by type

### 7. Category Row
- Height: 48px
- Color indicator: 12px square, 3px radius
- Progress bar: 4px height, full width

### 8. Button Styles
- Primary: #16A085 bg, white text
- Secondary: Transparent bg, #16A085 text
- Danger: #E74C3C bg, white text
- Height: 48px
- Padding: 24px horizontal

### 9. Input Field
- Height: 48px
- Border: 1px #7F8C8D at 30%
- Focus border: #16A085
- Border radius: 8px
- Padding: 16px

### 10. Pro Badge
- Background: Linear gradient #FFD700 to #FFA500
- Text: 10px, Bold, White
- Padding: 4px 8px
- Border radius: 6px

## Screen Layouts

### Home Screen
```
┌─────────────────────────────┐
│ AppBar (Logo + Icons)       │
├─────────────────────────────┤
│ Wallet Cards (Horizontal)   │
├─────────────────────────────┤
│ Summary Card                │
├─────────────────────────────┤
│ Category Donut Chart        │
├─────────────────────────────┤
│ Weekly Trend Line Chart     │
├─────────────────────────────┤
│ Recent Transactions         │
│ - Transaction Item          │
│ - Transaction Item          │
│ - Transaction Item          │
└─────────────────────────────┘
     [+ FAB Button]
```

### Analytics Screen
```
┌─────────────────────────────┐
│ AppBar (Analytics)          │
├─────────────────────────────┤
│ Period Selector (Tabs)      │
├─────────────────────────────┤
│ Summary Stats               │
├─────────────────────────────┤
│ Category Breakdown          │
├─────────────────────────────┤
│ Trend Chart                 │
├─────────────────────────────┤
│ Top Categories List         │
└─────────────────────────────┘
```

### Wallet Detail Screen
```
┌─────────────────────────────┐
│ AppBar (Wallet Name)        │
├─────────────────────────────┤
│ Balance Card (Large)        │
├─────────────────────────────┤
│ Quick Actions               │
├─────────────────────────────┤
│ Transaction History         │
│ - Grouped by Date           │
└─────────────────────────────┘
```

## Auto Layout Rules

1. All containers use Auto Layout
2. Spacing between items: 8px, 16px, or 24px
3. Padding: 16px or 20px
4. Fill container for responsive width
5. Hug contents for dynamic height

## Component Variants

### Button
- State: Default, Hover, Pressed, Disabled
- Type: Primary, Secondary, Danger, Ghost

### Input
- State: Default, Focus, Error, Disabled
- Type: Text, Number, Password

### Transaction Item
- Type: Expense, Income, Transfer

### Wallet Card
- Size: Small (160px), Medium (180px), Large (Full width)
