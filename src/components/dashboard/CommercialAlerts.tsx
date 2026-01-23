import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  FileText,
  UserX,
  DollarSign,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  type: "budget" | "lead" | "client";
  title: string;
  subtitle: string;
  priority: "high" | "medium" | "low";
  link: string;
}

const priorityConfig = {
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  medium: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  low: {
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-muted",
  },
};

const typeConfig = {
  budget: { icon: FileText, label: "Orçamento" },
  lead: { icon: UserX, label: "Lead" },
  client: { icon: DollarSign, label: "Cliente" },
};

export function CommercialAlerts() {
  const { budgets, leads, clients, transactions } = useData();

  const alerts = useMemo(() => {
    const items: AlertItem[] = [];
    const now = new Date();
    const DAYS_WITHOUT_CONTACT = 7; // Dias sem contato para considerar urgente

    // 1. Orçamentos pendentes ou enviados
    budgets
      .filter((b) => b.status === "draft" || b.status === "sent")
      .forEach((budget) => {
        const client = clients.find((c) => c.id === budget.clientId);
        const daysSinceCreated = Math.floor(
          (now.getTime() - new Date(budget.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Orçamentos enviados há mais de 3 dias são alta prioridade
        const priority =
          budget.status === "sent" && daysSinceCreated > 3
            ? "high"
            : budget.status === "sent"
              ? "medium"
              : "low";

        items.push({
          id: `budget-${budget.id}`,
          type: "budget",
          title: `${budget.code} - ${budget.title}`,
          subtitle:
            budget.status === "sent"
              ? `Enviado há ${daysSinceCreated} dia(s) - ${client?.name || "Cliente"}`
              : `Rascunho - ${client?.name || "Cliente"}`,
          priority,
          link: "/orcamentos",
        });
      });

    // 2. Leads sem contato há X dias
    leads
      .filter((l) => !l.convertedToClientId && l.status !== "fechado")
      .forEach((lead) => {
        const daysSinceCreated = Math.floor(
          (now.getTime() - new Date(lead.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysSinceCreated >= DAYS_WITHOUT_CONTACT) {
          const priority =
            daysSinceCreated > 14
              ? "high"
              : daysSinceCreated > 7
                ? "medium"
                : "low";

          items.push({
            id: `lead-${lead.id}`,
            type: "lead",
            title: lead.name,
            subtitle: `Sem contato há ${daysSinceCreated} dias - Status: ${lead.status}`,
            priority,
            link: "/leads",
          });
        }
      });

    // 3. Clientes sem movimentação financeira (últimos 30 dias)
    clients
      .filter((c) => c.status === "active")
      .forEach((client) => {
        const clientTransactions = transactions.filter(
          (tx) => tx.clientId === client.id,
        );

        if (clientTransactions.length === 0) {
          // Cliente nunca teve transação
          items.push({
            id: `client-${client.id}`,
            type: "client",
            title: client.name,
            subtitle: "Sem movimentação financeira",
            priority: "medium",
            link: "/clientes",
          });
        } else {
          // Verificar última transação
          const lastTransaction = clientTransactions.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

          const daysSinceLastTx = Math.floor(
            (now.getTime() - new Date(lastTransaction.date).getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (daysSinceLastTx > 30) {
            items.push({
              id: `client-${client.id}`,
              type: "client",
              title: client.name,
              subtitle: `Última movimentação há ${daysSinceLastTx} dias`,
              priority: daysSinceLastTx > 60 ? "high" : "medium",
              link: "/clientes",
            });
          }
        }
      });

    // Ordenar por prioridade (high primeiro)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return items.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }, [budgets, leads, clients, transactions]);

  const highPriorityCount = alerts.filter((a) => a.priority === "high").length;

  return (
    <div className="glass rounded-xl p-6 card-shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              highPriorityCount > 0 ? "bg-destructive/10" : "bg-primary/10",
            )}
          >
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                highPriorityCount > 0 ? "text-destructive" : "text-primary",
              )}
            />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Pendências Comerciais
            </h3>
            <p className="text-sm text-muted-foreground">
              Ações que precisam de atenção
            </p>
          </div>
        </div>
        {alerts.length > 0 && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              highPriorityCount > 0
                ? "text-destructive bg-destructive/10"
                : "text-primary bg-primary/10",
            )}
          >
            {alerts.length} pendência{alerts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 mb-3">
            <Clock className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhuma pendência no momento! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {alerts.slice(0, 8).map((alert) => {
            const config = priorityConfig[alert.priority];
            const TypeIcon = typeConfig[alert.type].icon;

            return (
              <Link
                key={alert.id}
                to={alert.link}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  "hover:bg-sidebar-accent/50 hover:border-primary/30",
                  config.border,
                  config.bg,
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    config.bg,
                  )}
                >
                  <TypeIcon className={cn("h-4 w-4", config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.subtitle}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {alerts.length > 8 && (
        <div className="mt-4 pt-4 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            +{alerts.length - 8} pendências adicionais
          </p>
        </div>
      )}
    </div>
  );
}
