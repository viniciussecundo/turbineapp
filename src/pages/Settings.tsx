import { useCallback, useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Users,
  Building2,
  Shield,
  UserCog,
  Trash2,
  Ban,
  CheckCircle2,
  Crown,
  Eye,
  DollarSign,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import type { UserRole, ProfileStatus } from "@/types/database";
import {
  listTenantMembers,
  updateMemberRole,
  updateMemberStatus,
  removeTenantMember,
  type TenantMember,
} from "@/services/profileService";

// ── Helpers visuais ──

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  sales: "Vendas",
  finance: "Financeiro",
  viewer: "Leitura",
};

const roleIcons: Record<UserRole, typeof Crown> = {
  admin: Crown,
  sales: Target,
  finance: DollarSign,
  viewer: Eye,
};

const roleBadgeVariant: Record<UserRole, string> = {
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sales: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  finance: "bg-green-500/10 text-green-400 border-green-500/20",
  viewer: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const statusLabels: Record<ProfileStatus, string> = {
  active: "Ativo",
  pending: "Pendente",
  blocked: "Bloqueado",
};

const statusBadgeVariant: Record<ProfileStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  blocked: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Settings() {
  const { user, profile } = useAuth();
  const { role, isMasterAdmin } = usePermissions();
  const { toast } = useToast();
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = role === "admin" || isMasterAdmin;

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    const result = await listTenantMembers();
    if (result.error) {
      toast({
        title: "Erro ao carregar membros",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setMembers(result.data);
    }
    setIsLoadingMembers(false);
  }, [toast]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setActionLoading(memberId);
    const result = await updateMemberRole(memberId, newRole);
    setActionLoading(null);

    if (result.error) {
      toast({
        title: "Erro ao alterar papel",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Papel atualizado com sucesso" });
    await loadMembers();
  };

  const handleStatusToggle = async (member: TenantMember) => {
    const newStatus: ProfileStatus =
      member.status === "blocked" ? "active" : "blocked";
    setActionLoading(member.id);
    const result = await updateMemberStatus(member.id, newStatus);
    setActionLoading(null);

    if (result.error) {
      toast({
        title: "Erro ao alterar status",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title:
        newStatus === "blocked" ? "Membro bloqueado" : "Membro desbloqueado",
    });
    await loadMembers();
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(memberId);
    const result = await removeTenantMember(memberId);
    setActionLoading(null);

    if (result.error) {
      toast({
        title: "Erro ao remover membro",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Membro removido com sucesso" });
    await loadMembers();
  };

  const isSelf = (memberId: string) => memberId === user?.id;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary glow-primary">
          <SettingsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua organização e membros
          </p>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-secondary/50 border border-white/5">
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Membros
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organização
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Membros ── */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <Card className="glass border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    Membros da Organização
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {members.length} membro{members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Carregando membros...
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Nenhum membro encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    const isCurrentUser = isSelf(member.id);
                    const isLoading = actionLoading === member.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 rounded-xl border border-white/5 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                      >
                        {/* Avatar */}
                        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-white/10 bg-primary/20 text-primary font-semibold text-sm">
                          {(member.fullName ?? "U").charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {member.fullName ?? "Sem nome"}
                            </p>
                            {isCurrentUser && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-primary/30 text-primary"
                              >
                                Você
                              </Badge>
                            )}
                            {member.isMasterAdmin && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-400"
                              >
                                Master
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            Desde{" "}
                            {new Date(member.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        </div>

                        {/* Status badge */}
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusBadgeVariant[member.status]}`}
                        >
                          {statusLabels[member.status]}
                        </Badge>

                        {/* Role badge ou select */}
                        {isAdmin && !isCurrentUser && !member.isMasterAdmin ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleRoleChange(member.id, value as UserRole)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-[150px] h-8 text-xs bg-secondary/50 border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <span className="flex items-center gap-2">
                                  <Crown className="h-3 w-3" />
                                  Administrador
                                </span>
                              </SelectItem>
                              <SelectItem value="sales">
                                <span className="flex items-center gap-2">
                                  <Target className="h-3 w-3" />
                                  Vendas
                                </span>
                              </SelectItem>
                              <SelectItem value="finance">
                                <span className="flex items-center gap-2">
                                  <DollarSign className="h-3 w-3" />
                                  Financeiro
                                </span>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <span className="flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  Leitura
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-xs gap-1 ${roleBadgeVariant[member.role]}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {roleLabels[member.role]}
                          </Badge>
                        )}

                        {/* Actions */}
                        {isAdmin && !isCurrentUser && !member.isMasterAdmin && (
                          <div className="flex items-center gap-1">
                            {/* Block / Unblock */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-yellow-400"
                              onClick={() => handleStatusToggle(member)}
                              disabled={isLoading}
                              title={
                                member.status === "blocked"
                                  ? "Desbloquear"
                                  : "Bloquear"
                              }
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : member.status === "blocked" ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Remove */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                  disabled={isLoading}
                                  title="Remover membro"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remover membro
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover{" "}
                                    <strong>
                                      {member.fullName ?? "este membro"}
                                    </strong>{" "}
                                    da organização? Esta ação não pode ser
                                    desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveMember(member.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Permissions Legend */}
          <Card className="glass border-white/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  Permissões por Papel
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Object.entries(roleLabels) as [UserRole, string][]).map(
                  ([roleKey, label]) => {
                    const Icon = roleIcons[roleKey];
                    return (
                      <div
                        key={roleKey}
                        className={`rounded-lg border p-3 ${roleBadgeVariant[roleKey]}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                        <ul className="text-xs space-y-1 opacity-80">
                          {roleKey === "admin" && (
                            <>
                              <li>• Acesso total a todos os módulos</li>
                              <li>• Gerenciar membros e papéis</li>
                              <li>• Configurações da organização</li>
                            </>
                          )}
                          {roleKey === "sales" && (
                            <>
                              <li>• Leads, Clientes, Orçamentos</li>
                              <li>• Criar e editar registros</li>
                              <li>• Sem acesso a Finanças</li>
                            </>
                          )}
                          {roleKey === "finance" && (
                            <>
                              <li>• Finanças, Orçamentos, Relatórios</li>
                              <li>• Criar e editar transações</li>
                              <li>• Sem acesso a Leads</li>
                            </>
                          )}
                          {roleKey === "viewer" && (
                            <>
                              <li>• Visualização de todos os módulos</li>
                              <li>• Sem permissão de escrita</li>
                              <li>• Somente leitura</li>
                            </>
                          )}
                        </ul>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Organização ── */}
        <TabsContent value="organization" className="space-y-4 mt-4">
          <Card className="glass border-white/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Dados da Organização</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-white/5 bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Seu papel
                    </p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      {role ? (
                        <>
                          {(() => {
                            const Icon = roleIcons[role];
                            return <Icon className="h-4 w-4 text-primary" />;
                          })()}
                          {roleLabels[role]}
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Status do perfil
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {profile?.status ? statusLabels[profile.status] : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">Nome</p>
                    <p className="text-sm font-medium text-foreground">
                      {profile?.fullName ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground mb-1">E-mail</p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.email ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
