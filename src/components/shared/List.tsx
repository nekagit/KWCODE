import React from 'react';
import sharedClasses from './shared-classes';

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
    <ul data-shared-ui className={`${sharedClasses.List.root} ${className || ''}`}>
      {items.map(item => (
        <li key={item.id} className={sharedClasses.List.item}>
          {item.content}
        </li>
      ))}
    </ul>
  );
};
