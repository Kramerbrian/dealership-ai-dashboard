# DealershipAI Design System - Canonized Specifications

## Typography

### Canonized Type Scale

**Hero**
- Size: `72px`
- Line Height: `1.2` (auto)
- Letter Spacing: `-4%` (`-0.04em`)
- Font: `SF Pro Display Bold` (700)
- Usage: Main hero headlines, landing page titles

**Subhead**
- Size: `21px`
- Line Height: `1.4`
- Font: `SF Pro Text Regular` (400)
- Usage: Section headers, card titles

**Body**
- Size: `17px`
- Line Height: `1.5`
- Font: `SF Pro Text Regular` (400)
- Usage: Main content, paragraphs, descriptions

**Caption**
- Size: `13px`
- Line Height: `1.4`
- Font: `SF Pro Text Medium` (500)
- Usage: Image captions, metadata, helper text

**Micro**
- Size: `12px`
- Line Height: `1.3`
- Font: `SF Pro Text Semibold` (600)
- Usage: Labels, badges, timestamps

### Font Stack

```css
/* Display (Hero) */
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

/* Text (Body, Subhead, Caption, Micro) */
font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Tailwind Usage

```jsx
<h1 className="text-hero font-display font-bold tracking-[-0.04em]">
  Hero Title
</h1>

<h2 className="text-subhead font-text font-normal">
  Subhead Title
</h2>

<p className="text-body font-text font-normal">
  Body text content
</p>

<span className="text-caption font-text font-medium">
  Caption text
</span>

<label className="text-micro font-text font-semibold">
  Micro label
</label>
```

---

## Spacing Scale

### Canonized 4pt Grid System

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 80px
```

### Tailwind Usage

```jsx
<div className="p-4">     {/* 16px */}
<div className="gap-2">    {/* 8px */}
<div className="mt-6">     {/* 24px */}
<div className="mb-12">    {/* 48px */}
```

### CSS Variables

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

---

## Border Radius

### Canonized Scale

- **sm**: `8px` - Buttons, chips, small elements
- **md**: `12px` - Cards, inputs, medium elements
- **lg**: `16px` - Panels, large cards
- **xl**: `20px` - Hero sections, major containers

### Tailwind Usage

```jsx
<button className="rounded-sm">  {/* 8px */}
<card className="rounded-md">   {/* 12px */}
<panel className="rounded-lg"> {/* 16px */}
<section className="rounded-xl"> {/* 20px */}
```

### CSS Variables

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

---

## Shadows (Light Mode)

### Canonized Shadows

- **sm**: `0 1px 3px rgba(0, 0, 0, 0.04)` - Subtle elevation
- **md**: `0 4px 6px rgba(0, 0, 0, 0.04)` - Medium elevation
- **lg**: `0 10px 15px rgba(0, 0, 0, 0.05)` - Large elevation

### Tailwind Usage

```jsx
<div className="shadow-sm">  {/* Subtle */}
<div className="shadow-md">  {/* Medium */}
<div className="shadow-lg">  {/* Large */}
```

### CSS Variables

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05);
```

---

## Colors

### Light Mode

- **Background**: `#FFFFFF` (Pure white)
- **Secondary**: `#F5F5F7` (Apple's exact gray)
- **Border**: `#D2D2D7` (0.5px precision)
- **Blue**: `#007AFF` (iOS system blue)

### Dark Mode

- **Background**: `#000000` (True black)
- **Secondary**: `#1C1C1E` (Apple's card color)
- **Border**: `#38383A` (Subtle division)
- **Blue**: `#0A84FF` (Vibrant dark mode)

### Tailwind Usage

```jsx
<div className="bg-apple-bg dark:bg-appleDark-bg">
<div className="bg-apple-secondary dark:bg-appleDark-secondary">
<div className="border-apple-border dark:border-appleDark-border">
<button className="text-apple-blue dark:text-appleDark-blue">
```

---

## Implementation Files

- **Design Tokens**: `app/styles/design-tokens.css`
- **Tailwind Config**: `tailwind.config.js`
- **Global Styles**: `app/globals.css`

---

## Quick Reference

### Typography Classes

```jsx
.text-hero      // 72px, -4% tracking, Bold, Display
.text-subhead   // 21px, 1.4 line-height, Regular, Text
.text-body      // 17px, 1.5 line-height, Regular, Text
.text-caption    // 13px, 1.4 line-height, Medium, Text
.text-micro      // 12px, 1.3 line-height, Semibold, Text
```

### Spacing Classes

```jsx
.p-1, .m-1      // 4px
.p-2, .m-2      // 8px
.p-3, .m-3      // 12px
.p-4, .m-4      // 16px
.p-5, .m-5      // 20px
.p-6, .m-6      // 24px
.p-8, .m-8      // 32px
.p-12, .m-12    // 48px
.p-16, .m-16    // 64px
.p-20, .m-20    // 80px
```

### Border Radius Classes

```jsx
.rounded-sm     // 8px
.rounded-md     // 12px
.rounded-lg     // 16px
.rounded-xl     // 20px
```

### Shadow Classes

```jsx
.shadow-sm      // Subtle elevation
.shadow-md      // Medium elevation
.shadow-lg      // Large elevation
```

---

## Best Practices

1. **Always use the canonized spacing scale** - Never use arbitrary values like `13px` or `27px`
2. **Match typography to content hierarchy** - Hero for main titles, Body for content
3. **Use appropriate border radius** - sm for buttons, md for cards, lg for panels
4. **Apply shadows sparingly** - Use sm for subtle depth, md for cards, lg for modals
5. **Respect the 4pt grid** - All spacing should align to the 4px grid system

---

## Migration Guide

When updating existing components:

1. Replace arbitrary font sizes with canonized typography classes
2. Update spacing to use the 4pt grid (4px, 8px, 12px, etc.)
3. Standardize border radius to sm/md/lg/xl scale
4. Replace custom shadows with canonized shadow classes
5. Update colors to use Apple canonized values

