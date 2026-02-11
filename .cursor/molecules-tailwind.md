# Molecules: Tailwind single source of truth

All molecule components must use **tailwind-molecules.json** for Tailwind classes. No inline Tailwind class strings in `src/components/molecules/**/*.tsx`.

## Usage

- Import: `import { getClasses } from "@/components/molecules/tailwind-molecules";`
- At top of component: `const classes = getClasses("Subfolder/ComponentName.tsx");` (path relative to `molecules/`)
- Use: `className={classes[0]}`, `className={classes[1]}`, or `className={cn(classes[i], ...)}` for conditional classes.

## Adding or changing classes

1. Edit **tailwind-molecules.json** → `byFile` → your file path → array of class strings (same order as in the component).
2. Or run `npm run extract:tailwind-molecules` to re-extract from current source (overwrites `byFile` from current inline classes).

## Codemod

To migrate a molecule file to use the JSON: ensure its path and class list are in `byFile`, then run:

```bash
node script/codemod-molecules-use-json-classes.mjs
```

This replaces literal `className="..."` and `cn("...")` with `className={classes[i]}` and adds the `getClasses` import.
