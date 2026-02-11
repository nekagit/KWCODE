import { LucideIcon } from "lucide-react";
import React from "react";

interface TitleWithIconProps {
  icon: LucideIcon;
  title: string;
  className?: string;
  iconClassName?: string;
}

export const TitleWithIcon: React.FC<TitleWithIconProps> = ({
  icon: Icon,
  title,
  className,
  iconClassName,
}) => {
  fetch('http://127.0.0.1:7242/ingest/3a8fa5bb-85c1-4305-bdaa-558e16902420',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/atoms/headers/TitleWithIcon.tsx:11',message:'TitleWithIcon component definition',data:{typeofTitleWithIcon:typeof TitleWithIcon},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Icon className={`h-5 w-5 ${iconClassName}`} />
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};
