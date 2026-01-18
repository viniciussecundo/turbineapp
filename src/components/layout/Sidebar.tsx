import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Users,
  FileText,
  BarChart3,
  ChevronRight,
  Rocket,
  Settings,
  X,
  Menu,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/financas", label: "Finanças", icon: Wallet },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/leads", label: "Leads", icon: Target },
  { path: "/orcamentos", label: "Orçamentos", icon: FileText },
  { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

const quickAccess = [
  { label: "Status Serviços", color: "bg-success" },
  { label: "Pendentes", color: "bg-warning" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 h-full w-64 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white shadow-lg glow-primary">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              TURBINE <span className="text-primary">APP</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} to={item.path} onClick={onClose}>
                  <div
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-primary shadow-sm ring-1 ring-white/5"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-white",
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-primary/50" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-6 bg-sidebar-border" />

          {/* Quick Access */}
          <div className="px-3">
            <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Acesso Rápido
            </h4>
            <div className="space-y-1">
              {quickAccess.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white h-9 px-3"
                >
                  <div className={cn("h-2 w-2 rounded-full", item.color)} />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 hover:bg-sidebar-accent transition-colors cursor-pointer group">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10">
              <img
                alt="Admin"
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white group-hover:text-primary transition-colors">
                Admin User
              </p>
              <p className="truncate text-xs text-muted-foreground">
                admin@turbine.tech
              </p>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden -ml-2"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
