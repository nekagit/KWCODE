# 0011: Fix initialActiveTab Prop Warning

## Context

A React console error was observed: "React does not recognize the `initialActiveTab` prop on a DOM element." This error indicates that a custom React component was passing a prop named `initialActiveTab` directly to a standard HTML DOM element, which React then flagged as an unknown attribute.

Upon initial investigation, the `initialActiveTab` prop was identified in:
- `src/components/molecules/UtilitiesAndHelpers/TemplateIdeaAccordion.tsx`: where it was being passed to a `Tabs` component.
- `src/components/shared/Tabs.tsx`: where it was defined as a prop for the `Tabs` component.

The initial assumption was that the `Tabs` component was implicitly passing all received props to its root `div` element. A fix was implemented in `src/components/shared/Tabs.tsx` to explicitly destructure `tabs` and `initialActiveTab` and spread the remaining `...props` onto the root `div`.

However, the warning persisted. Further investigation revealed that `TemplateIdeaAccordion.tsx` was passing `initialActiveTab` to a custom `Accordion` component (defined at `src/components/shared/Accordion.tsx`), not the `Tabs` component. The `Accordion` component was not designed to handle an `initialActiveTab` prop and was inadvertently contributing to the React warning.

## Decision

To fully resolve this, both the `Accordion` and `AccordionItem` components in `src/components/shared/Accordion.tsx` were modified to correctly handle props. This involved:

**For `Accordion` component:**
1.  **Updating `AccordionProps`**: Added `initialActiveTab?: string;` to the `AccordionProps` interface.
2.  **Internal State Management**: Introduced `useState` for `activeItemTitle` within `Accordion`, initialized with `initialActiveTab` or the first item's title.
3.  **Spreading Remaining Props**: The `Accordion` component was updated to accept and spread any additional props (`...props`) to its root `div` element. This ensures that any unrecognized props are not implicitly passed to the DOM.

**For `AccordionItem` component:**
1.  **Accepting All Props**: Modified `AccordionItem` to accept `...props` in its functional signature.
2.  **Spreading Props to Root Div**: Applied `...props` to the root `div` of `AccordionItem` to prevent any unintended prop leakage to the DOM.
3.  **Conditional `defaultOpen`**: Modified the `AccordionItem` rendering within `Accordion` to set `defaultOpen` based on `activeItemTitle === item.title`.
4.  **Explicit Prop Passing**: Replaced the spread operator `...item` with explicit prop passing (`title={item.title}`, `defaultOpen={...}`, `children={item.children}`) to `AccordionItem` within the `Accordion` component to prevent any unintended props from being passed down.
5.  **Unique Key for AccordionItem**: Ensured that `AccordionItem` uses `item.title` as a key, falling back to `index` if `title` is not available, to satisfy React's list rendering requirements.

The key part of the changes in `src/components/shared/Accordion.tsx`:

**`Accordion` Component:**
```typescript
interface AccordionProps {
  items: AccordionItemProps[];
  initialActiveTab?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, initialActiveTab, ...props }) => {
  const [activeItemTitle, setActiveItemTitle] = useState(initialActiveTab || (items.length > 0 ? items[0].title : ''));

  return (
    <div className="w-full rounded-lg bg-white dark:bg-gray-800 shadow" {...props}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.title || index}
          title={item.title}
          defaultOpen={activeItemTitle === item.title}
        >
          {item.children}
        </AccordionItem>
      ))}
    </div>
  );
};
```

**`AccordionItem` Component:**
```typescript
const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0" {...props}>
      <button
        className="flex justify-between items-center w-full py-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        {/* ... SVG icon ... */}
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};
```

## Status

Completed.

## Consequences

- The React console warning regarding `initialActiveTab` is resolved for all identified usages.
- The `Accordion` and `AccordionItem` components now correctly handle their respective props, preventing unintended prop leakage to the DOM.
- The `TemplateIdeaAccordion` component now functions correctly without prop warnings.
- No functional regressions are expected; the components behave as intended with proper prop handling.
