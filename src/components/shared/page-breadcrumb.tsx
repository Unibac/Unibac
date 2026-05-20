import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type PageBreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbProps = {
  items: PageBreadcrumbItem[];
  className?: string;
};

function breadcrumbItemKey(item: PageBreadcrumbItem): string {
  return item.href ?? item.label;
}

export function PageBreadcrumb({ items, className }: PageBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={breadcrumbItemKey(item)}
              className="flex items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRightIcon
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
