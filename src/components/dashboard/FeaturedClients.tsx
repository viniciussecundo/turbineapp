import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Trophy, Wallet, Clock, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

type TabType = "recent" | "top" | "wallet";

const tabs: { id: TabType; label: string; icon: typeof Users }[] = [
  { id: "recent", label: "Recentes", icon: Clock },
  { id: "top", label: "Top Valor", icon: Trophy },
  { id: "wallet", label: "Carteira Ativa", icon: Wallet },
];

const statusConfig = {
  active: {
    label: "Ativo",
    className: "bg-success/20 text-success border-success/30",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  inactive: {
    label: "Inativo",
    className: "bg-muted text-muted-foreground border-muted",
  },
};

export function FeaturedClients() {
  const { clients, wallets, transactions } = useData();
  const [activeTab, setActiveTab] = useState<TabType>("recent");

  // Calcular valor total de transações por cliente
  const clientsWithTotalValue = useMemo(() => {
    return clients.map((client) => {
      const clientTransactions = transactions.filter(
        (tx) =>
          tx.clientId === client.id &&
          tx.type === "income" &&
          tx.status === "completed",
      );
      const totalValue = clientTransactions.reduce(
        (sum, tx) => sum + tx.value,
        0,
      );
      const wallet = wallets.find((w) => w.clientId === client.id);
      return {
        ...client,
        totalValue,
        hasWallet: !!wallet,
        walletBalance: wallet?.balance || 0,
      };
    });
  }, [clients, transactions, wallets]);

  // Clientes recentes (últimos adicionados - por id mais alto ou convertedAt)
  const recentClients = useMemo(() => {
    return [...clientsWithTotalValue]
      .sort((a, b) => {
        // Ordenar por data de conversão ou por ID
        if (a.convertedAt && b.convertedAt) {
          return (
            new Date(b.convertedAt).getTime() -
            new Date(a.convertedAt).getTime()
          );
        }
        return b.id - a.id;
      })
      .slice(0, 5);
  }, [clientsWithTotalValue]);

  // Top clientes por valor total
  const topClients = useMemo(() => {
    return [...clientsWithTotalValue]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [clientsWithTotalValue]);

  // Clientes com carteira virtual ativa
  const walletClients = useMemo(() => {
    return clientsWithTotalValue
      .filter((c) => c.hasWallet)
      .sort((a, b) => b.walletBalance - a.walletBalance)
      .slice(0, 5);
  }, [clientsWithTotalValue]);

  // Selecionar lista baseado na tab ativa
  const displayClients = useMemo(() => {
    switch (activeTab) {
      case "recent":
        return recentClients;
      case "top":
        return topClients;
      case "wallet":
        return walletClients;
      default:
        return recentClients;
    }
  }, [activeTab, recentClients, topClients, walletClients]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  return (
    <div className="glass rounded-xl p-6 card-shadow h-[436px] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Clientes em Destaque
            </h3>
            <p className="text-sm text-muted-foreground">
              {clients.length} cliente{clients.length !== 1 ? "s" : ""}{" "}
              cadastrado{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          to="/clientes"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Ver todos
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-sidebar-accent/50 rounded-lg mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de Clientes */}
      {displayClients.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {activeTab === "wallet"
              ? "Nenhum cliente com carteira ativa"
              : "Nenhum cliente cadastrado"}
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {displayClients.map((client, index) => {
            const status =
              statusConfig[client.status as keyof typeof statusConfig];

            return (
              <Link
                key={client.id}
                to="/clientes"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent/50 transition-colors group"
              >
                {/* Ranking para Top clientes */}
                {activeTab === "top" && (
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                      index === 0
                        ? "bg-yellow-500/20 text-yellow-500"
                        : index === 1
                          ? "bg-slate-400/20 text-slate-400"
                          : index === 2
                            ? "bg-amber-700/20 text-amber-600"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                )}

                <Avatar className="h-9 w-9 border border-white/10">
                  <AvatarImage src={client.avatar} alt={client.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {client.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        status.className,
                      )}
                    >
                      {status.label}
                    </Badge>
                    {client.hasWallet && activeTab !== "wallet" && (
                      <Wallet className="h-3 w-3 text-primary" />
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {activeTab === "wallet" ? (
                    <div>
                      <p className="text-sm font-medium text-success">
                        {formatCurrency(client.walletBalance)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">saldo</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(client.totalValue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        receita
                      </p>
                    </div>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
