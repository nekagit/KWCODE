/** Accordion component. */
import React, { useState } from 'react';
import sharedClasses from './shared-classes';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultOpen = false, ...props }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={sharedClasses.Accordion.item} {...props}>
      <button
        className={sharedClasses.Accordion.itemButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {title}
        <svg
          className={`${sharedClasses.Accordion.itemChevron} ${isOpen ? sharedClasses.Accordion.itemChevronOpen : sharedClasses.Accordion.itemChevronClosed}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div className={sharedClasses.Accordion.itemContent}>
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
    <div data-shared-ui className={sharedClasses.Accordion.root} {...props}>
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
