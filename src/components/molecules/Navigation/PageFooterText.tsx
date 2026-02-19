/** Page Footer Text component. */
import React from 'react';
import Link from "next/link";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Navigation/PageFooterText.tsx");

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
    <p className={classes[0]}>
      {text}{" "}
      <Link href={linkHref} className={classes[1]}>
        {linkText}
      </Link>
      .
    </p>
  );
};
