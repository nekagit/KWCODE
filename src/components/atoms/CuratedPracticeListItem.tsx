import React from 'react';

interface CuratedPracticeListItemProps {
  practice: string;
}

export const CuratedPracticeListItem: React.FC<CuratedPracticeListItemProps> = ({ practice }) => {
  return (
    <li className="flex gap-2 text-sm">
      <span className="text-muted-foreground shrink-0">•</span>
      <span>{practice}</span>
    </li>
  );
};
