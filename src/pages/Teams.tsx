import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  Crown,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/contexts/DataContext";
import { usePermissions } from "@/hooks/use-permissions";
import {
  listTenantMembers,
  type TenantMember,
} from "@/services/profileService";
import type { TeamMemberRole } from "@/types/database";

export default function Teams() {
  const { toast } = useToast();
  const { can } = usePermissions();
  const {
    teams,
    teamMembers,
    addTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    getTeamMembers,
  } = useData();

  // Membros do tenant (para selecionar ao adicionar a um time)
  const [tenantMembers, setTenantMembers] = useState<TenantMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Dialogs
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<{
    id: number;
    name: string;
    description?: string;
  } | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamMemberRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expandido: time selecionado para ver membros
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);

  const canManage = can("teams", "create");

  const loadTenantMembers = useCallback(async () => {
    setLoadingMembers(true);
    const result = await listTenantMembers();
    if (!result.error) {
      setTenantMembers(result.data.filter((m) => m.status === "active"));
    }
    setLoadingMembers(false);
  }, []);

  useEffect(() => {
    loadTenantMembers();
  }, [loadTenantMembers]);

  // Abrir dialog para criar time
  const handleNewTeam = () => {
    setEditingTeam(null);
    setTeamName("");
    setTeamDescription("");
    setShowTeamDialog(true);
  };

  // Abrir dialog para editar time
  const handleEditTeam = (team: { id: number; name: string; description?: string }) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || "");
    setShowTeamDialog(true);
  };

  // Salvar time (criar ou atualizar)
  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, {
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
        });
        toast({ title: "Time atualizado", description: `"${teamName}" foi atualizado.` });
      } else {
        await addTeam({
          name: teamName.trim(),
          description: teamDescription.trim() || undefined,
        });
        toast({ title: "Time criado", description: `"${teamName}" foi criado com sucesso.` });
      }
      setShowTeamDialog(false);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o time.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir time
  const handleDeleteTeam = async (teamId: number) => {
    const success = await deleteTeam(teamId);
    if (success) {
      toast({ title: "Time removido", description: "O time foi excluído." });
      if (expandedTeamId === teamId) setExpandedTeamId(null);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o time.",
        variant: "destructive",
      });
    }
  };

  // Abrir dialog para adicionar membro
  const handleOpenAddMember = (teamId: number) => {
    setSelectedTeamId(teamId);
    setSelectedUserId("");
    setSelectedRole("member");
    setShowMemberDialog(true);
  };

  // Adicionar membro ao time
  const handleAddMember = async () => {
    if (!selectedTeamId || !selectedUserId) return;

    setIsSubmitting(true);
    try {
      await addTeamMember(selectedTeamId, selectedUserId, selectedRole);
      toast({ title: "Membro adicionado", description: "O membro foi adicionado ao time." });
      setShowMemberDialog(false);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remover membro do time
  const handleRemoveMember = async (memberId: number) => {
    const success = await removeTeamMember(memberId);
    if (success) {
      toast({ title: "Membro removido", description: "O membro foi removido do time." });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
    }
  };

  // Membros que ainda não estão no time selecionado
  const getAvailableMembers = (teamId: number) => {
    const currentMembers = getTeamMembers(teamId);
    const currentUserIds = new Set(currentMembers.map((m) => m.userId));
    return tenantMembers.filter((m) => !currentUserIds.has(m.id));
  };

  // Nome do membro por userId
  const getMemberName = (userId: string): string => {
    const member = tenantMembers.find((m) => m.id === userId);
    return member?.fullName || member?.email || userId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Times</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os times da sua organização
          </p>
        </div>
        {canManage && (
          <Button onClick={handleNewTeam} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Time
          </Button>
        )}
      </div>

      {/* Teams list */}
      {teams.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum time criado
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Crie times para organizar e compartilhar dados entre membros da sua
              organização.
            </p>
            {canManage && (
              <Button onClick={handleNewTeam} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Criar primeiro time
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const members = getTeamMembers(team.id);
            const isExpanded = expandedTeamId === team.id;

            return (
              <Card
                key={team.id}
                className="glass cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                onClick={() =>
                  setExpandedTeamId(isExpanded ? null : team.id)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-white truncate">
                        {team.name}
                      </CardTitle>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      <Users className="h-3 w-3 mr-1" />
                      {members.length}
                    </Badge>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent
                    className="pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Action buttons */}
                    {canManage && (
                      <div className="flex gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleOpenAddMember(team.id)}
                        >
                          <UserPlus className="h-3 w-3" />
                          Membro
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1 ml-auto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir time</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o time &quot;{team.name}&quot;?
                                Todos os membros serão removidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTeam(team.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {/* Members table */}
                    {members.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum membro neste time.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Membro</TableHead>
                            <TableHead>Papel</TableHead>
                            {canManage && (
                              <TableHead className="w-10" />
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {member.role === "leader" ? (
                                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                  ) : (
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                  <span className="truncate">
                                    {member.fullName ||
                                      getMemberName(member.userId)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    member.role === "leader"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {member.role === "leader"
                                    ? "Líder"
                                    : "Membro"}
                                </Badge>
                              </TableCell>
                              {canManage && (
                                <TableCell>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      >
                                        <UserMinus className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Remover membro
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Deseja remover este membro do time?
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
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Remover
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog: Criar/Editar Time */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? "Editar Time" : "Novo Time"}
            </DialogTitle>
            <DialogDescription>
              {editingTeam
                ? "Atualize os dados do time."
                : "Preencha os dados para criar um novo time."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-name">Nome do time</Label>
              <Input
                id="team-name"
                placeholder="Ex: Equipe Comercial"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-desc">Descrição (opcional)</Label>
              <Textarea
                id="team-desc"
                placeholder="Descreva a função deste time..."
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTeamDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveTeam} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingTeam ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar Membro */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro</DialogTitle>
            <DialogDescription>
              Selecione um membro da organização para adicionar ao time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Membro</Label>
              {loadingMembers ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando membros...
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeamId &&
                      getAvailableMembers(selectedTeamId).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName || member.email || member.id}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Papel no time</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as TeamMemberRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="leader">Líder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMemberDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={isSubmitting || !selectedUserId}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
