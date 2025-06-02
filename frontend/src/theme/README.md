# Dota 2 Companion - Chakra UI Theme

## Overview
This custom Chakra UI theme is designed specifically for the Dota 2 Companion app, featuring colors and styling that match Dota 2's visual design language.

## Theme Features

### 🎨 Color Palette
- **Primary Colors**: Teal (#27ae9e), Dark Blue (#244f62), Purple (#48308c)
- **Background Colors**: Dark theme with #121212 base
- **Text Colors**: Light blue (#cce5f8) primary, Secondary (#b4bcd4)
- **Status Colors**: Success, Warning, Error, Info variants

### 📱 Responsive Breakpoints
```javascript
{
  base: '0em',    // 0px - Mobile first
  sm: '30em',     // 480px - Small devices
  md: '48em',     // 768px - Tablets
  lg: '62em',     // 992px - Laptops
  xl: '80em',     // 1280px - Desktops
  '2xl': '96em'   // 1536px - Large screens
}
```

### 🔧 Component Variants

#### Buttons
- `solid` - Primary teal button with hover effects
- `primary` - Purple variant for important actions
- `secondary` - Dark blue variant
- `outline` - Teal border with transparent background
- `ghost` - Transparent with subtle hover

#### Cards
- `default` - Standard card styling
- `elevated` - Enhanced shadow for prominence
- `hero` - Special gradient background for hero-related content

#### Inputs
- `outline` - Default with teal focus ring
- `filled` - Filled background variant

#### Badges
- `solid` - Teal background
- `outline` - Teal border
- `hero` - Purple for hero-related content
- `match` - Dark blue for match-related content

## Usage Examples

### Basic Components
```jsx
import { Button, Card, Input, Badge } from '@chakra-ui/react';

// Buttons
<Button variant="solid">Primary Action</Button>
<Button variant="primary">Important Action</Button>
<Button variant="outline">Secondary Action</Button>

// Cards
<Card variant="elevated">
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>

// Inputs
<Input placeholder="Search heroes..." />

// Badges
<Badge variant="hero">Carry</Badge>
<Badge variant="match">Victory</Badge>
```

### Responsive Design
```jsx
import { useBreakpointValue, Grid } from '@chakra-ui/react';

// Responsive values
const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
const buttonSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' });

// Responsive grid
<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
  {/* Grid items */}
</Grid>
```

### Color Usage
```jsx
import { Box, Text } from '@chakra-ui/react';

<Box bg="dota.bg.card" borderColor="dota.teal.500">
  <Text color="dota.text.primary">Primary text</Text>
  <Text color="dota.text.secondary">Secondary text</Text>
</Box>
```

### Custom Animations
```jsx
<Box
  _hover={{
    transform: "translateY(-2px)",
    boxShadow: "dota-glow"
  }}
  transition="all 0.2s ease-in-out"
>
  Hover for effect
</Box>
```

## Integration with Tailwind CSS

The theme is configured to work alongside Tailwind CSS:
- Tailwind's preflight is disabled to avoid conflicts
- Custom Dota 2 colors are available in both systems
- Chakra takes precedence for component styling
- Tailwind can be used for utility classes where needed

## Dark Mode Configuration

The theme is configured with dark mode as default:
```javascript
config: {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}
```

## Custom Shadows
- `dota-glow` - Teal glow effect
- `hero-glow` - Purple glow for hero content
- `card-hover` - Elevated card hover effect
- `elevated` - Standard elevation shadow

## Animation Tokens
Pre-configured easing and duration tokens for consistent animations across the app.

## Testing the Theme
Use the `ChakraDemo` component to test all theme features and responsive behavior.