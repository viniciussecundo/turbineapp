import React, { useState, useEffect } from "react";
import { validateEmail, validatePhone } from "@/lib/validation";
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Instagram,
  Globe,
  Users,
  ArrowRight,
  Target,
  UserPlus,
  CheckCircle,
  Trash2,
  AlertTriangle,
  UserCheck,
  Link2,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  Calendar,
  MessageSquare,
  TrendingUp,
  Image,
  Wallet,
  Bell,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData, LeadStatus, LeadOrigin, Lead } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Can } from "@/components/auth/Can";

const statusConfig: Record<
  LeadStatus,
  { label: string; className: string; bgClass: string }
> = {
  novo: {
    label: "Novo",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    bgClass: "bg-blue-500",
  },
  contato: {
    label: "Contato",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    bgClass: "bg-yellow-500",
  },
  proposta: {
    label: "Proposta",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    bgClass: "bg-purple-500",
  },
  fechado: {
    label: "Fechado",
    className: "bg-success/20 text-success border-success/30",
    bgClass: "bg-success",
  },
};

const originConfig: Record<LeadOrigin, { label: string; icon: typeof Globe }> =
  {
    site: { label: "Site", icon: Globe },
    instagram: { label: "Instagram", icon: Instagram },
    facebook: { label: "Facebook", icon: Users },
    indicacao: { label: "Indicação", icon: Users },
    google: { label: "Google", icon: Globe },
    outro: { label: "Outro", icon: Globe },
  };

