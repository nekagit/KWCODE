import React from 'react';

interface ThemeNameHeaderProps {
  themeName: string;
}

const ThemeNameHeader: React.FC<ThemeNameHeaderProps> = ({ themeName }) => {
  return (
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
      {themeName}
    </h2>
  );
};

export default ThemeNameHeader;
