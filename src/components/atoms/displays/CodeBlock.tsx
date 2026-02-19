/** Code Block component. */
import React from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className = "rounded bg-muted px-1",
}) => {
  return <code className={className}>{children}</code>;
};
