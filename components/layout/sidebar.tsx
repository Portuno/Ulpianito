"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  ShieldCheck,
  Users,
  Zap,
  GraduationCap,
  FileText,
  Scale,
  Menu,
  Trophy,
  BrainCircuit,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const upperGroup: NavGroup = {
  label: "Operaciones",
  items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/expedientes", label: "Expedientes", icon: FolderKanban },
    { href: "/ingesta", label: "Ingesta de Datos", icon: UploadCloud },
    { href: "/validacion", label: "Validación (HITL)", icon: ShieldCheck },
    { href: "/directorio", label: "Directorio", icon: Users },
    { href: "/agentes", label: "Flujos IA", icon: Zap },
    { href: "/misiones", label: "Misiones Ius", icon: Trophy },
    { href: "/quizzes", label: "Quizzes IA", icon: BrainCircuit },
  ],
};

const lowerGroup: NavGroup = {
  label: "Crecimiento",
  items: [
    { href: "/academia", label: "Academia Ulpianito", icon: GraduationCap },
    { href: "/ius", label: "Economía IUS", icon: Coins },
    { href: "/documentacion", label: "Documentación", icon: FileText },
  ],
};

const expedienteDetailPattern = /^\/expedientes\/[^/]+$/;

const NavGroupSection = ({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}) => (
  <div className="space-y-1">
    <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
      {group.label}
    </p>
    {group.items.map((item) => {
      const isActive =
        pathname === item.href || pathname.startsWith(item.href + "/");
      const isExpedientesNav = item.href === "/expedientes";
      const isInsideExpediente = expedienteDetailPattern.test(pathname);

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            isActive &&
              isExpedientesNav &&
              isInsideExpediente &&
              "ring-2 ring-primary-foreground/35 ring-offset-2 ring-offset-background",
          )}
          aria-current={isActive ? "page" : undefined}
          tabIndex={0}
        >
          <item.icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive
                ? "text-primary-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          {item.label}
        </Link>
      );
    })}
  </div>
);

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold transition-opacity hover:opacity-80"
          onClick={onNavigate}
          aria-label="Ir al dashboard de Ulpianito"
        >
          <Scale className="h-6 w-6 text-primary" />
          <span className="text-lg tracking-tight">Ulpianito</span>
        </Link>
      </div>

      <nav
        className="flex flex-1 flex-col justify-between p-4"
        aria-label="Navegación principal"
      >
        <div className="space-y-6">
          <NavGroupSection
            group={upperGroup}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </div>

        <div className="space-y-4">
          <Separator />
          <NavGroupSection
            group={lowerGroup}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </div>
      </nav>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden w-64 border-r bg-background md:block">
      <SidebarContent />
    </aside>
  );
};

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};
