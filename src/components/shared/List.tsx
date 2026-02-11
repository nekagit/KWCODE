import React from 'react';

interface ListItem {
  id: string;
  content: React.ReactNode;
}

interface ListProps {
  items: ListItem[];
  className?: string;
}

export const List: React.FC<ListProps> = ({ items, className }) => {
  return (
    <ul className={`divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}>
      {items.map(item => (
        <li key={item.id} className="py-4">
          {item.content}
        </li>
      ))}
    </ul>
  );
};
