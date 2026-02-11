import React, { useState } from 'react';
import sharedClasses from './shared-classes';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  initialActiveTab?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialActiveTab, ...props }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || (tabs.length > 0 ? tabs[0].label : ''));

  return (
    <div data-shared-ui {...props}>
      <div className={sharedClasses.Tabs.tabsWrapper}>
        <nav className={sharedClasses.Tabs.nav} aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`${sharedClasses.Tabs.tabButtonBase} ${
                activeTab === tab.label
                  ? sharedClasses.Tabs.tabButtonActive
                  : sharedClasses.Tabs.tabButtonInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {tabs.find((tab) => tab.label === activeTab)?.content}
      </div>
    </div>
  );
};
