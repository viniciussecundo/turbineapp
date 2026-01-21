import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useData,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/contexts/DataContext";

export default function Financas() {
  const {
    transactions,
    addTransaction,
    clients,
    wallets,
    getWalletByClientId,
    createWallet,
    addWalletMovement,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
  } = useData();

  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: "income" as TransactionType,
    description: "",
    value: "",
    category: "",
    clientId: "",
    notes: "",
  });
  const [walletForm, setWalletForm] = useState({
    clientId: "",
    type: "deposit" as "deposit" | "withdrawal",
    value: "",
    description: "",
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleAddTransaction = () => {
    if (
      !transactionForm.description ||
      !transactionForm.value ||
      !transactionForm.category
    )
      return;

    addTransaction({
      type: transactionForm.type,
      description: transactionForm.description,
      value: parseFloat(transactionForm.value),
      date: new Date().toISOString().split("T")[0],
      category: transactionForm.category,
      status: "completed",
      clientId: transactionForm.clientId
        ? parseInt(transactionForm.clientId)
        : undefined,
      notes: transactionForm.notes || undefined,
    });

    setTransactionForm({
      type: "income",
      description: "",
      value: "",
      category: "",
      clientId: "",
      notes: "",
    });
    setIsTransactionOpen(false);
  };

  const handleWalletMovement = () => {
    if (!walletForm.clientId || !walletForm.value || !walletForm.description)
      return;

    const clientId = parseInt(walletForm.clientId);
    const wallet = getWalletByClientId(clientId);
    const movementValue = parseFloat(walletForm.value);
    const movementData = {
      type: walletForm.type,
      value: movementValue,
      date: new Date().toISOString().split("T")[0],
      description: walletForm.description,
    };

    if (!wallet) {
      // Criar carteira já com a primeira movimentação
      createWallet(clientId, 0, movementData);
    } else {
      // Carteira já existe, adicionar movimentação normalmente
      addWalletMovement(wallet.id, movementData);
    }

    setWalletForm({
      clientId: "",
      type: "deposit",
      value: "",
      description: "",
    });
    setIsWalletOpen(false);
  };

  // Clientes que têm carteira virtual
  const clientsWithWallet = clients.filter((c) => getWalletByClientId(c.id));
  const activeClients = clients.filter((c) => c.status === "active");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Finanças
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas receitas, despesas e carteiras
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-white/10">
                <Wallet className="mr-2 h-4 w-4" />
                Carteira Virtual
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle>Movimentação de Carteira</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={walletForm.clientId}
                    onValueChange={(v) =>
                      setWalletForm({ ...walletForm, clientId: v })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeClients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Movimentação</Label>
                  <Select
                    value={walletForm.type}
                    onValueChange={(v: "deposit" | "withdrawal") =>
                      setWalletForm({ ...walletForm, type: v })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">
                        Depósito (Entrada)
                      </SelectItem>
                      <SelectItem value="withdrawal">
                        Saque/Gasto (Saída)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={walletForm.value}
                    onChange={(e) =>
                      setWalletForm({ ...walletForm, value: e.target.value })
                    }
                    placeholder="0,00"
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={walletForm.description}
                    onChange={(e) =>
                      setWalletForm({
                        ...walletForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Ex: Meta Ads - Campanha Janeiro"
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
                <Button
                  onClick={handleWalletMovement}
                  className="w-full gradient-primary text-white"
                >
                  Registrar Movimentação
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white shadow-lg glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={transactionForm.type}
                    onValueChange={(v: TransactionType) =>
                      setTransactionForm({
                        ...transactionForm,
                        type: v,
                        category: "",
                      })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Entrada (Receita)</SelectItem>
                      <SelectItem value="expense">Saída (Despesa)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={transactionForm.description}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Ex: Pagamento de serviço"
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={transactionForm.value}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        value: e.target.value,
                      })
                    }
                    placeholder="0,00"
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={transactionForm.category}
                    onValueChange={(v) =>
                      setTransactionForm({ ...transactionForm, category: v })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50 border-white/10">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {(transactionForm.type === "income"
                        ? INCOME_CATEGORIES
                        : EXPENSE_CATEGORIES
                      ).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {transactionForm.type === "income" && (
                  <div className="space-y-2">
                    <Label>Vincular a Cliente (opcional)</Label>
                    <Select
                      value={transactionForm.clientId}
                      onValueChange={(v) =>
                        setTransactionForm({ ...transactionForm, clientId: v })
                      }
                    >
                      <SelectTrigger className="bg-secondary/50 border-white/10">
                        <SelectValue placeholder="Nenhum cliente selecionado" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id.toString()}
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Observações (opcional)</Label>
                  <Textarea
                    value={transactionForm.notes}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Detalhes adicionais..."
                    className="bg-secondary/50 border-white/10"
                  />
                </div>
                <Button
                  onClick={handleAddTransaction}
                  className="w-full gradient-primary text-white"
                >
                  Adicionar Transação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(getBalance())}
          change="Receitas - Despesas"
          changeType={getBalance() >= 0 ? "positive" : "negative"}
          icon={DollarSign}
        />
        <StatCard
          title="Receitas"
          value={formatCurrency(getTotalIncome())}
          change={`${transactions.filter((t) => t.type === "income").length} transações`}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(getTotalExpenses())}
          change={`${transactions.filter((t) => t.type === "expense").length} transações`}
          changeType="negative"
          icon={TrendingDown}
        />
        <StatCard
          title="Carteiras Ativas"
          value={wallets.length.toString()}
          change={`${formatCurrency(wallets.reduce((sum, w) => sum + w.balance, 0))} em saldo`}
          changeType="positive"
          icon={Wallet}
        />
      </div>

      {/* Tabs: Transações e Carteiras */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="wallets">Carteiras Virtuais</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="glass rounded-xl p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Transações Recentes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Últimas movimentações financeiras
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação registrada
                </p>
              ) : (
                transactions.slice(0, 10).map((tx) => {
                  const client = tx.clientId
                    ? clients.find((c) => c.id === tx.clientId)
                    : null;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          tx.type === "income"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                          {client && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {client.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            tx.type === "income"
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.value)}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            tx.status === "completed"
                              ? "border-success/30 text-success"
                              : "border-warning/30 text-warning"
                          }
                        >
                          {tx.status === "completed" ? "Concluído" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <div className="glass rounded-xl p-6 card-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Carteiras Virtuais dos Clientes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Controle de saldo para gestão de tráfego
                </p>
              </div>
            </div>

            {wallets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma carteira virtual criada. Adicione uma movimentação para
                um cliente.
              </p>
            ) : (
              <div className="space-y-4">
                {wallets.map((wallet) => {
                  const client = clients.find((c) => c.id === wallet.clientId);
                  if (!client) return null;

                  return (
                    <div
                      key={wallet.id}
                      className="p-4 rounded-lg bg-secondary/30 border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {client.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Criada em {formatDate(wallet.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(wallet.balance)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Saldo disponível
                          </p>
                        </div>
                      </div>

                      {wallet.movements.length > 0 && (
                        <div className="border-t border-white/5 pt-3 mt-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Últimas movimentações:
                          </p>
                          <div className="space-y-2">
                            {wallet.movements.slice(0, 3).map((mov) => (
                              <div
                                key={mov.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {mov.type === "deposit" ? (
                                    <ArrowUpRight className="h-4 w-4 text-success" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className="text-muted-foreground">
                                    {mov.description}
                                  </span>
                                </div>
                                <span
                                  className={
                                    mov.type === "deposit"
                                      ? "text-success"
                                      : "text-destructive"
                                  }
                                >
                                  {mov.type === "deposit" ? "+" : "-"}
                                  {formatCurrency(mov.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
