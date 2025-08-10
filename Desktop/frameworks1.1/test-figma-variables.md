# Testing Figma Local Variables Generation

## Setup Steps

1. **Build your plugin:**
   ```bash
   cd custom-ui
   npm run build
   ```

2. **Load in Figma:**
   - Open Figma
   - Go to Plugins > Development > Import plugin from manifest
   - Select your `manifest.json` file

## Testing the Variables Generation

### 1. Test Primitives
- Open your plugin
- Go to "Primitives" tab
- Select some colors (e.g., a few from "slate" family)
- Click "Generate X" button
- Check Figma's Variables panel for "Framework/Primitives" collection

### 2. Test Semantics
- Go to "Semantics" tab
- Click "Generate X" button
- Check Figma's Variables panel for "Framework/Semantics" collection
- Verify both Light and Dark modes are created

### 3. Test Mixed Generation
- Select some primitives AND click generate
- Verify both collections are populated
- Check that variables have proper descriptions showing related primitives

## Expected Results

✅ **Collections Created:**
- `Framework/Primitives` - for Tailwind color primitives
- `Framework/Semantics` - for semantic color tokens

✅ **Modes Created:**
- Light mode
- Dark mode

✅ **Variable Naming:**
- Primitives: `slate-50`, `slate-100`, etc.
- Semantics: `surface-primary`, `text-primary`, etc.

✅ **Descriptions:**
- Semantic variables show which primitives they use
- Example: "Uses: slate-100, gray-200"

## Troubleshooting

### Variables not appearing?
- Check Figma's console for errors
- Verify plugin has proper permissions
- Ensure you're looking in the right collection

### Naming issues?
- Variables are automatically sanitized
- Invalid characters are removed
- Spaces become forward slashes for hierarchy

### Mode issues?
- Both Light and Dark modes are auto-created
- If only one exists, the other is added automatically

## Figma Variables Best Practices

1. **Use Collections** - Group related variables logically
2. **Consistent Naming** - Follow your established patterns
3. **Mode Support** - Always provide Light/Dark variants
4. **Descriptions** - Add context for team members
5. **Regular Updates** - Regenerate when design system changes

## Next Steps

Once working, you can:
- Customize the collection names
- Add more semantic token categories
- Create custom color ramps
- Export variables for other design tools
