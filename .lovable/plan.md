

# Update Hero Section Dashboard Preview

## What's Changing

The dashboard mockup in the landing page hero section will be updated to:

1. **Remove the URL bar** from the browser chrome (the "mytradebook.lovable.app/dashboard" link) since the app won't always be on Lovable's domain. Keep only the decorative traffic light dots.

2. **Change the greeting** from "Good Morning, Dashboard" to "Welcome, Mr. Chartist" with a personalized feel matching the actual dashboard's greeting style (large bold name with emoji wave).

3. **Polish the preview** to better match the real dashboard aesthetic -- the greeting should use the same layout pattern as `DashboardGreeting` (larger text, primary-colored name).

## Technical Changes

### File: `src/pages/Landing.tsx` (lines 538-587)

**Window chrome (lines 538-551):**
- Keep the three colored dots (traffic light buttons)
- Remove the entire center `div` containing the URL bar with "mytradebook.lovable.app/dashboard"
- This simplifies the chrome to just decorative dots

**Greeting section (lines 574-587):**
- Replace "Good Morning," / "Dashboard" with a single line: **"Welcome, Mr. Chartist"** styled to match the actual dashboard greeting
- Use larger text with the name highlighted in primary/accent color
- Add a wave emoji to match the real `DashboardGreeting` component
- Keep the streak badge and Live indicator on the right side

### No Other Files Changed
- Only `src/pages/Landing.tsx` is modified
- The real `DashboardGreeting` component is untouched
- All other sections of the landing page remain as-is

