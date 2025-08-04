# Anki Template Editor - Component Documentation

## Overview

This is a modern, Stripe-like React application for creating and previewing Anki templates. The design emphasizes clean aesthetics, excellent usability, and accessibility.

## Design System

### Colors

- **Primary**: `#635bff` (Stripe blue)
- **Background**: `#f6f9fc` (Light neutral)
- **Surface**: `#ffffff` (White cards with subtle shadows)
- **Borders**: `#e3e8ee` (Subtle borders)

### Typography

- **Font**: Inter (with system fallbacks)
- **Scale**: 12px - 32px with clear hierarchy
- **Weight**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Scale**: Multiples of 8px (8, 16, 24, 32, 40, 48, 64)
- **Generous whitespace** between sections

## Component Architecture

### Layout Components

#### `Layout`

Main container with centered, single-column layout (max-width 800px).

```tsx
<Layout title="App Title" subtitle="Optional subtitle">
  <Component1 />
  <Component2 />
</Layout>
```

#### `Card`

Container with subtle shadow, padding, and rounded corners.

```tsx
<Card title="Card Title" subtitle="Optional subtitle">
  Content goes here
</Card>
```

### Form Components

#### `FormGroup`, `Label`, `Input`, `Textarea`, `Select`

Form components with consistent styling and focus states.

```tsx
<FormGroup>
  <Label htmlFor="field">Field Label</Label>
  <Input id="field" type="text" />
  <HelpText>Optional help text</HelpText>
</FormGroup>
```

### UI Components

#### `Button`

Primary and secondary buttons with hover/focus states.

```tsx
<Button variant="primary" size="medium">Primary Action</Button>
<Button variant="secondary" size="small">Secondary Action</Button>
```

### Feature Components

#### `TemplateEditor`

Monaco-based code editor with tabs for front/back/styling templates.

- Auto-saves changes with debouncing
- Template type selection
- Live preview integration

#### `CardPreview`

Live preview of Anki cards with front/back toggle.

- Renders templates with sample data
- Iframe-based rendering for isolation
- Shows sample field mappings

## Development

### Running the App

```bash
npm start
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## Accessibility Features

- **WCAG AA** contrast compliance
- **Semantic HTML** with proper headings and landmarks
- **Keyboard navigation** for all interactive elements
- **ARIA attributes** for screen readers
- **Focus management** with visible focus indicators

## CSS Modules

All components use CSS Modules for scoped styling:

- `ComponentName.module.css` for styles
- BEM-like naming within modules
- CSS custom properties for design tokens

## Testing

Uses Jest + React Testing Library:

- Component rendering tests
- User interaction tests
- Accessibility tests
- Mock implementations for external dependencies

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with CSS custom properties and ES6+ support.
