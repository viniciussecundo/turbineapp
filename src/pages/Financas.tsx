import { useState, useEffect } from "react";
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
  Check,
  Pencil,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
    updateTransaction,
    deleteTransaction,
    clients,
    wallets,
    getWalletByClientId,
    createWallet,
    addWalletMovement,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    addActivity,
  } = useData();

  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isWalletDetailOpen, setIsWalletDetailOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<
    (typeof wallets)[0] | null
  >(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<
    (typeof transactions)[0] | null
  >(null);
  const [editingTransaction, setEditingTransaction] = useState<number | null>(
    null,
  );
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    number | null
  >(null);
  const [transactionForm, setTransactionForm] = useState({
    type: "income" as TransactionType,
    description: "",
    value: "",
    category: "",
    clientId: "",
    notes: "",
  });
  const [editForm, setEditForm] = useState({
    description: "",
    value: "",
    category: "",
    clientId: "",
    notes: "",
    date: "",
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

    // Criar atividade de nova transação
    addActivity({
      type: "transaction",
      title:
        transactionForm.type === "income" ? "Nova Receita" : "Nova Despesa",
      description: `${transactionForm.description} - R$ ${parseFloat(transactionForm.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
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

  const handleEditTransaction = (tx: (typeof transactions)[0]) => {
    setEditingTransaction(tx.id);
    setEditForm({
      description: tx.description,
      value: tx.value.toString(),
      category: tx.category,
      clientId: tx.clientId?.toString() || "",
      notes: tx.notes || "",
      date: tx.date,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (
      !editingTransaction ||
      !editForm.description ||
      !editForm.value ||
      !editForm.category ||
      !editForm.date
    )
      return;

    updateTransaction(editingTransaction, {
      description: editForm.description,
      value: parseFloat(editForm.value),
      category: editForm.category,
      clientId: editForm.clientId ? parseInt(editForm.clientId) : undefined,
      notes: editForm.notes || undefined,
      date: editForm.date,
    });

    setIsEditOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteClick = (tx: (typeof transactions)[0]) => {
    setTransactionToDelete(tx);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setIsDeleteOpen(false);
      setTransactionToDelete(null);
      // Fechar detalhes expandidos se a transação deletada estava expandida
      if (expandedTransactionId === transactionToDelete.id) {
        setExpandedTransactionId(null);
      }
    }
  };

  const handleOpenWalletDetail = (wallet: (typeof wallets)[0]) => {
    setSelectedWallet(wallet);
    setWalletForm({
      clientId: wallet.clientId.toString(),
      type: "deposit",
      value: "",
      description: "",
    });
    setIsWalletDetailOpen(true);
  };

  const handleWalletDetailMovement = () => {
    if (!selectedWallet || !walletForm.value || !walletForm.description) return;

    addWalletMovement(selectedWallet.id, {
      type: walletForm.type,
      value: parseFloat(walletForm.value),
      date: new Date().toISOString().split("T")[0],
      description: walletForm.description,
    });

    // Limpar apenas os campos de valor e descrição
    setWalletForm({
      ...walletForm,
      value: "",
      description: "",
    });
  };

  // Manter selectedWallet sincronizado quando wallets mudar
  useEffect(() => {
    if (selectedWallet) {
      const updatedWallet = wallets.find((w) => w.id === selectedWallet.id);
      if (updatedWallet) {
        setSelectedWallet(updatedWallet);
      }
    }
  }, [wallets]);

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

      {/* Modal de Edição de Transação */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Ex: Pagamento de serviço"
                className="bg-secondary/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={editForm.value}
                onChange={(e) =>
                  setEditForm({ ...editForm, value: e.target.value })
                }
                placeholder="0,00"
                className="bg-secondary/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={editForm.category}
                onValueChange={(v) => setEditForm({ ...editForm, category: v })}
              >
                <SelectTrigger className="bg-secondary/50 border-white/10">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES]
                    .filter((cat, index, self) => self.indexOf(cat) === index)
                    .map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vincular a Cliente (opcional)</Label>
              <Select
                value={editForm.clientId || "none"}
                onValueChange={(v) =>
                  setEditForm({ ...editForm, clientId: v === "none" ? "" : v })
                }
              >
                <SelectTrigger className="bg-secondary/50 border-white/10">
                  <SelectValue placeholder="Nenhum cliente selecionado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data do Lançamento</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                className="bg-secondary/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                placeholder="Detalhes adicionais..."
                className="bg-secondary/50 border-white/10"
              />
            </div>
            <Button
              onClick={handleSaveEdit}
              className="w-full gradient-primary text-white"
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Excluir Transação
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {transactionToDelete && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Você está prestes a excluir a seguinte transação:
                </p>
                <div className="rounded-lg bg-secondary/50 p-3 space-y-2">
                  <p className="font-medium text-foreground">
                    {transactionToDelete.description}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      transactionToDelete.type === "income"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transactionToDelete.type === "income" ? "+" : "-"}
                    {formatCurrency(transactionToDelete.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transactionToDelete.date)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Carteira */}
      <Dialog open={isWalletOpen} onOpenChange={setIsWalletOpen}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Nova Carteira Virtual
            </DialogTitle>
            <DialogDescription>
              Selecione um cliente e faça a primeira movimentação para criar uma
              carteira virtual.
            </DialogDescription>
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
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {activeClients
                    .filter((c) => !getWalletByClientId(c.id))
                    .map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  {activeClients.filter((c) => !getWalletByClientId(c.id))
                    .length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      Todos os clientes ativos já possuem carteira
                    </div>
                  )}
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
                    <span className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-success" />
                      Entrada (Depósito)
                    </span>
                  </SelectItem>
                  <SelectItem value="withdrawal">
                    <span className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                      Saída (Retirada)
                    </span>
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
                  setWalletForm({ ...walletForm, description: e.target.value })
                }
                placeholder="Ex: Aporte inicial para campanhas"
                className="bg-secondary/50 border-white/10"
              />
            </div>
            <Button
              onClick={handleWalletMovement}
              disabled={
                !walletForm.clientId ||
                !walletForm.value ||
                !walletForm.description
              }
              className={`w-full ${walletForm.type === "deposit" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"} text-white`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Carteira
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

            <div className="space-y-2">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação registrada
                </p>
              ) : (
                transactions.slice(0, 10).map((tx) => {
                  const client = tx.clientId
                    ? clients.find((c) => c.id === tx.clientId)
                    : null;
                  const isExpanded = expandedTransactionId === tx.id;
                  return (
                    <div
                      key={tx.id}
                      className="rounded-lg border border-white/5 overflow-hidden"
                    >
                      {/* Linha principal - clicável para expandir */}
                      <div
                        className={`flex items-center gap-4 p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer ${isExpanded ? "bg-sidebar-accent/30" : ""}`}
                        onClick={() =>
                          setExpandedTransactionId(isExpanded ? null : tx.id)
                        }
                      >
                        <div className="text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
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
                        <div className="flex items-center gap-3">
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
                              {tx.status === "completed"
                                ? "Concluído"
                                : "Pendente"}
                            </Badge>
                          </div>
                          {tx.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:bg-success/10"
                              title="Confirmar Pagamento"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTransaction(tx.id, {
                                  status: "completed",
                                });
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            title="Editar Transação"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTransaction(tx);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Excluir Transação"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(tx);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Detalhes expandidos */}
                      {isExpanded && (
                        <div className="border-t border-white/5 bg-sidebar-accent/20 p-4">
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Data do Lançamento
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {formatDate(tx.date)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Tipo
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {tx.type === "income"
                                  ? "Entrada (Receita)"
                                  : "Saída (Despesa)"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Categoria
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {tx.category}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Status
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {tx.status === "completed"
                                  ? "Concluído"
                                  : "Pendente"}
                              </p>
                            </div>
                            {client && (
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Cliente Vinculado
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {client.name}
                                </p>
                              </div>
                            )}
                            {tx.notes && (
                              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Observações
                                </p>
                                <p className="text-sm text-foreground bg-secondary/30 rounded-md p-2">
                                  {tx.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  Carteiras Virtuais dos Clientes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clique em um card para gerenciar a carteira
                </p>
              </div>
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => setIsWalletOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Carteira
              </Button>
            </div>

            {wallets.length === 0 ? (
              <div className="glass rounded-xl p-12 card-shadow text-center">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma carteira virtual criada.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione uma movimentação para um cliente para criar uma
                  carteira.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wallets.map((wallet) => {
                  const client = clients.find((c) => c.id === wallet.clientId);
                  if (!client) return null;

                  const totalDeposits = wallet.movements
                    .filter((m) => m.type === "deposit")
                    .reduce((sum, m) => sum + m.value, 0);
                  const totalWithdrawals = wallet.movements
                    .filter((m) => m.type === "withdrawal")
                    .reduce((sum, m) => sum + m.value, 0);

                  return (
                    <div
                      key={wallet.id}
                      onClick={() => handleOpenWalletDetail(wallet)}
                      className="group relative p-5 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-white/10 hover:border-primary/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                    >
                      {/* Badge de status */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant="outline"
                          className={
                            wallet.balance > 0
                              ? "border-success/30 text-success"
                              : "border-warning/30 text-warning"
                          }
                        >
                          {wallet.balance > 0 ? "Ativa" : "Sem saldo"}
                        </Badge>
                      </div>

                      {/* Avatar e nome */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                          <span className="text-lg font-bold text-primary">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {client.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {wallet.movements.length} movimentações
                          </p>
                        </div>
                      </div>

                      {/* Saldo principal */}
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-1">
                          Saldo Disponível
                        </p>
                        <p
                          className={`text-2xl font-bold ${wallet.balance >= 0 ? "text-foreground" : "text-destructive"}`}
                        >
                          {formatCurrency(wallet.balance)}
                        </p>
                      </div>

                      {/* Mini stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-success" />
                            Entradas
                          </p>
                          <p className="text-sm font-medium text-success">
                            {formatCurrency(totalDeposits)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3 text-destructive" />
                            Saídas
                          </p>
                          <p className="text-sm font-medium text-destructive">
                            {formatCurrency(totalWithdrawals)}
                          </p>
                        </div>
                      </div>

                      {/* Indicador de clique */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes da Carteira */}
      <Dialog open={isWalletDetailOpen} onOpenChange={setIsWalletDetailOpen}>
        <DialogContent className="max-w-2xl glass border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              {selectedWallet &&
                clients.find((c) => c.id === selectedWallet.clientId)?.name}
            </DialogTitle>
            <DialogDescription>
              Gerencie a carteira virtual deste cliente
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-6 mt-4">
              {/* Saldo e estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Saldo Atual
                  </p>
                  <p
                    className={`text-xl font-bold ${selectedWallet.balance >= 0 ? "text-foreground" : "text-destructive"}`}
                  >
                    {formatCurrency(selectedWallet.balance)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-success/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Entradas
                  </p>
                  <p className="text-xl font-bold text-success">
                    {formatCurrency(
                      selectedWallet.movements
                        .filter((m) => m.type === "deposit")
                        .reduce((sum, m) => sum + m.value, 0),
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Saídas
                  </p>
                  <p className="text-xl font-bold text-destructive">
                    {formatCurrency(
                      selectedWallet.movements
                        .filter((m) => m.type === "withdrawal")
                        .reduce((sum, m) => sum + m.value, 0),
                    )}
                  </p>
                </div>
              </div>

              {/* Formulário de nova movimentação */}
              <div className="p-4 rounded-lg bg-secondary/20 border border-white/5">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Movimentação
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
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
                          <span className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-success" />
                            Depósito (Entrada)
                          </span>
                        </SelectItem>
                        <SelectItem value="withdrawal">
                          <span className="flex items-center gap-2">
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                            Saque/Gasto (Saída)
                          </span>
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
                  <div className="space-y-2 sm:col-span-2">
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
                  <div className="sm:col-span-2">
                    <Button
                      onClick={handleWalletDetailMovement}
                      className={`w-full ${walletForm.type === "deposit" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"} text-white`}
                    >
                      {walletForm.type === "deposit" ? (
                        <>
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Registrar Entrada
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="mr-2 h-4 w-4" />
                          Registrar Saída
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Histórico de movimentações */}
              <div>
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Histórico de Movimentações
                </h4>
                {selectedWallet.movements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    Nenhuma movimentação registrada
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                    {selectedWallet.movements.map((mov) => (
                      <div
                        key={mov.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              mov.type === "deposit"
                                ? "bg-success/10"
                                : "bg-destructive/10"
                            }`}
                          >
                            {mov.type === "deposit" ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {mov.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(mov.date)}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-semibold ${
                            mov.type === "deposit"
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {mov.type === "deposit" ? "+" : "-"}
                          {formatCurrency(mov.value)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
