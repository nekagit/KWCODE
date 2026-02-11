# 0006-reduce-box-shadow-intensity.md

## Status
Completed

## Context
The user reported that the shadow in the UI was too prominent. Investigation revealed that the `.glasgmorphism` class in `src/app/globals.css` had a strong `box-shadow` property.

## Decision
The `box-shadow` property on line 242 of `src/app/globals.css` was modified. The blur radius was reduced from `32px` to `16px` and the opacity was decreased from `0.37` to `0.2`.

## Consequences
The shadow intensity in the UI has been reduced, resulting in a softer visual effect.