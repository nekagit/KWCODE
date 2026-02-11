# 0002 Component Architecture Refactoring

## Status
Proposed

## Context
The existing `src/components/molecules` directory contains a variety of components with inconsistent structures and design patterns. This leads to redundant code, difficulties in maintenance, and an overall lack of visual and functional consistency across the application.

The goal is to establish a clear, scalable, and maintainable component architecture by:
1.  Defining generic, reusable layout components for common UI patterns (e.g., Cards, Forms, Dialogs, Tabs).
2.  Enforcing consistent design elements within these generic components (e.g., standardized footers, title/subtitle sections).
3.  Refactoring existing "molecules" into smaller, more focused "atom" components to promote reusability and simplify the component hierarchy.

## Decision
We will introduce a new directory `src/components/shared` for generic layout components and `src/components/atoms` for the smallest, reusable UI elements.

### Generic Component Structures:

#### Card
A generic `Card` component will provide a consistent layout with the following sections:
-   **Header:** Optional title and subtitle.
-   **Main Content:** A flexible area where any child components can be rendered.
-   **Footer:** Always contains a right-aligned button group.

```typescript
// Example Card structure
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode; // Main content
  footerButtons: React.ReactNode; // Right-aligned button group
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, footerButtons }) => (
  <div className="card-container">
    {title && <div className="card-header">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>}
    <div className="card-main">
      {children}
    </div>
    <div className="card-footer">
      <div className="button-group">
        {footerButtons}
      </div>
    </div>
  </div>
);
```

#### Form
A generic `Form` component will provide consistent styling and structure for forms.

```typescript
// Example Form structure
interface FormProps {
  children: React.ReactNode; // Form fields and other elements
  onSubmit: (event: React.FormEvent) => void;
  // Potentially include props for consistent button groups in form footer
}

const Form: React.FC<FormProps> = ({ children, onSubmit }) => (
  <form onSubmit={onSubmit} className="generic-form">
    {children}
  </form>
);
```

#### Dialog
A generic `Dialog` component will ensure consistent modal/dialog presentations.

```typescript
// Example Dialog structure
interface DialogProps {
  title: string;
  children: React.ReactNode; // Dialog content
  onClose: () => void;
  actions?: React.ReactNode; // Buttons at the bottom of the dialog
}

const Dialog: React.FC<DialogProps> = ({ title, children, onClose, actions }) => (
  <div className="dialog-overlay">
    <div className="dialog-content">
      <div className="dialog-header">
        <h4>{title}</h4>
        <button onClick={onClose}>X</button>
      </div>
      <div className="dialog-body">
        {children}
      </div>
      {actions && <div className="dialog-actions">
        {actions}
      </div>}
    </div>
  </div>
);
```

#### Tabs
A generic `Tabs` component will provide a consistent tabbed navigation pattern.

```typescript
// Example Tabs structure
interface TabProps {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabProps[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  // ... tab switching logic ...
  return (
    <div className="tabs-container">
      <div className="tab-headers">
        {/* ... map tab labels ... */}
      </div>
      <div className="tab-content">
        {/* ... display active tab content ... */}
      </div>
    </div>
  );
};
```

#### List
A generic `List` component will provide consistent rendering for lists.

```typescript
// Example List structure
interface ListItemProps {
  id: string;
  content: React.ReactNode;
}

interface ListProps {
  items: ListItemProps[];
}

const List: React.FC<ListProps> = ({ items }) => (
  <ul className="generic-list">
    {items.map(item => (
      <li key={item.id}>{item.content}</li>
    ))}
  </ul>
);
```

#### Table
A generic `Table` component for displaying tabular data consistently.

```typescript
// Example Table structure
interface TableColumn {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode; // Custom render function for cell content
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
}

const Table: React.FC<TableProps> = ({ data, columns }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((item, rowIndex) => (
          <tr key={item.id || rowIndex}>
            {columns.map((column, colIndex) => (
              <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {column.render ? column.render(item) : item[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

#### ButtonGroup
A generic `ButtonGroup` component for consistent grouping and spacing of buttons.

```typescript
// Example ButtonGroup structure
interface ButtonGroupProps {
  children: React.ReactNode;
  alignment?: 'left' | 'center' | 'right'; // Default to 'right' for footer buttons
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, alignment = 'right', className }) => {
  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[alignment];

  return (
    <div className={`flex space-x-2 ${justifyClass} ${className || ''}`}>
      {children}
    </div>
  );
};
```

#### PageHeader
A generic `PageHeader` component for consistent page titles and navigation.

```typescript
// Example PageHeader structure
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode; // e.g., buttons for page-level actions
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="page-header-container">
    <div className="text-section">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="actions-section">
      {actions}
    </div>}
  </div>
);
```

#### Accordion
A generic `Accordion` component to manage collapsible content sections.

```typescript
// Example Accordion structure
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemProps[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  // ... accordion logic ...
  return (
    <div className="accordion-container">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button className="accordion-header">{item.title}</button>
          <div className="accordion-content">{item.children}</div>
        </div>
      ))}
    </div>
  );
};
```

#### EmptyState/LoadingState
A generic component for standardized display when data is not available or is being loaded.

```typescript
// Example EmptyState/LoadingState structure
interface StateProps {
  message: string;
  icon?: React.ElementType;
  action?: React.ReactNode; // e.g., a button to create new item
}

export const EmptyState: React.FC<StateProps> = ({ message, icon: Icon, action }) => (
  <div className="empty-state-container">
    {Icon && <Icon className="state-icon" />}
    <p>{message}</p>
    {action && <div className="state-action">{action}</div>}
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="loading-state-container">
    <p>Loading...</p>
  </div>
);
```

#### ErrorDisplay
A generic component for consistent error message presentation.

```typescript
// Example ErrorDisplay structure
interface ErrorDisplayProps {
  message: string;
  details?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, details }) => (
  <div className="error-display-container">
    <p className="error-message">Error: {message}</p>
    {details && <pre className="error-details">{details}</pre>}
  </div>
);
```

### Refactoring to Atoms:
Existing components in `src/components/molecules` will be broken down into simpler, single-responsibility components (atoms) and placed in `src/components/atoms`. The original molecule components will be updated to compose these new atom and shared components.

## Consequences
-   **Improved Consistency:** Enforces a unified look and feel across the application.
-   **Increased Reusability:** Promotes the creation of smaller, more focused components that can be easily reused.
-   **Easier Maintenance:** Simplifies debugging and updates due to a clearer component hierarchy.
-   **Initial Development Overhead:** Requires refactoring existing components, which may take time.
-   **Learning Curve:** Developers will need to adapt to the new component architecture.
