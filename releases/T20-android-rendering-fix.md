# T20 — Android Rendering Polish (Species Boxes)
_Shipped: 2026-05-26_

## What shipped
- Fixed species box text rendering on Android by adding `includeFontPadding: false` to `tileName` style
- Increased `lineHeight` from 17 to 18 on `tileName` for better breathing room on Android's different font metrics

## Key decisions
- **Android font padding removed** — Android includes extra top/bottom padding by default on text elements. Removing it ensures the species name sits properly centered in the tile on Android (iOS was unaffected).
- **Line height increased** — Android calculates font metrics differently than iOS. Slightly more headroom (17 → 18) prevents clipping of bold text on Android while maintaining visual balance.

## Why this fix
Task 20 species tiles rendered correctly on iOS but had text misalignment and potential clipping on Android due to platform-specific text rendering. This fix ensures the visual design carries across both platforms.

## Files changed
- `app/(tabs)/poster.tsx` — updated `tileName` style
