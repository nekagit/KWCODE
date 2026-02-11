import React from 'react';
import Link from "next/link";

interface PageFooterTextProps {
  text: string;
  linkHref: string;
  linkText: string;
}

export const PageFooterText: React.FC<PageFooterTextProps> = ({
  text,
  linkHref,
  linkText,
}) => {
  return (
    <p className="text-xs text-muted-foreground">
      {text}{" "}
      <Link href={linkHref} className="underline hover:text-foreground">
        {linkText}
      </Link>
      .
    </p>
  );
};
