import * as React from "react"

import { cn } from "@/lib/utils"

function isIconComponent(value: unknown): value is React.ElementType {
  if (typeof value === "function") return true
  return typeof value === "object" && value !== null && "$$typeof" in value
}

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
}

function Empty({ className, title, description, icon, children, ...props }: EmptyProps) {
  const IconComponent = icon != null && isIconComponent(icon) ? (icon as React.ElementType) : null
  const iconNode = icon != null && !isIconComponent(icon) ? icon : null
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      {(IconComponent || iconNode) && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:h-6 [&>svg]:w-6">
          {IconComponent ? <IconComponent /> : iconNode}
        </div>
      )}
      {title && (
        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      )}
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export { Empty }
