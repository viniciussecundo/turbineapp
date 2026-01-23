import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Download,
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import {
  Budget,
  BudgetItem,
  BudgetStatus,
  BUDGET_STATUS_CONFIG,
} from "@/contexts/DataContext";
import { generateBudgetPDF } from "@/lib/generateBudgetPDF";
import { toast } from "@/hooks/use-toast";

export default function Orcamentos() {
  const {
    budgets,
    clients,
    addBudget,
    updateBudget,
    deleteBudget,
    updateBudgetStatus,
    transactions,
    getWalletByClientId,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "all">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [formErrors, setFormErrors] = useState<{
    clientId?: string;
    title?: string;
    items?: string;
    validUntil?: string;
  }>({});

  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    validUntil: "",
    notes: "",
    items: [
      { id: 1, description: "", quantity: 1, unitPrice: 0 },
    ] as BudgetItem[],
  });

  // Filtros
  const filteredBudgets = budgets.filter((budget) => {
    const client = clients.find((c) => c.id === budget.clientId);
    const matchesSearch =
      budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: budgets.length,
    draft: budgets.filter((b) => b.status === "draft").length,
    sent: budgets.filter((b) => b.status === "sent").length,
    approved: budgets.filter((b) => b.status === "approved").length,
    totalApprovedValue: budgets
      .filter((b) => b.status === "approved")
      .reduce((sum, b) => sum + b.totalValue, 0),
  };

  // Validação
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!formData.clientId) {
      errors.clientId = "Selecione um cliente";
    }
    if (!formData.title.trim()) {
      errors.title = "Título é obrigatório";
    }
    if (!formData.validUntil) {
      errors.validUntil = "Data de validade é obrigatória";
    }
    if (
      formData.items.length === 0 ||
      !formData.items.some((item) => item.description.trim())
    ) {
      errors.items = "Adicione pelo menos um item";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calcular total
  const calculateTotal = (items: BudgetItem[]): number => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  // Handlers
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now(),
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (itemId: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((item) => item.id !== itemId),
      });
    }
  };

  const handleItemChange = (
    itemId: number,
    field: keyof BudgetItem,
    value: string | number,
  ) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    });
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      title: "",
      description: "",
      validUntil: "",
      notes: "",
      items: [{ id: 1, description: "", quantity: 1, unitPrice: 0 }],
    });
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const validItems = formData.items.filter((item) => item.description.trim());

    addBudget({
      clientId: parseInt(formData.clientId),
      title: formData.title,
      description: formData.description || undefined,
      items: validItems,
      totalValue: calculateTotal(validItems),
      status: "draft",
      validUntil: formData.validUntil,
      notes: formData.notes || undefined,
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget || !validateForm()) return;

    const validItems = formData.items.filter((item) => item.description.trim());

    updateBudget(selectedBudget.id, {
      clientId: parseInt(formData.clientId),
      title: formData.title,
      description: formData.description || undefined,
      items: validItems,
      totalValue: calculateTotal(validItems),
      validUntil: formData.validUntil,
      notes: formData.notes || undefined,
    });

    setIsEditDialogOpen(false);
    setSelectedBudget(null);
    resetForm();
  };

  const handleEditClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setFormData({
      clientId: String(budget.clientId),
      title: budget.title,
      description: budget.description || "",
      validUntil: budget.validUntil,
      notes: budget.notes || "",
      items:
        budget.items.length > 0
          ? budget.items
          : [{ id: 1, description: "", quantity: 1, unitPrice: 0 }],
    });
    setIsEditDialogOpen(true);
  };

  const handleViewClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBudget) {
      deleteBudget(selectedBudget.id);
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
    }
  };

  const handleSendBudget = (budget: Budget) => {
    updateBudgetStatus(budget.id, "sent");
  };

  const handleApproveBudget = (budget: Budget) => {
    updateBudgetStatus(budget.id, "approved");
    
    // Verificar se é orçamento de tráfego para mensagem personalizada
    const isTrafficBudget = 
      budget.title.toLowerCase().includes("tráfego") ||
      budget.title.toLowerCase().includes("traffic") ||
      budget.title.toLowerCase().includes("ads") ||
      budget.title.toLowerCase().includes("meta") ||
      budget.title.toLowerCase().includes("google") ||
      budget.description?.toLowerCase().includes("tráfego") ||
      budget.description?.toLowerCase().includes("gestão de tráfego");
    
    const client = clients.find(c => c.id === budget.clientId);
    
    toast({
      title: "✅ Orçamento Aprovado!",
      description: isTrafficBudget 
        ? `Receita de R$ ${budget.totalValue.toLocaleString("pt-BR")} criada e cartão virtual de ${client?.name || "cliente"} atualizado.`
        : `Receita de R$ ${budget.totalValue.toLocaleString("pt-BR")} criada automaticamente.`,
    });
  };

  const handleRejectBudget = (budget: Budget) => {
    updateBudgetStatus(budget.id, "rejected");
  };

  const handleExportPDF = (budget: Budget) => {
    const client = clients.find((c) => c.id === budget.clientId);
    if (client) {
      generateBudgetPDF({ budget, client });
    }
  };

  const getClientName = (clientId: number): string => {
    return (
      clients.find((c) => c.id === clientId)?.name || "Cliente não encontrado"
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Orçamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie propostas comerciais
          </p>
        </div>
        <Button
          className="gradient-primary text-white shadow-lg glow-primary"
          onClick={() => setIsDialogOpen(true)}
          disabled={clients.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Aviso se não há clientes */}
      {clients.length === 0 && (
        <div className="glass rounded-xl p-6 card-shadow border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-400">
                Nenhum cliente cadastrado
              </p>
              <p className="text-sm text-muted-foreground">
                Cadastre pelo menos um cliente antes de criar orçamentos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.draft}
              </p>
              <p className="text-xs text-muted-foreground">Rascunhos</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.sent}</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {stats.totalApprovedValue.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.approved} aprovados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="glass rounded-xl p-6 card-shadow">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orçamentos..."
              className="pl-9 bg-sidebar-accent/50 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as BudgetStatus | "all")}
          >
            <SelectTrigger className="w-[150px] bg-sidebar-accent/50 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Recusado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Orçamentos */}
        <div className="grid gap-4">
          {filteredBudgets.map((budget) => {
            const status = BUDGET_STATUS_CONFIG[budget.status];
            const client = clients.find((c) => c.id === budget.clientId);

            return (
              <div
                key={budget.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors border border-white/5"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">
                      {budget.code}
                    </span>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground">
                    {budget.title}
                  </h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {client?.name || "Cliente não encontrado"}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <p className="text-lg font-semibold text-foreground">
                    R$ {budget.totalValue.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Válido até {formatDate(budget.validUntil)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Visualizar"
                    onClick={() => handleViewClick(budget)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Exportar PDF"
                    onClick={() => handleExportPDF(budget)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {budget.status === "draft" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar"
                        onClick={() => handleEditClick(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        title="Enviar"
                        onClick={() => handleSendBudget(budget)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {budget.status === "sent" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success"
                        title="Aprovar"
                        onClick={() => handleApproveBudget(budget)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Recusar"
                        onClick={() => handleRejectBudget(budget)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    title="Excluir"
                    onClick={() => handleDeleteClick(budget)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {filteredBudgets.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Nenhum orçamento encontrado
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {budgets.length === 0
                  ? "Crie seu primeiro orçamento"
                  : "Tente ajustar os filtros"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Novo Orçamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>
              Crie uma proposta comercial para seu cliente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, clientId: v })
                  }
                >
                  <SelectTrigger
                    className={`bg-sidebar-accent/50 border-white/10 ${
                      formErrors.clientId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.clientId && (
                  <p className="text-xs text-red-400">{formErrors.clientId}</p>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título do Orçamento *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Desenvolvimento de E-commerce"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`bg-sidebar-accent/50 border-white/10 ${
                    formErrors.title ? "border-red-500" : ""
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-400">{formErrors.title}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente o escopo do projeto..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-sidebar-accent/50 border-white/10 min-h-[80px]"
                />
              </div>

              {/* Validade */}
              <div className="space-y-2">
                <Label htmlFor="validUntil">Válido até *</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className={`bg-sidebar-accent/50 border-white/10 ${
                    formErrors.validUntil ? "border-red-500" : ""
                  }`}
                />
                {formErrors.validUntil && (
                  <p className="text-xs text-red-400">
                    {formErrors.validUntil}
                  </p>
                )}
              </div>

              {/* Itens */}
              <div className="space-y-3 pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between">
                  <Label>Itens do Orçamento *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                {formErrors.items && (
                  <p className="text-xs text-red-400">{formErrors.items}</p>
                )}

                {formData.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-start"
                  >
                    <div className="col-span-6">
                      <Input
                        placeholder="Descrição do item"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Valor"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex justify-end pt-2 border-t border-sidebar-border">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">
                      R${" "}
                      {calculateTotal(formData.items).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Condições de pagamento, prazos, etc..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="bg-sidebar-accent/50 border-white/10 min-h-[60px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                Criar Orçamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedBudget(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Orçamento
            </DialogTitle>
            <DialogDescription>
              {selectedBudget?.code} - Atualize as informações do orçamento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="edit-clientId">Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, clientId: v })
                  }
                >
                  <SelectTrigger
                    className={`bg-sidebar-accent/50 border-white/10 ${
                      formErrors.clientId ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.clientId && (
                  <p className="text-xs text-red-400">{formErrors.clientId}</p>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título do Orçamento *</Label>
                <Input
                  id="edit-title"
                  placeholder="Ex: Desenvolvimento de E-commerce"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`bg-sidebar-accent/50 border-white/10 ${
                    formErrors.title ? "border-red-500" : ""
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-red-400">{formErrors.title}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Descreva brevemente o escopo do projeto..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-sidebar-accent/50 border-white/10 min-h-[80px]"
                />
              </div>

              {/* Validade */}
              <div className="space-y-2">
                <Label htmlFor="edit-validUntil">Válido até *</Label>
                <Input
                  id="edit-validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className={`bg-sidebar-accent/50 border-white/10 ${
                    formErrors.validUntil ? "border-red-500" : ""
                  }`}
                />
                {formErrors.validUntil && (
                  <p className="text-xs text-red-400">
                    {formErrors.validUntil}
                  </p>
                )}
              </div>

              {/* Itens */}
              <div className="space-y-3 pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between">
                  <Label>Itens do Orçamento *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Item
                  </Button>
                </div>

                {formErrors.items && (
                  <p className="text-xs text-red-400">{formErrors.items}</p>
                )}

                {formData.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-start"
                  >
                    <div className="col-span-6">
                      <Input
                        placeholder="Descrição do item"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qtd"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Valor"
                        value={item.unitPrice || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="bg-sidebar-accent/50 border-white/10 text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2 border-t border-sidebar-border">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">
                      R${" "}
                      {calculateTotal(formData.items).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Observações</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Condições de pagamento, prazos, etc..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="bg-sidebar-accent/50 border-white/10 min-h-[60px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedBudget(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedBudget?.code}
            </DialogTitle>
            <DialogDescription>{selectedBudget?.title}</DialogDescription>
          </DialogHeader>

          {selectedBudget && (
            <div className="space-y-6 py-4">
              {/* Status e Datas */}
              <div className="flex flex-wrap gap-4">
                <Badge
                  variant="outline"
                  className={
                    BUDGET_STATUS_CONFIG[selectedBudget.status].className
                  }
                >
                  {BUDGET_STATUS_CONFIG[selectedBudget.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Criado em: {formatDate(selectedBudget.createdAt)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Válido até: {formatDate(selectedBudget.validUntil)}
                </span>
              </div>

              {/* Cliente */}
              <div className="bg-sidebar-accent/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium">
                  {getClientName(selectedBudget.clientId)}
                </p>
              </div>

              {/* Descrição */}
              {selectedBudget.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Descrição</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBudget.description}
                  </p>
                </div>
              )}

              {/* Itens */}
              <div>
                <p className="text-sm font-medium mb-3">Itens</p>
                <div className="space-y-2">
                  {selectedBudget.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-sidebar-accent/30 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x R${" "}
                          {item.unitPrice.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <p className="font-semibold">
                        R${" "}
                        {(item.quantity * item.unitPrice).toLocaleString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-sidebar-border">
                  <p className="font-bold text-lg">Total</p>
                  <p className="font-bold text-xl text-primary">
                    R$ {selectedBudget.totalValue.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              {/* Observações */}
              {selectedBudget.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Observações</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBudget.notes}
                  </p>
                </div>
              )}

              {/* Informações Financeiras (quando aprovado) */}
              {selectedBudget.status === "approved" && (
                <div className="border-t border-sidebar-border pt-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    Informações Financeiras
                  </p>
                  
                  {/* Transação vinculada */}
                  {(() => {
                    const linkedTransaction = transactions.find(
                      (t) => t.budgetId === selectedBudget.id
                    );
                    const wallet = getWalletByClientId(selectedBudget.clientId);
                    const walletMovement = wallet?.movements.find(
                      (m) => m.description.includes(selectedBudget.code)
                    );

                    return (
                      <div className="space-y-3">
                        {linkedTransaction && (
                          <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-success" />
                                <span className="text-sm font-medium text-success">
                                  Receita Registrada
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  linkedTransaction.status === "completed"
                                    ? "border-success/30 text-success"
                                    : "border-warning/30 text-warning"
                                }
                              >
                                {linkedTransaction.status === "completed"
                                  ? "Pago"
                                  : "Pendente"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {linkedTransaction.description}
                            </p>
                            <p className="text-sm font-semibold text-success mt-1">
                              R$ {linkedTransaction.value.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        )}

                        {walletMovement && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">
                                Carteira Virtual Atualizada
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {walletMovement.description}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              + R$ {walletMovement.value.toLocaleString("pt-BR")}
                            </p>
                            {wallet && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Saldo atual: R$ {wallet.balance.toLocaleString("pt-BR")}
                              </p>
                            )}
                          </div>
                        )}

                        {!linkedTransaction && !walletMovement && (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma informação financeira vinculada.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedBudget && handleExportPDF(selectedBudget)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="gradient-primary text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Excluir Orçamento
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {selectedBudget && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Tem certeza que deseja excluir o orçamento{" "}
                <span className="font-semibold text-foreground">
                  {selectedBudget.code}
                </span>
                ?
              </p>

              <div className="bg-sidebar-accent/50 rounded-lg p-3 space-y-1">
                <p className="text-sm">
                  <strong>Título:</strong> {selectedBudget.title}
                </p>
                <p className="text-sm">
                  <strong>Cliente:</strong>{" "}
                  {getClientName(selectedBudget.clientId)}
                </p>
                <p className="text-sm">
                  <strong>Valor:</strong> R${" "}
                  {selectedBudget.totalValue.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedBudget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Função auxiliar
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
