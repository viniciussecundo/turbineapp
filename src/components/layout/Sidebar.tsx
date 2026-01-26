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
  Plus,
  UserPlus,
  FilePlus,
  Bell,
  Eye,
  Sparkles,
  DollarSign,
  UserCheck,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useData } from "@/contexts/DataContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/leads", label: "Leads", icon: Target },
  { path: "/financas", label: "Finanças", icon: Wallet },
  { path: "/orcamentos", label: "Orçamentos", icon: FileText },
  { path: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

const quickAccess = [
  { label: "Novo Cliente", path: "/clientes?new=true", icon: UserPlus },
  { label: "Novo Lead", path: "/leads?new=true", icon: Target },
  { label: "Novo Orçamento", path: "/orcamentos?new=true", icon: FilePlus },
];

const activityIcons = {
  lead: Target,
  client: Users,
  transaction: DollarSign,
  budget: Receipt,
  wallet: Wallet,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [showActivities, setShowActivities] = useState(true);
  const {
    getUnviewedLeadsCount,
    activities,
    markAllActivitiesAsRead,
    getUnreadActivitiesCount,
  } = useData();

  const unviewedLeadsCount = getUnviewedLeadsCount();
  const unreadActivitiesCount = getUnreadActivitiesCount();

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

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
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white shadow-lg glow-primary">
              <Rocket className="h-5 w-5" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              TURBINE <span className="text-primary">APP</span>
            </span>
          </Link>
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
              const isLeads = item.path === "/leads";
              const hasNotification = isLeads && unviewedLeadsCount > 0;

              return (
                <Link key={item.path} to={item.path} onClick={onClose}>
                  <div
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-primary shadow-sm ring-1 ring-white/5"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white",
                      hasNotification && !isActive && "ring-1 ring-primary/30",
                    )}
                  >
                    <div className="relative">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-white",
                          hasNotification && "text-primary",
                        )}
                      />
                      {hasNotification && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    {item.label}
                    {hasNotification && (
                      <Badge className="ml-auto h-5 px-1.5 text-xs bg-primary text-white">
                        {unviewedLeadsCount}
                      </Badge>
                    )}
                    {isActive && !hasNotification && (
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
              {quickAccess.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={item.path} onClick={onClose}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white h-9 px-3"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator className="my-6 bg-sidebar-border" />

          {/* Activity Feed / Notificações */}
          <div className="px-3">
            <div
              className="flex items-center justify-between px-2 mb-2 cursor-pointer"
              onClick={() => setShowActivities(!showActivities)}
            >
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Atividades
                </h4>
                {unreadActivitiesCount > 0 && (
                  <Badge className="h-4 px-1 text-[10px] bg-primary text-white">
                    {unreadActivitiesCount}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform",
                  !showActivities && "-rotate-90",
                )}
              />
            </div>

            {showActivities && (
              <div className="space-y-1">
                {activities.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade recente</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[180px] pr-2">
                      <div className="space-y-1">
                        {activities.slice(0, 10).map((activity) => {
                          const ActivityIcon =
                            activityIcons[activity.type] || Bell;
                          return (
                            <div
                              key={activity.id}
                              className={cn(
                                "relative flex items-start gap-2 rounded-lg p-2 text-xs transition-colors hover:bg-sidebar-accent/50",
                                !activity.read &&
                                  "bg-primary/5 ring-1 ring-primary/20",
                              )}
                            >
                              {!activity.read && (
                                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              )}
                              <div
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                  activity.type === "lead" &&
                                    "bg-blue-500/10 text-blue-400",
                                  activity.type === "client" &&
                                    "bg-green-500/10 text-green-400",
                                  activity.type === "transaction" &&
                                    "bg-yellow-500/10 text-yellow-400",
                                  activity.type === "budget" &&
                                    "bg-purple-500/10 text-purple-400",
                                  activity.type === "wallet" &&
                                    "bg-cyan-500/10 text-cyan-400",
                                )}
                              >
                                <ActivityIcon className="h-3 w-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {activity.title}
                                </p>
                                <p className="text-muted-foreground truncate">
                                  {activity.description}
                                </p>
                                <p className="text-muted-foreground/60 mt-0.5">
                                  {formatActivityTime(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                    {unreadActivitiesCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs text-muted-foreground hover:text-primary"
                        onClick={markAllActivitiesAsRead}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Marcar como lidas
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
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
