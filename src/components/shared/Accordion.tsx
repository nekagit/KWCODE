import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0" {...props}>
      <button
        className="flex justify-between items-center w-full py-4 text-left font-medium text-foreground hover:bg-muted/50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        <svg
          className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  items: AccordionItemProps[];
  initialActiveTab?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, initialActiveTab, ...props }) => {
  const [activeItemTitle, setActiveItemTitle] = useState(initialActiveTab || (items.length > 0 ? items[0].title : ''));

  return (
    <div className="w-full rounded-lg bg-card text-card-foreground shadow border border-border" {...props}>
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
