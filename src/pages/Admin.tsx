import { useState, useEffect, useCallback } from "react";
import { Shield, Users, Building2, RefreshCw, Trash2, Ban, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { TenantStatus, TenantPlan, UserRole, ProfileStatus } from "@/types/database";

interface Tenant {
  id: string;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
  created_at: string;
  member_count?: number;
}

interface Member {
  id: string;
  full_name: string | null;
  role: UserRole;
  status: ProfileStatus;
  is_master_admin: boolean;
  created_at: string;
  tenant_id: string;
  tenant_name?: string;
}

const tenantStatusConfig: Record<TenantStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  suspended: { label: "Suspenso", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const planConfig: Record<TenantPlan, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  starter: { label: "Starter", variant: "secondary" },
  pro: { label: "Pro", variant: "default" },
  enterprise: { label: "Enterprise", variant: "outline" },
};

const profileStatusConfig: Record<ProfileStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  blocked: { label: "Bloqueado", variant: "destructive" },
};

export default function Admin() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialogs de confirmação
  const [confirmAction, setConfirmAction] = useState<{
    type: "validate" | "block" | "remove";
    member: Member;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantsError) {
        console.error("[Admin] Erro ao carregar tenants:", tenantsError);
        toast.error("Erro ao carregar organizações");
      } else {
        // Contar membros por tenant
        const tenantIds = (tenantsData ?? []).map((t) => t.id);
        let memberCounts: Record<string, number> = {};

        if (tenantIds.length > 0) {
          const { data: countData } = await supabase
            .from("profiles")
            .select("tenant_id")
            .in("tenant_id", tenantIds);

          if (countData) {
            memberCounts = countData.reduce<Record<string, number>>((acc, row) => {
              acc[row.tenant_id] = (acc[row.tenant_id] ?? 0) + 1;
              return acc;
            }, {});
          }
        }

        setTenants(
          (tenantsData ?? []).map((t) => ({
            ...t,
            member_count: memberCounts[t.id] ?? 0,
          })),
        );
      }

      // Carregar profiles com e-mail dos usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*, tenants(name)")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("[Admin] Erro ao carregar profiles:", profilesError);
        toast.error("Erro ao carregar usuários");
      } else {
        setMembers(
          (profilesData ?? []).map((p) => ({
            id: p.id,
            full_name: p.full_name,
            role: p.role,
            status: p.status,
            is_master_admin: p.is_master_admin,
            created_at: p.created_at,
            tenant_id: p.tenant_id,
            tenant_name: (p.tenants as { name: string } | null)?.name,
          })),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleValidate = async (member: Member) => {
    const { error } = await supabase.rpc("update_member_status", {
      p_user_id: member.id,
      p_status: "active",
    });
    if (error) {
      toast.error("Erro ao validar usuário");
    } else {
      toast.success("Usuário validado com sucesso");
      await loadData();
    }
    setConfirmAction(null);
  };

  const handleBlock = async (member: Member) => {
    const { error } = await supabase.rpc("update_member_status", {
      p_user_id: member.id,
      p_status: "blocked",
    });
    if (error) {
      toast.error("Erro ao bloquear usuário");
    } else {
      toast.success("Usuário bloqueado");
      await loadData();
    }
    setConfirmAction(null);
  };

  const handleRemove = async (member: Member) => {
    const { error } = await supabase.rpc("remove_tenant_member", {
      p_user_id: member.id,
    });
    if (error) {
      toast.error("Erro ao remover membro");
    } else {
      toast.success("Membro removido da organização");
      await loadData();
    }
    setConfirmAction(null);
  };

  const handleRoleChange = async (member: Member, newRole: UserRole) => {
    const { error } = await supabase.rpc("update_member_role", {
      p_user_id: member.id,
      p_role: newRole,
    });
    if (error) {
      toast.error("Erro ao alterar role");
    } else {
      toast.success("Role alterado com sucesso");
      await loadData();
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Painel Admin Master
              </h1>
              <p className="text-sm text-muted-foreground">
                Turbine Tech — Visão global de todos os tenants e usuários
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total de Organizações
            </p>
            <p className="text-2xl font-bold text-foreground">
              {tenants.length}
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Organizações Ativas
            </p>
            <p className="text-2xl font-bold text-foreground">
              {tenants.filter((t) => t.status === "active").length}
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">Total de Usuários</p>
            <p className="text-2xl font-bold text-foreground">
              {members.length}
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Usuários Pendentes
            </p>
            <p className="text-2xl font-bold text-foreground">
              {members.filter((m) => m.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tenants">
          <TabsList className="glass">
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organizações
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* Tenants Tab */}
          <TabsContent value="tenants">
            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organização</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Criado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : tenants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhuma organização encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((tenant) => {
                      const statusCfg = tenantStatusConfig[tenant.status];
                      const planCfg = planConfig[tenant.plan];
                      return (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">
                            {tenant.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={planCfg.variant}>
                              {planCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusCfg.variant}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{tenant.member_count ?? 0}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(tenant.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="glass rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Organização</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Master</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => {
                      const statusCfg = profileStatusConfig[member.status];
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.full_name ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {member.tenant_name ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.role}
                              onValueChange={(val) =>
                                void handleRoleChange(member, val as UserRole)
                              }
                              disabled={member.is_master_admin}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="sales">Vendas</SelectItem>
                                <SelectItem value="finance">Financeiro</SelectItem>
                                <SelectItem value="viewer">Visualizador</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusCfg.variant}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.is_master_admin ? (
                              <Badge variant="outline" className="text-primary border-primary/50">
                                Master Admin
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(member.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            {!member.is_master_admin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    Ações
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {member.status !== "active" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setConfirmAction({
                                          type: "validate",
                                          member,
                                        })
                                      }
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                      Validar usuário
                                    </DropdownMenuItem>
                                  )}
                                  {member.status !== "blocked" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setConfirmAction({
                                          type: "block",
                                          member,
                                        })
                                      }
                                    >
                                      <Ban className="mr-2 h-4 w-4 text-yellow-500" />
                                      Bloquear usuário
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "remove",
                                        member,
                                      })
                                    }
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover da organização
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "validate" && "Validar usuário"}
              {confirmAction?.type === "block" && "Bloquear usuário"}
              {confirmAction?.type === "remove" && "Remover membro"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "validate" &&
                `Deseja validar o usuário "${confirmAction.member.full_name ?? "sem nome"}"? Ele poderá acessar o sistema normalmente.`}
              {confirmAction?.type === "block" &&
                `Deseja bloquear o usuário "${confirmAction.member.full_name ?? "sem nome"}"? Ele não poderá acessar o sistema.`}
              {confirmAction?.type === "remove" &&
                `Deseja remover "${confirmAction.member.full_name ?? "sem nome"}" da organização? Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "validate") {
                  void handleValidate(confirmAction.member);
                } else if (confirmAction.type === "block") {
                  void handleBlock(confirmAction.member);
                } else if (confirmAction.type === "remove") {
                  void handleRemove(confirmAction.member);
                }
              }}
              className={
                confirmAction?.type === "remove"
                  ? "bg-destructive hover:bg-destructive/90"
                  : confirmAction?.type === "block"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : ""
              }
            >
              {confirmAction?.type === "validate" && "Validar"}
              {confirmAction?.type === "block" && "Bloquear"}
              {confirmAction?.type === "remove" && "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
