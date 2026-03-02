import React, { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  ArrowUpRight,
  Target,
  Trash2,
  AlertTriangle,
  Pencil,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  FolderOpen,
  Star,
  UserCircle,
  FileText,
  TrendingUp,
  Image,
  Wallet,
  MessageSquare,
  Calendar,
  FileDown,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  useData,
  Client,
  ClientStatus,
  ClientGoal,
  CLIENT_GOALS,
  CLIENT_SEGMENTS,
} from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import {
  generateClientPDF,
  generateBatchClientPDF,
} from "@/lib/generateClientPDF";
import { Can } from "@/components/auth/Can";

const statusConfig: Record<ClientStatus, { label: string; className: string }> =
  {
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

const originLabels: Record<string, string> = {
  site: "Site",
  instagram: "Instagram",
  facebook: "Facebook",
  indicacao: "Indicação",
  google: "Google",
  outro: "Outro",
};

export default function Clientes() {
  const navigate = useNavigate();
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getLeadByClientId,
    addActivity,
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [originFilter, setOriginFilter] = useState<"all" | "lead" | "direct">(
    "all",
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    responsible: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    // Análise de Perfil
    segment: "",
    targetAudience: "",
    mainGoal: "sales" as ClientGoal,
    overallScore: 5,
    analysisNotes: "",
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

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Telefone é obrigatório";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Telefone inválido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Filtro de clientes
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.responsible?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    const matchesOrigin =
      originFilter === "all" ||
      (originFilter === "lead" && client.leadId) ||
      (originFilter === "direct" && !client.leadId);

    return matchesSearch && matchesStatus && matchesOrigin;
  });

  // Estatísticas
  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    fromLeads: clients.filter((c) => c.leadId).length,
    totalValue: clients.reduce((sum, c) => sum + c.value, 0),
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    addClient({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: "active",
      projects: 0,
      value: 0,
      avatar: "",
      responsible: formData.responsible || undefined,
      socialMedia: {
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
      },
      profileAnalysis: formData.segment
        ? {
            segment: formData.segment,
            targetAudience: formData.targetAudience,
            mainGoal: formData.mainGoal,
            overallScore: formData.overallScore,
            notes: formData.analysisNotes,
          }
        : undefined,
    });

    // Criar atividade de novo cliente
    addActivity({
      type: "client",
      title: "Novo Cliente",
      description: formData.name,
    });

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormErrors({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      responsible: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      twitter: "",
      segment: "",
      targetAudience: "",
      mainGoal: "sales",
      overallScore: 5,
      analysisNotes: "",
    });
  };

  const handleViewClient = (client: Client) => {
    setExpandedClientId(expandedClientId === client.id ? null : client.id);
  };

  const handleUpdateStatus = (clientId: number, status: ClientStatus) => {
    updateClient(clientId, { status });
  };

  const handleEditClick = (client: Client) => {
    setClientToEdit(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      responsible: client.responsible || "",
      instagram: client.socialMedia?.instagram || "",
      facebook: client.socialMedia?.facebook || "",
      linkedin: client.socialMedia?.linkedin || "",
      twitter: client.socialMedia?.twitter || "",
      segment: client.profileAnalysis?.segment || "",
      targetAudience: client.profileAnalysis?.targetAudience || "",
      mainGoal: client.profileAnalysis?.mainGoal || "sales",
      overallScore: client.profileAnalysis?.overallScore || 5,
      analysisNotes: client.profileAnalysis?.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToEdit) return;

    if (!validateForm()) return;

    updateClient(clientToEdit.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      responsible: formData.responsible || undefined,
      socialMedia: {
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        linkedin: formData.linkedin || undefined,
        twitter: formData.twitter || undefined,
      },
      profileAnalysis: formData.segment
        ? {
            segment: formData.segment,
            targetAudience: formData.targetAudience,
            mainGoal: formData.mainGoal,
            overallScore: formData.overallScore,
            notes: formData.analysisNotes,
          }
        : undefined,
    });

    setIsEditDialogOpen(false);
    setClientToEdit(null);
    resetForm();
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      // Se estiver expandido, fecha
      if (expandedClientId === clientToDelete.id) {
        setExpandedClientId(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus clientes e contratos
          </p>
        </div>
        <div className="flex gap-2">
          {filteredClients.length > 0 && (
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => {
                const clientsWithLeads = filteredClients.map((client) => ({
                  client,
                  lead: client.leadId ? getLeadByClientId(client.id) : null,
                }));
                generateBatchClientPDF(clientsWithLeads);
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Exportar PDFs ({filteredClients.length})
            </Button>
          )}
          <Can permission="clients.create">
            <Button
              className="gradient-primary text-white shadow-lg glow-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
              <p className="text-xs text-muted-foreground">Total de Clientes</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.active}
              </p>
              <p className="text-xs text-muted-foreground">Clientes Ativos</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.fromLeads}
              </p>
              <p className="text-xs text-muted-foreground">Vindos de Leads</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <ArrowUpRight className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R${" "}
                {stats.totalValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl p-6 card-shadow">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou responsável..."
              className="pl-9 bg-sidebar-accent/50 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ClientStatus | "all")}
          >
            <SelectTrigger className="w-[150px] bg-sidebar-accent/50 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={originFilter}
            onValueChange={(v) =>
              setOriginFilter(v as "all" | "lead" | "direct")
            }
          >
            <SelectTrigger className="w-[150px] bg-sidebar-accent/50 border-white/10">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas origens</SelectItem>
              <SelectItem value="lead">Via Lead</SelectItem>
              <SelectItem value="direct">Cadastro direto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sidebar-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Contato
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Origem
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Projetos
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const status = statusConfig[client.status];
                const isExpanded = expandedClientId === client.id;
                const lead = client.leadId
                  ? getLeadByClientId(client.id)
                  : null;

                return (
                  <React.Fragment key={client.id}>
                    <tr
                      className={`border-b border-sidebar-border/50 hover:bg-sidebar-accent/30 transition-colors cursor-pointer ${isExpanded ? "bg-sidebar-accent/20" : ""}`}
                      onClick={() => handleViewClient(client)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback className="bg-primary/20 text-primary text-sm">
                              {client.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {client.name}
                            </p>
                            {client.responsible && (
                              <p className="text-xs text-muted-foreground">
                                Resp: {client.responsible}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td
                        className="py-4 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              variant="outline"
                              className={`${status.className} cursor-pointer hover:opacity-80`}
                            >
                              {status.label}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(client.id, "active")
                              }
                            >
                              <Badge
                                variant="outline"
                                className={statusConfig.active.className}
                              >
                                Ativo
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(client.id, "pending")
                              }
                            >
                              <Badge
                                variant="outline"
                                className={statusConfig.pending.className}
                              >
                                Pendente
                              </Badge>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(client.id, "inactive")
                              }
                            >
                              <Badge
                                variant="outline"
                                className={statusConfig.inactive.className}
                              >
                                Inativo
                              </Badge>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        {client.leadId ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-purple-500/20 text-purple-400 border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/leads");
                              }}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Via Lead
                            </Badge>
                            {client.origin && (
                              <span className="text-xs text-muted-foreground">
                                ({originLabels[client.origin] || client.origin})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Cadastro direto
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground">
                          {client.projects}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-foreground">
                          R$ {client.value.toLocaleString("pt-BR")}
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
                            <DropdownMenuItem
                              onClick={() =>
                                generateClientPDF({ client, lead })
                              }
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Gerar PDF
                            </DropdownMenuItem>
                            <Can permission="clients.edit">
                              <DropdownMenuItem
                                onClick={() => handleEditClick(client)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar cliente
                              </DropdownMenuItem>
                            </Can>
                            {client.leadId && (
                              <DropdownMenuItem
                                onClick={() => navigate("/leads")}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Ver Lead original
                              </DropdownMenuItem>
                            )}
                            <Can permission="clients.delete">
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => handleDeleteClick(client)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir cliente
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
                        <td colSpan={7} className="px-4 py-0">
                          <div className="py-4 pl-12 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* Coluna 1 - Redes Sociais */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Instagram className="h-4 w-4 text-primary" />
                                  Redes Sociais
                                </h4>
                                {client.socialMedia &&
                                Object.values(client.socialMedia).some(
                                  (v) => v,
                                ) ? (
                                  <div className="flex flex-wrap gap-2">
                                    {client.socialMedia.instagram && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Instagram className="h-3 w-3 mr-1 text-pink-400" />
                                        {client.socialMedia.instagram}
                                      </Badge>
                                    )}
                                    {client.socialMedia.facebook && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Facebook className="h-3 w-3 mr-1 text-blue-400" />
                                        {client.socialMedia.facebook}
                                      </Badge>
                                    )}
                                    {client.socialMedia.linkedin && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Linkedin className="h-3 w-3 mr-1 text-blue-500" />
                                        {client.socialMedia.linkedin}
                                      </Badge>
                                    )}
                                    {client.socialMedia.twitter && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Twitter className="h-3 w-3 mr-1 text-sky-400" />
                                        {client.socialMedia.twitter}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground/60 italic">
                                    Nenhuma rede social cadastrada
                                  </p>
                                )}
                              </div>

                              {/* Coluna 2 - Análise de Perfil */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  Análise de Perfil
                                </h4>
                                {client.profileAnalysis ? (
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Building2 className="h-3 w-3" />
                                      Segmento:{" "}
                                      <span className="text-foreground">
                                        {client.profileAnalysis.segment}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Target className="h-3 w-3" />
                                      Objetivo:{" "}
                                      <span className="text-foreground">
                                        {
                                          CLIENT_GOALS[
                                            client.profileAnalysis.mainGoal
                                          ]
                                        }
                                      </span>
                                    </div>
                                    {client.profileAnalysis.targetAudience && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <UserCircle className="h-3 w-3" />
                                        <span className="text-foreground text-xs">
                                          {
                                            client.profileAnalysis
                                              .targetAudience
                                          }
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                      <Star className="h-3 w-3 text-primary fill-primary" />
                                      <span className="text-sm font-medium text-primary">
                                        {client.profileAnalysis.overallScore}/10
                                      </span>
                                      <div className="flex-1 h-2 bg-sidebar-accent rounded-full overflow-hidden">
                                        <div
                                          className="h-full gradient-primary rounded-full"
                                          style={{
                                            width: `${client.profileAnalysis.overallScore * 10}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    {client.profileAnalysis.notes && (
                                      <p className="text-xs text-muted-foreground bg-sidebar-accent/30 p-2 rounded mt-2">
                                        {client.profileAnalysis.notes}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground/60 italic">
                                    Análise não preenchida
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-primary p-0 h-auto ml-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(client);
                                      }}
                                    >
                                      Adicionar
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Coluna 3 - Dados do Lead (se vier de Lead) */}
                              {client.leadId && lead ? (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Dados do Lead
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      Seguidores:{" "}
                                      <span className="text-foreground font-medium">
                                        {lead.followers
                                          ? lead.followers.toLocaleString(
                                              "pt-BR",
                                            )
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
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <DollarSign className="h-3 w-3" />
                                      Valor Estimado:{" "}
                                      <span className="text-foreground font-medium">
                                        {lead.value
                                          ? `R$ ${lead.value.toLocaleString("pt-BR")}`
                                          : "Não informado"}
                                      </span>
                                    </div>
                                    {lead.notes && (
                                      <div className="mt-2">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                          <MessageSquare className="h-3 w-3" />
                                          Observações:
                                        </div>
                                        <p className="text-xs text-muted-foreground bg-sidebar-accent/30 p-2 rounded">
                                          {lead.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Dados de Tráfego
                                  </h4>
                                  <div className="text-sm text-muted-foreground/60 italic">
                                    Não há dados de lead vinculados
                                  </div>
                                </div>
                              )}

                              {/* Coluna 4 - Origem / Lead */}
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-primary" />
                                  Origem
                                </h4>
                                {client.leadId && lead ? (
                                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Target className="h-4 w-4 text-purple-400" />
                                      <span className="text-sm font-medium text-purple-400">
                                        Convertido de Lead
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p>
                                        Canal:{" "}
                                        {originLabels[lead.origin] ||
                                          lead.origin}
                                      </p>
                                      <p className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Data:{" "}
                                        {new Date(
                                          lead.createdAt,
                                        ).toLocaleDateString("pt-BR")}
                                      </p>
                                      {lead.company && (
                                        <p className="flex items-center gap-1">
                                          <Building2 className="h-3 w-3" />
                                          Empresa: {lead.company}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-purple-400 hover:text-purple-300 p-0 h-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/leads");
                                      }}
                                    >
                                      Ver lead original →
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="bg-sidebar-accent/50 rounded-lg p-3">
                                    <p className="text-sm text-muted-foreground">
                                      Cadastro direto
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                      Cliente cadastrado manualmente
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-sidebar-border/50">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary border-primary/30 hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  generateClientPDF({ client, lead });
                                }}
                              >
                                <FileDown className="h-3 w-3 mr-2" />
                                Gerar PDF
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(client);
                                }}
                              >
                                <Pencil className="h-3 w-3 mr-2" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(client);
                                }}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Excluir
                              </Button>
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

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Tente ajustar os filtros ou cadastre um novo cliente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Cadastro de Cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Cadastre um novo cliente preenchendo as informações abaixo. Para
              converter um lead em cliente, acesse a página de Leads.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Informações Básicas
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Cliente *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Tech Solutions Ltda"
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
                      placeholder="contato@empresa.com"
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
                  <Label htmlFor="responsible">
                    Responsável / Contato Principal
                  </Label>
                  <Input
                    id="responsible"
                    name="responsible"
                    placeholder="Ex: João Silva"
                    value={formData.responsible}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10"
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Redes Sociais
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagram"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@empresa"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="facebook"
                      className="flex items-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      placeholder="facebook.com/empresa"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedin"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      placeholder="linkedin.com/company/empresa"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="twitter"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      placeholder="@empresa"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Análise de Perfil */}
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Análise de Perfil
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="segment">Segmento de Mercado</Label>
                    <Select
                      value={formData.segment}
                      onValueChange={(value) =>
                        setFormData({ ...formData, segment: value })
                      }
                    >
                      <SelectTrigger className="bg-sidebar-accent/50 border-white/10">
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_SEGMENTS.map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mainGoal">Objetivo Principal</Label>
                    <Select
                      value={formData.mainGoal}
                      onValueChange={(value: ClientGoal) =>
                        setFormData({ ...formData, mainGoal: value })
                      }
                    >
                      <SelectTrigger className="bg-sidebar-accent/50 border-white/10">
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_GOALS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Input
                    id="targetAudience"
                    name="targetAudience"
                    placeholder="Ex: Mulheres, 25-45 anos, classe B/C"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Avaliação Geral</Label>
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary" />
                      {formData.overallScore}/10
                    </span>
                  </div>
                  <Slider
                    value={[formData.overallScore]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, overallScore: value[0] })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Baixo</span>
                    <span>Alto</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysisNotes">Análise do Cliente</Label>
                  <Textarea
                    id="analysisNotes"
                    name="analysisNotes"
                    placeholder="Anote detalhes importantes sobre o perfil do cliente..."
                    value={formData.analysisNotes}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10 min-h-[80px] resize-none"
                  />
                </div>
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
                Cadastrar Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Cliente */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setClientToEdit(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Editar Cliente
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Informações Básicas
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Cliente *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="Ex: Tech Solutions Ltda"
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
                    <Label htmlFor="edit-email">E-mail *</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      placeholder="contato@empresa.com"
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
                    <Label htmlFor="edit-phone">Telefone *</Label>
                    <Input
                      id="edit-phone"
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
                  <Label htmlFor="edit-responsible">
                    Responsável / Contato Principal
                  </Label>
                  <Input
                    id="edit-responsible"
                    name="responsible"
                    placeholder="Ex: João Silva"
                    value={formData.responsible}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10"
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Redes Sociais
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-instagram"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      id="edit-instagram"
                      name="instagram"
                      placeholder="@empresa"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-facebook"
                      className="flex items-center gap-2"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      id="edit-facebook"
                      name="facebook"
                      placeholder="facebook.com/empresa"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-linkedin"
                      className="flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="edit-linkedin"
                      name="linkedin"
                      placeholder="linkedin.com/company/empresa"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-twitter"
                      className="flex items-center gap-2"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter / X
                    </Label>
                    <Input
                      id="edit-twitter"
                      name="twitter"
                      placeholder="@empresa"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="bg-sidebar-accent/50 border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Análise de Perfil */}
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Análise de Perfil
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-segment">Segmento de Mercado</Label>
                    <Select
                      value={formData.segment}
                      onValueChange={(value) =>
                        setFormData({ ...formData, segment: value })
                      }
                    >
                      <SelectTrigger className="bg-sidebar-accent/50 border-white/10">
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENT_SEGMENTS.map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            {segment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-mainGoal">Objetivo Principal</Label>
                    <Select
                      value={formData.mainGoal}
                      onValueChange={(value: ClientGoal) =>
                        setFormData({ ...formData, mainGoal: value })
                      }
                    >
                      <SelectTrigger className="bg-sidebar-accent/50 border-white/10">
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_GOALS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-targetAudience">Público-Alvo</Label>
                  <Input
                    id="edit-targetAudience"
                    name="targetAudience"
                    placeholder="Ex: Mulheres, 25-45 anos, classe B/C"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Avaliação Geral</Label>
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary" />
                      {formData.overallScore}/10
                    </span>
                  </div>
                  <Slider
                    value={[formData.overallScore]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, overallScore: value[0] })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Baixo</span>
                    <span>Alto</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-analysisNotes">Análise do Cliente</Label>
                  <Textarea
                    id="edit-analysisNotes"
                    name="analysisNotes"
                    placeholder="Anote detalhes importantes sobre o perfil do cliente..."
                    value={formData.analysisNotes}
                    onChange={handleInputChange}
                    className="bg-sidebar-accent/50 border-white/10 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Info adicional se veio de Lead */}
              {clientToEdit?.leadId && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-sm text-purple-400 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Este cliente foi convertido de um lead
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setClientToEdit(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                <Pencil className="h-4 w-4 mr-2" />
                Salvar Alterações
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
              Excluir Cliente
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {clientToDelete && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Tem certeza que deseja excluir o cliente{" "}
                <span className="font-semibold text-foreground">
                  {clientToDelete.name}
                </span>
                ?
              </p>

              {clientToDelete.leadId && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Este cliente foi convertido de um lead. A referência será
                    removida do lead original.
                  </p>
                </div>
              )}

              <div className="bg-sidebar-accent/50 rounded-lg p-3 space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {clientToDelete.email}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Projetos:</span>{" "}
                  {clientToDelete.projects}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Valor total:</span> R${" "}
                  {clientToDelete.value.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setClientToDelete(null);
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
