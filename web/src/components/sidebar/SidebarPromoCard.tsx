import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SidebarPromoCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  external?: boolean;
}

export function SidebarPromoCard({
  title,
  description,
  href,
  icon,
  badge,
  external = false,
}: SidebarPromoCardProps) {
  return (
    <Card className="bg-card border-border/60 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          {badge && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="block">
            <Button
              variant="ghost"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Acessar
            </Button>
          </a>
        ) : (
          <Link href={href} className="block">
            <Button
              variant="ghost"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Acessar
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

