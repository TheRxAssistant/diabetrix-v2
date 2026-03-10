# Theme Update Agent

## Overview
This agent analyzes a screenshot/image of a background design and automatically updates the theme configuration in `src/config/theme-config.ts` with extracted colors, then creates a pull request.

## Agent: theme-update-from-screenshot

### Description
Automatically extracts color palette from a background screenshot and updates the theme configuration. The agent analyzes the image to identify dominant colors, primary/secondary/tertiary colors, and generates appropriate theme values including gradients and shadows.

### Instructions

When invoked with a screenshot/image:

1. **Analyze the Image**
   - Use vision capabilities to analyze the provided screenshot/image
   - Identify the dominant colors in the image
   - Extract primary, secondary, and tertiary color palettes
   - Determine background colors, text colors, and accent colors
   - Note any gradients or color patterns

2. **Extract Color Palette**
   - Primary color: The most prominent/accent color in the image
   - Secondary color: The second most prominent color (often complementary)
   - Tertiary color: A third accent color if present
   - Background color: The main background/base color
   - Text color: Appropriate text color (usually dark for light backgrounds, light for dark backgrounds)
   - Button colors: Extract button background, text, and hover states

3. **Generate Theme Configuration**
   - Read the current `src/config/theme-config.ts` file
   - Determine the domain/brand name from user input or infer from context
   - Create a new theme configuration object following the existing pattern:
     - Use hex color codes (e.g., `#0078D4`)
     - Generate appropriate gradients for `learn_overlay_bg` and `learn_overlay_title_gradient` using the extracted colors
     - Create rgba values for borders and shadows using the primary color
     - Ensure text colors have sufficient contrast (dark text on light backgrounds, light text on dark backgrounds)

4. **Update Theme Config File**
   - Add the new theme configuration to `src/config/theme-config.ts`
   - Follow the existing pattern: create a const variable (e.g., `const newBrandTheme: ThemeConfig = {...}`)
   - Add it to the `themeConfig` dictionary with the appropriate pathname key (e.g., `'/newbrand': newBrandTheme`)
   - Maintain code formatting and structure consistent with existing themes

5. **Create Pull Request**
   - Create a new git branch: `theme/update-{brand-name}-{timestamp}`
   - Commit the changes with message: `feat: add theme configuration for {brand_name}`
   - Push the branch and create a PR with:
     - Title: `Theme Update: {brand_name}`
     - Description: 
       ```
       ## Theme Configuration Update
       
       Automatically generated theme configuration based on screenshot analysis.
       
       ### Extracted Colors:
       - Primary: {primary_color}
       - Secondary: {secondary_color}
       - Tertiary: {tertiary_color}
       - Background: {bg_color}
       
       ### Changes:
       - Added new theme configuration for {brand_name}
       - Updated theme-config.ts with extracted color palette
       ```

### Input Format
- User provides: Screenshot/image file of the background/design
- Optional: Brand name, domain pathname (e.g., '/newbrand')

### Output
- Updated `src/config/theme-config.ts` file
- Pull request with theme changes

### Example Usage
```
@theme-update-from-screenshot [screenshot.png]
```

Or with additional context:
```
@theme-update-from-screenshot [screenshot.png] brand_name="Acme Corp" domain="/acme"
```

### Color Extraction Guidelines

1. **Primary Color**: Usually the most vibrant or brand-defining color. Often used for buttons, links, and accents.

2. **Secondary Color**: Complementary or supporting color. Can be a variation of primary or a contrasting color.

3. **Tertiary Color**: Additional accent color, often used for highlights or special elements.

4. **Background Color**: The main background/base color. Usually light (#ffffff, #f5f5f5) or dark (#000000, #1a1a1a).

5. **Text Color**: Ensure WCAG contrast compliance:
   - Light backgrounds → dark text (#1f2937, #000000)
   - Dark backgrounds → light text (#ffffff, #f9fafb)

6. **Button Colors**:
   - `button_bg_color`: Usually matches primary_color or white
   - `button_text_color`: Contrasting color (white on colored bg, colored on white bg)
   - `button_hover_color`: Slightly darker/lighter variation of button_bg_color

7. **Gradients**: Create gradients using the extracted colors:
   - `learn_overlay_bg`: Subtle gradient with low opacity (0.08, 0.04) using primary/secondary colors
   - `learn_overlay_title_gradient`: More vibrant gradient using primary, tertiary, and primary again

8. **Shadows and Borders**: Use rgba versions of primary color with appropriate opacity (0.1-0.3)

### Code Structure to Follow

When adding a new theme, follow this exact pattern:

```typescript
// {BrandName} theme config
const {brandName}Theme: ThemeConfig = {
    domain: '{domain}',
    brand_name: '{Brand Name}',
    bg_color: '#{hex}',
    primary_color: '#{hex}',
    secondary_color: '#{hex}',
    tertiary_color: '#{hex}',
    text_color: '#{hex}',
    button_bg_color: '#{hex}',
    button_text_color: '#{hex}',
    button_hover_color: '#{hex}',
    icon_container_color: '#{hex}',
    icon_container_text_color: '#{hex}',
    learn_overlay_bg: 'linear-gradient(135deg, rgba({r}, {g}, {b}, 0.08) 0%, rgba(255, 255, 255, 0.95) 50%, rgba({r}, {g}, {b}, 0.04) 100%)',
    learn_overlay_title_gradient: 'linear-gradient(135deg, #{primary} 0%, #{tertiary} 50%, #{primary} 100%)',
    learn_question_card_border: 'rgba({r}, {g}, {b}, 0.3)',
    learn_question_card_shadow: '0 4px 20px rgba({r}, {g}, {b}, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
    sidebar_active_color: '#{primary}',
    header_bg_color: '#{hex}',
    header_text_color: '#{primary}',
};
```

Then add to the dictionary:
```typescript
export const themeConfig: Record<string, ThemeConfig> = {
    '/goodrx': goodrxTheme,
    '/onapgo': onapgoTheme,
    '/{domain}': {brandName}Theme,  // Add new entry
};
```

### Notes
- Always maintain code formatting consistency
- Ensure all hex colors are uppercase
- Test that gradients use valid color values
- Verify contrast ratios meet accessibility standards
- Keep existing themes unchanged unless specifically requested