export default function Leads() {
  const navigate = useNavigate();
  const {
    leads,
    addLead,
    updateLeadStatus,
    deleteLead,
    convertLeadToClient,
    getClientByLeadId,
    markLeadAsViewed,
    markAllLeadsAsViewed,
    getUnviewedLeadsCount,
    addActivity,
  } = useData();
  const { tenantId } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Verificar se há leads novos não visualizados
  const unviewedCount = getUnviewedLeadsCount();
  const unviewedLeads = leads.filter(
    (lead) => lead.selfRegistered && !lead.viewed,
  );

  // Mostrar notificação quando houver leads não visualizados
  useEffect(() => {
    if (unviewedCount > 0) {
      setShowNotification(true);
    }
  }, [unviewedCount]);

  const handleMarkAllAsViewed = () => {
    markAllLeadsAsViewed();
    setShowNotification(false);
    toast.success("Todos os leads foram marcados como visualizados");
  };

  const handleLeadClick = (lead: Lead) => {
    // Marcar como visualizado ao expandir
    if (lead.selfRegistered && !lead.viewed) {
      markLeadAsViewed(lead.id);
    }
    setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    origin: "site" as LeadOrigin,
    value: "",
    notes: "",
    followers: "",
    posts: "",
    monthlyBudget: "",
  });
  const [convertFormData, setConvertFormData] = useState({
    responsible: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    addLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      origin: formData.origin,
      value: formData.value ? parseFloat(formData.value) : undefined,
      notes: formData.notes || undefined,
      followers: formData.followers ? parseInt(formData.followers) : undefined,
      posts: formData.posts ? parseInt(formData.posts) : undefined,
      monthlyBudget: formData.monthlyBudget
        ? parseFloat(formData.monthlyBudget)
        : undefined,
    });

    // Criar atividade de novo lead
    addActivity({
      type: "lead",
      title: "Lead Adicionado",
      description: `${formData.name}${formData.company ? ` - ${formData.company}` : ""}`,
    });

    setIsDialogOpen(false);
    setFormErrors({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      origin: "site",
      value: "",
      notes: "",
      followers: "",
      posts: "",
      monthlyBudget: "",
    });
  };

  const handleOpenConvertDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertFormData({
      responsible: lead.name,
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
    });
    setIsConvertDialogOpen(true);
  };

  const handleConvertToClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    convertLeadToClient(selectedLead.id, {
      responsible: convertFormData.responsible,
      socialMedia: {
        instagram: convertFormData.instagram || undefined,
        facebook: convertFormData.facebook || undefined,
        linkedin: convertFormData.linkedin || undefined,
        twitter: convertFormData.twitter || undefined,
      },
    });

    // Criar atividade de conversão
    addActivity({
      type: "client",
      title: "Lead Convertido!",
      description: `${selectedLead.name} agora é cliente`,
    });

    setIsConvertDialogOpen(false);
    setSelectedLead(null);
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leadToDelete) {
      const success = await deleteLead(leadToDelete.id);
      if (!success) {
        toast.error(
          "Não foi possível excluir o lead. Verifique suas permissões.",
        );
      }
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  // Contagem por status para o funil
  const statusCounts = {
    novo: leads.filter((l) => l.status === "novo").length,
    contato: leads.filter((l) => l.status === "contato").length,
    proposta: leads.filter((l) => l.status === "proposta").length,
    fechado: leads.filter((l) => l.status === "fechado").length,
  };

  const totalValue = leads
    .filter((l) => l.status === "fechado")
    .reduce((acc, l) => acc + (l.value || 0), 0);

  return (
    <div className="space-y-8">
      {/* Banner de Notificação de Novos Leads */}
      {showNotification && unviewedCount > 0 && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-4">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
                    <Bell className="h-6 w-6 text-primary animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {unviewedCount}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      {unviewedCount === 1
                        ? "Novo lead cadastrado!"
                        : `${unviewedCount} novos leads cadastrados!`}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {unviewedCount === 1
                      ? "Um potencial cliente se cadastrou através do link público"
                      : "Potenciais clientes se cadastraram através do link público"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleMarkAllAsViewed}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Marcar como vistos
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNotification(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu funil de vendas e acompanhe seus leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => {
              const url = `${window.location.origin}/cadastro?t=${tenantId}`;
              navigator.clipboard.writeText(url);
              toast.success("Link copiado para a área de transferência!");
            }}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Link Compartilhável
          </Button>
          <Can permission="leads.create">
            <Button
              className="gradient-primary text-white shadow-lg glow-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Lead
            </Button>
          </Can>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as LeadStatus[]).map((status, index) => {
          const config = statusConfig[status];
          const count = statusCounts[status];
          return (
            <div
              key={status}
              className="glass rounded-xl p-4 card-shadow hover-elevate cursor-pointer"
              onClick={() =>
                setStatusFilter(status === statusFilter ? "all" : status)
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-3 w-3 rounded-full ${config.bgClass}`} />
                {index < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <p className="text-sm text-muted-foreground">{config.label}</p>
              {status === statusFilter && (
                <Badge variant="outline" className="mt-2 text-xs">
                  Filtrado
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats resumo */}
      <div className="glass rounded-xl p-4 card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
              <p className="text-xl font-bold text-foreground">
                {leads.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auto-cadastros</p>
              <p className="text-xl font-bold text-foreground">
                {leads.filter((l) => l.selfRegistered).length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Fechado</p>
              <p className="text-xl font-bold text-foreground">
                R$ {totalValue.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-xl font-bold text-foreground">
                {leads.length > 0
                  ? ((statusCounts.fechado / leads.length) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Leads */}
      <div className="glass rounded-xl p-6 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar leads..."
              className="pl-9 bg-sidebar-accent/50 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as LeadStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-sidebar-accent/50 border-white/10">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="contato">Contato</SelectItem>
              <SelectItem value="proposta">Proposta</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Lead
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Contato
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Origem
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Valor
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const status = statusConfig[lead.status];
                const origin = originConfig[lead.origin];
                const OriginIcon = origin.icon;
                const isConverted = !!lead.convertedToClientId;
                const linkedClient = getClientByLeadId(lead.id);
                const isExpanded = expandedLeadId === lead.id;
                const isUnviewed = lead.selfRegistered && !lead.viewed;

                return (
                  <React.Fragment key={lead.id}>
                    <tr
                      className={`border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors cursor-pointer ${isExpanded ? "bg-sidebar-accent/20" : ""} ${isUnviewed ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
                      onClick={() => handleLeadClick(lead)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {/* Indicador de novo lead */}
                          {isUnviewed ? (
                            <div className="relative">
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                              <div className="absolute inset-0 h-2 w-2 rounded-full bg-primary animate-ping" />
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {lead.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {lead.name}
                              </p>
                              {isUnviewed && (
                                <Badge className="text-xs bg-primary text-white border-0 animate-pulse">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  NOVO
                                </Badge>
                              )}
                              {lead.selfRegistered && !isUnviewed && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                              {isConverted && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-success/10 text-success border-success/30"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Cliente
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {lead.company || lead.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <OriginIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {origin.label}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            updateLeadStatus(lead.id, value as LeadStatus)
                          }
                          disabled={isConverted}
                        >
                          <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0">
                            <Badge
                              variant="outline"
                              className={status.className}
                            >
                              {status.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="contato">Contato</SelectItem>
                            <SelectItem value="proposta">Proposta</SelectItem>
                            <SelectItem value="fechado">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-4 text-right hidden sm:table-cell">
                        <span className="font-medium text-foreground">
                          {lead.value
                            ? `R$ ${lead.value.toLocaleString("pt-BR")}`
                            : "-"}
                        </span>
                      </td>
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!isConverted && (
                              <Can permission="leads.edit">
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenConvertDialog(lead)
                                    }
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Converter em Cliente
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              </Can>
                            )}
                            {isConverted && linkedClient && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => navigate("/clientes")}
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Ver Cliente
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar E-mail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Ligar
                            </DropdownMenuItem>
                            <Can permission="leads.delete">
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => handleDeleteClick(lead)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir Lead
                                </DropdownMenuItem>
                              </>
                            </Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>

                    {/* Linha Expandida */}
                    {isExpanded && (
                      <tr className="bg-sidebar-accent/10">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="ml-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Dados de Tráfego */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Dados de Tráfego
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  Seguidores:{" "}
                                  <span className="text-foreground font-medium">
                                    {lead.followers
                                      ? lead.followers.toLocaleString("pt-BR")
                                      : "Não informado"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Image className="h-3 w-3" />
                                  Posts:{" "}
                                  <span className="text-foreground font-medium">
                                    {lead.posts
                                      ? lead.posts.toLocaleString("pt-BR")
                                      : "Não informado"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Wallet className="h-3 w-3" />
                                  Orçamento/Mês:{" "}
                                  <span className="text-foreground font-medium">
                                    {lead.monthlyBudget
                                      ? `R$ ${lead.monthlyBudget.toLocaleString("pt-BR")}`
                                      : "Não informado"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Observações */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                Observações
                              </h4>
                              <div className="text-sm">
                                {lead.notes ? (
                                  <p className="text-muted-foreground bg-sidebar-accent/30 p-3 rounded-lg">
                                    {lead.notes}
                                  </p>
                                ) : (
                                  <p className="text-muted-foreground/60 italic">
                                    Nenhuma observação registrada
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status / Conversão */}
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Informações
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Criado em:{" "}
                                  <span className="text-foreground">
                                    {new Date(
                                      lead.createdAt,
                                    ).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                                {isConverted && linkedClient && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <Badge className="bg-success/20 text-success border-success/30">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Convertido em Cliente
                                    </Badge>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-primary p-0 h-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/clientes");
                                      }}
                                    >
                                      Ver cliente →
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Novo Lead */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>
              Cadastre um novo lead para acompanhar no funil
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nome do lead"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`bg-sidebar-accent/50 border-white/10 ${formErrors.name ? "border-red-500" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`bg-sidebar-accent/50 border-white/10 ${formErrors.email ? "border-red-500" : ""}`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-400">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`bg-sidebar-accent/50 border-white/10 ${formErrors.phone ? "border-red-500" : ""}`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-400">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Nome da empresa (opcional)"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="bg-sidebar-accent/50 border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origem *</Label>
                  <Select
                    value={formData.origin}
                    onValueChange={(value) =>
                      setFormData({ ...formData, origin: value as LeadOrigin })
                    }
                  >
                    <SelectTrigger className="bg-sidebar-accent/50 border-white/10">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site">Site</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Valor Estimado</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    placeholder="R$ 0,00"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10"
                  />
                </div>
              </div>

              {/* Dados para Gestão de Tráfego */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Dados para Gestão de Tráfego
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followers">Seguidores</Label>
                    <Input
                      id="followers"
                      name="followers"
                      type="number"
                      placeholder="Ex: 5000"
                      value={formData.followers}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="posts">Nº de Posts</Label>
                    <Input
                      id="posts"
                      name="posts"
                      type="number"
                      placeholder="Ex: 120"
                      value={formData.posts}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyBudget">Orçamento/Mês</Label>
                    <Input
                      id="monthlyBudget"
                      name="monthlyBudget"
                      type="number"
                      placeholder="R$ 0,00"
                      value={formData.monthlyBudget}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                Cadastrar Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Converter Lead em Cliente */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Converter Lead em Cliente</DialogTitle>
            <DialogDescription>
              {selectedLead && (
                <>
                  Converter <strong>{selectedLead.name}</strong> em cliente.
                  Complete os dados adicionais.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConvertToClient}>
            <div className="space-y-4 py-4">
              {/* Info do Lead */}
              {selectedLead && (
                <div className="bg-sidebar-accent/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Dados do Lead
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>{" "}
                      <span className="text-foreground">
                        {selectedLead.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Empresa:</span>{" "}
                      <span className="text-foreground">
                        {selectedLead.company || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      <span className="text-foreground">
                        {selectedLead.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor:</span>{" "}
                      <span className="text-foreground">
                        {selectedLead.value
                          ? `R$ ${selectedLead.value.toLocaleString("pt-BR")}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="responsible">
                  Responsável / Contato Principal
                </Label>
                <Input
                  id="responsible"
                  value={convertFormData.responsible}
                  onChange={(e) =>
                    setConvertFormData({
                      ...convertFormData,
                      responsible: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                  className="bg-sidebar-accent/50 border-white/10"
                />
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <p className="text-sm font-medium text-foreground">
                  Redes Sociais (opcional)
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagram"
                      className="flex items-center gap-2 text-sm"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={convertFormData.instagram}
                      onChange={(e) =>
                        setConvertFormData({
                          ...convertFormData,
                          instagram: e.target.value,
                        })
                      }
                      placeholder="@usuario"
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="facebook"
                      className="flex items-center gap-2 text-sm"
                    >
                      <Users className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={convertFormData.facebook}
                      onChange={(e) =>
                        setConvertFormData({
                          ...convertFormData,
                          facebook: e.target.value,
                        })
                      }
                      placeholder="facebook.com/..."
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedin"
                      className="flex items-center gap-2 text-sm"
                    >
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={convertFormData.linkedin}
                      onChange={(e) =>
                        setConvertFormData({
                          ...convertFormData,
                          linkedin: e.target.value,
                        })
                      }
                      placeholder="linkedin.com/..."
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="twitter"
                      className="flex items-center gap-2 text-sm"
                    >
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      value={convertFormData.twitter}
                      onChange={(e) =>
                        setConvertFormData({
                          ...convertFormData,
                          twitter: e.target.value,
                        })
                      }
                      placeholder="@usuario"
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConvertDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                <UserPlus className="h-4 w-4 mr-2" />
                Converter em Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Delete */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Excluir Lead
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {leadToDelete && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Tem certeza que deseja excluir o lead{" "}
                <span className="font-semibold text-foreground">
                  {leadToDelete.name}
                </span>
                ?
              </p>

              {leadToDelete.convertedToClientId && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Este lead foi convertido em cliente. A referência será
                    removida do cliente associado.
                  </p>
                </div>
              )}

              <div className="bg-sidebar-accent/50 rounded-lg p-3 space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {leadToDelete.email}
                </p>
                {leadToDelete.company && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Empresa:</span>{" "}
                    {leadToDelete.company}
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {statusConfig[leadToDelete.status].label}
                </p>
                {leadToDelete.value && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Valor:</span> R${" "}
                    {leadToDelete.value.toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setLeadToDelete(null);
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
