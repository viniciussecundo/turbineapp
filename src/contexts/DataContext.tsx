import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { leadService } from "@/services/leadService";
import { clientService } from "@/services/clientService";
import { transactionService } from "@/services/transactionService";
import { walletService } from "@/services/walletService";
import { budgetService } from "@/services/budgetService";
import { activityService } from "@/services/activityService";
import { teamService } from "@/services/teamService";
import type {
  Team,
  TeamMember,
} from "@/services/teamService";
import { isAbortError } from "@/lib/utils";

// Types
export type LeadStatus = "novo" | "contato" | "proposta" | "fechado";
export type LeadOrigin =
  | "site"
  | "instagram"
  | "facebook"
  | "indicacao"
  | "google"
  | "outro";
export type ClientStatus = "active" | "pending" | "inactive";

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: LeadStatus;
  origin: LeadOrigin;
  value?: number;
  createdAt: string;
  notes?: string;
  convertedToClientId?: number;
  selfRegistered?: boolean;
  viewed?: boolean;
  followers?: number;
  posts?: number;
  monthlyBudget?: number;
}

// ========================================
// ANÁLISE DE PERFIL DO CLIENTE
// ========================================
export type ClientGoal = "sales" | "engagement" | "branding" | "leads";

export const CLIENT_GOALS: Record<ClientGoal, string> = {
  sales: "Vendas",
  engagement: "Engajamento",
  branding: "Branding",
  leads: "Geração de Leads",
};

export const CLIENT_SEGMENTS = [
  "Restaurante",
  "E-commerce",
  "Saúde",
  "Educação",
  "Moda",
  "Tecnologia",
  "Serviços",
  "Varejo",
  "Imobiliário",
  "Fitness",
  "Beleza",
  "Outro",
] as const;

export interface ProfileAnalysis {
  segment: string;
  targetAudience: string;
  mainGoal: ClientGoal;
  overallScore: number;
  notes: string;
}

// ========================================
// FINANÇAS
// ========================================
export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";

export const EXPENSE_CATEGORIES = [
  "Salários",
  "Ferramentas/Software",
  "Marketing",
  "Infraestrutura",
  "Impostos",
  "Serviços",
  "Outros",
] as const;

export const INCOME_CATEGORIES = [
  "Serviço de Cliente",
  "Gestão de Tráfego",
  "Consultoria",
  "Projeto Avulso",
  "Outros",
] as const;

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  value: number;
  date: string;
  category: string;
  status: TransactionStatus;
  clientId?: number;
  budgetId?: number;
  notes?: string;
}

export interface WalletMovement {
  id: number;
  type: "deposit" | "withdrawal";
  value: number;
  date: string;
  description: string;
}

export interface ClientWallet {
  id: number;
  clientId: number;
  balance: number;
  movements: WalletMovement[];
  createdAt: string;
}

// ========================================
// ORÇAMENTOS
// ========================================
export type BudgetStatus = "draft" | "sent" | "approved" | "rejected";

export const BUDGET_STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Rascunho",
    className: "bg-muted text-muted-foreground border-muted",
  },
  sent: {
    label: "Enviado",
    className: "bg-primary/20 text-primary border-primary/30",
  },
  approved: {
    label: "Aprovado",
    className: "bg-success/20 text-success border-success/30",
  },
  rejected: {
    label: "Recusado",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export interface BudgetItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Budget {
  id: number;
  code: string;
  clientId: number;
  title: string;
  description?: string;
  items: BudgetItem[];
  totalValue: number;
  status: BudgetStatus;
  createdAt: string;
  validUntil: string;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  projects: number;
  value: number;
  avatar?: string;
  responsible?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  leadId?: number;
  origin?: LeadOrigin;
  convertedAt?: string;
  profileAnalysis?: ProfileAnalysis;
}

// Sistema de Atividades/Notificações
export type ActivityType =
  | "lead"
  | "client"
  | "transaction"
  | "budget"
  | "wallet";

// Re-export team types from service for consumer convenience
export type { Team, TeamMember } from "@/services/teamService";

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon?: string;
  link?: string;
}

// Context Interface
interface DataContextType {
  // Loading state
  isLoading: boolean;

  // Leads
  leads: Lead[];
  addLead: (
    lead: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered?: boolean,
    overrideTenantId?: string,
  ) => Promise<void>;
  updateLeadStatus: (leadId: number, status: LeadStatus) => Promise<void>;
  markLeadAsViewed: (leadId: number) => Promise<void>;
  markAllLeadsAsViewed: () => Promise<void>;
  getUnviewedLeadsCount: () => number;
  deleteLead: (leadId: number) => Promise<boolean>;
  convertLeadToClient: (
    leadId: number,
    clientData?: Partial<Client>,
  ) => Promise<Client | null>;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, "id">) => Promise<void>;
  updateClient: (clientId: number, data: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: number) => Promise<boolean>;

  // Finanças - Transações
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (
    transactionId: number,
    data: Partial<Transaction>,
  ) => Promise<void>;
  deleteTransaction: (transactionId: number) => Promise<boolean>;

  // Finanças - Carteira Virtual
  wallets: ClientWallet[];
  getWalletByClientId: (clientId: number) => ClientWallet | undefined;
  createWallet: (
    clientId: number,
    initialDeposit?: number,
    initialMovement?: Omit<WalletMovement, "id">,
  ) => Promise<ClientWallet | null>;
  addWalletMovement: (
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ) => Promise<void>;

  // Finanças - Cálculos
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getClientTransactions: (clientId: number) => Transaction[];

  // Orçamentos
  budgets: Budget[];
  addBudget: (
    budget: Omit<Budget, "id" | "code" | "createdAt">,
  ) => Promise<Budget | null>;
  updateBudget: (budgetId: number, data: Partial<Budget>) => Promise<void>;
  deleteBudget: (budgetId: number) => Promise<boolean>;
  updateBudgetStatus: (budgetId: number, status: BudgetStatus) => Promise<void>;
  getBudgetsByClientId: (clientId: number) => Budget[];

  // Utils
  getLeadByClientId: (clientId: number) => Lead | undefined;
  getClientByLeadId: (leadId: number) => Client | undefined;
  getClientWithLeadData: (clientId: number) =>
    | (Client & {
        leadData: {
          name: string;
          company?: string;
          origin: LeadOrigin;
          createdAt: string;
          notes?: string;
          followers?: number;
          posts?: number;
          monthlyBudget?: number;
          originalValue?: number;
        } | null;
      })
    | null;

  // Atividades/Notificações
  activities: Activity[];
  addActivity: (
    activity: Omit<Activity, "id" | "timestamp" | "read">,
  ) => Promise<void>;
  markActivityAsRead: (activityId: number) => Promise<void>;
  markAllActivitiesAsRead: () => Promise<void>;
  clearActivities: () => Promise<void>;
  getUnreadActivitiesCount: () => number;

  // Times
  teams: Team[];
  teamMembers: TeamMember[];
  addTeam: (team: { name: string; description?: string }) => Promise<void>;
  updateTeam: (
    teamId: number,
    data: { name?: string; description?: string },
  ) => Promise<void>;
  deleteTeam: (teamId: number) => Promise<boolean>;
  addTeamMember: (
    teamId: number,
    userId: string,
    role?: "leader" | "member",
  ) => Promise<void>;
  removeTeamMember: (memberId: number) => Promise<boolean>;
  getTeamMembers: (teamId: number) => TeamMember[];

  // Refresh data
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session, tenantId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<ClientWallet[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Carregar dados iniciais do Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        leadsData,
        clientsData,
        transactionsData,
        walletsData,
        budgetsData,
        activitiesData,
        teamsData,
        teamMembersData,
      ] = await Promise.all([
        leadService.getAll(),
        clientService.getAll(),
        transactionService.getAll(),
        walletService.getAll(),
        budgetService.getAll(),
        activityService.getAll(),
        teamService.getAll(),
        teamService.getAllMembers(),
      ]);

      setLeads(leadsData);
      setClients(clientsData);
      setTransactions(transactionsData);
      setWallets(walletsData);
      setBudgets(budgetsData);
      setActivities(activitiesData);
      setTeams(teamsData);
      setTeamMembers(teamMembersData);
    } catch (error) {
      if (!isAbortError(error)) {
        console.error("Erro ao carregar dados:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // So carrega dados quando ha sessao ativa
  useEffect(() => {
    if (session) {
      loadData();
    } else {
      setLeads([]);
      setClients([]);
      setTransactions([]);
      setWallets([]);
      setBudgets([]);
      setActivities([]);
      setTeams([]);
      setTeamMembers([]);
      setIsLoading(false);
    }
  }, [session, loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // ========================================
  // LEADS
  // ========================================
  const addLead = async (
    leadData: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered = false,
    overrideTenantId?: string,
  ) => {
    const tid = overrideTenantId || tenantId || undefined;
    const newLead = await leadService.create(leadData, selfRegistered, tid);
    if (newLead) {
      setLeads((prev) => [newLead, ...prev]);
    }
  };

  const updateLeadStatus = async (leadId: number, status: LeadStatus) => {
    const updated = await leadService.updateStatus(leadId, status);
    if (updated) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updated : lead)),
      );
    }
  };

  const markLeadAsViewed = async (leadId: number) => {
    const updated = await leadService.markAsViewed(leadId);
    if (updated) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updated : lead)),
      );
    }
  };

  const markAllLeadsAsViewed = async () => {
    const success = await leadService.markAllAsViewed();
    if (success) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.selfRegistered && !lead.viewed
            ? { ...lead, viewed: true }
            : lead,
        ),
      );
    }
  };

  const getUnviewedLeadsCount = () => {
    return leads.filter((lead) => lead.selfRegistered && !lead.viewed).length;
  };

  const deleteLead = async (leadId: number): Promise<boolean> => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    // Se o lead foi convertido em cliente, remove a referência
    if (lead.convertedToClientId) {
      await clientService.removeLeadReference(leadId);
      setClients((prev) =>
        prev.map((c) =>
          c.leadId === leadId
            ? { ...c, leadId: undefined, origin: undefined }
            : c,
        ),
      );
    }

    const success = await leadService.delete(leadId);
    if (success) {
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
    return success;
  };

  const convertLeadToClient = async (
    leadId: number,
    clientData?: Partial<Client>,
  ): Promise<Client | null> => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    // Check if already converted
    if (lead.convertedToClientId) {
      return clients.find((c) => c.id === lead.convertedToClientId) || null;
    }

    const newClientData: Omit<Client, "id"> = {
      name: lead.company || lead.name,
      email: lead.email,
      phone: lead.phone,
      status: "active",
      projects: 0,
      value: lead.value || 0,
      responsible: lead.name,
      leadId: lead.id,
      origin: lead.origin,
      convertedAt: new Date().toISOString().split("T")[0],
      ...clientData,
    };

    const newClient = await clientService.create(
      newClientData,
      tenantId || undefined,
    );
    if (!newClient) return null;

    setClients((prev) => [newClient, ...prev]);

    // Update lead with client reference
    const updatedLead = await leadService.update(leadId, {
      status: "fechado" as LeadStatus,
      convertedToClientId: newClient.id,
    });

    if (updatedLead) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
    }

    return newClient;
  };

  // ========================================
  // CLIENTS
  // ========================================
  const addClient = async (clientData: Omit<Client, "id">) => {
    const newClient = await clientService.create(
      clientData,
      tenantId || undefined,
    );
    if (newClient) {
      setClients((prev) => [newClient, ...prev]);
    }
  };

  const updateClient = async (clientId: number, data: Partial<Client>) => {
    const updated = await clientService.update(clientId, data);
    if (updated) {
      setClients((prev) =>
        prev.map((client) => (client.id === clientId ? updated : client)),
      );
    }
  };

  const deleteClient = async (clientId: number): Promise<boolean> => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return false;

    // Se o cliente veio de um lead, remove a referência do lead
    if (client.leadId) {
      const updatedLead = await leadService.update(client.leadId, {
        convertedToClientId: undefined,
      });
      if (updatedLead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === client.leadId ? updatedLead : l)),
        );
      }
    }

    const success = await clientService.delete(clientId);
    if (success) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
    }
    return success;
  };

  // Utils
  const getLeadByClientId = (clientId: number): Lead | undefined => {
    const client = clients.find((c) => c.id === clientId);
    if (client?.leadId) {
      return leads.find((l) => l.id === client.leadId);
    }
    return undefined;
  };

  const getClientByLeadId = (leadId: number): Client | undefined => {
    return clients.find((c) => c.leadId === leadId);
  };

  const getClientWithLeadData = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return null;

    const lead = client.leadId
      ? leads.find((l) => l.id === client.leadId)
      : null;

    return {
      ...client,
      leadData: lead
        ? {
            name: lead.name,
            company: lead.company,
            origin: lead.origin,
            createdAt: lead.createdAt,
            notes: lead.notes,
            followers: lead.followers,
            posts: lead.posts,
            monthlyBudget: lead.monthlyBudget,
            originalValue: lead.value,
          }
        : null,
    };
  };

  // ========================================
  // TRANSACTIONS
  // ========================================
  const addTransaction = async (transactionData: Omit<Transaction, "id">) => {
    const newTransaction = await transactionService.create(
      transactionData,
      tenantId || undefined,
    );
    if (newTransaction) {
      setTransactions((prev) => [newTransaction, ...prev]);
    }
  };

  const updateTransaction = async (
    transactionId: number,
    data: Partial<Transaction>,
  ) => {
    const updated = await transactionService.update(transactionId, data);
    if (updated) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? updated : t)),
      );
    }
  };

  const deleteTransaction = async (transactionId: number): Promise<boolean> => {
    const success = await transactionService.delete(transactionId);
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    }
    return success;
  };

  // ========================================
  // WALLETS
  // ========================================
  const getWalletByClientId = (clientId: number): ClientWallet | undefined => {
    return wallets.find((w) => w.clientId === clientId);
  };

  const createWallet = async (
    clientId: number,
    initialDeposit = 0,
    initialMovement?: Omit<WalletMovement, "id">,
  ): Promise<ClientWallet | null> => {
    const existingWallet = getWalletByClientId(clientId);
    if (existingWallet) return existingWallet;

    const newWallet = await walletService.create(
      clientId,
      initialDeposit,
      initialMovement,
      tenantId || undefined,
    );
    if (newWallet) {
      setWallets((prev) => [...prev, newWallet]);
    }
    return newWallet;
  };

  const addWalletMovement = async (
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ) => {
    const updatedWallet = await walletService.addMovement(walletId, movement);
    if (updatedWallet) {
      setWallets((prev) =>
        prev.map((w) => (w.id === walletId ? updatedWallet : w)),
      );
    }
  };

  // Cálculos financeiros
  const getTotalIncome = (): number => {
    return transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.value, 0);
  };

  const getTotalExpenses = (): number => {
    return transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.value, 0);
  };

  const getBalance = (): number => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getClientTransactions = (clientId: number): Transaction[] => {
    return transactions.filter((t) => t.clientId === clientId);
  };

  // ========================================
  // BUDGETS
  // ========================================
  const addBudget = async (
    budgetData: Omit<Budget, "id" | "code" | "createdAt">,
  ): Promise<Budget | null> => {
    const newBudget = await budgetService.create(
      budgetData,
      tenantId || undefined,
    );
    if (newBudget) {
      setBudgets((prev) => [newBudget, ...prev]);
    }
    return newBudget;
  };

  const updateBudget = async (budgetId: number, data: Partial<Budget>) => {
    const updated = await budgetService.update(budgetId, data);
    if (updated) {
      setBudgets((prev) =>
        prev.map((budget) => (budget.id === budgetId ? updated : budget)),
      );
    }
  };

  const deleteBudget = async (budgetId: number): Promise<boolean> => {
    // Remove transações vinculadas
    await transactionService.deleteByBudgetId(budgetId);
    setTransactions((prev) => prev.filter((t) => t.budgetId !== budgetId));

    const success = await budgetService.delete(budgetId);
    if (success) {
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
    }
    return success;
  };

  const updateBudgetStatus = async (budgetId: number, status: BudgetStatus) => {
    const updated = await budgetService.updateStatus(budgetId, status);
    if (!updated) return;

    setBudgets((prev) =>
      prev.map((budget) => (budget.id === budgetId ? updated : budget)),
    );

    // Integração financeira - orçamento aprovado
    if (status === "approved") {
      const budget = budgets.find((b) => b.id === budgetId);
      if (budget) {
        const client = clients.find((c) => c.id === budget.clientId);
        const now = new Date().toISOString().split("T")[0];

        const isTrafficBudget =
          budget.title.toLowerCase().includes("tráfego") ||
          budget.title.toLowerCase().includes("traffic") ||
          budget.title.toLowerCase().includes("ads") ||
          budget.title.toLowerCase().includes("meta") ||
          budget.title.toLowerCase().includes("google") ||
          budget.description?.toLowerCase().includes("tráfego") ||
          budget.description?.toLowerCase().includes("gestão de tráfego");

        const category = isTrafficBudget
          ? "Gestão de Tráfego"
          : "Serviço de Cliente";

        // Criar transação de receita
        const newTransaction = await transactionService.create(
          {
            type: "income",
            description: `${budget.code} - ${budget.title}`,
            value: budget.totalValue,
            date: now,
            category,
            status: "pending",
            clientId: budget.clientId,
            budgetId: budget.id,
            notes: `Receita gerada automaticamente pela aprovação do orçamento ${budget.code}${client ? ` - Cliente: ${client.name}` : ""}`,
          },
          tenantId || undefined,
        );

        if (newTransaction) {
          setTransactions((prev) => [newTransaction, ...prev]);
        }

        // Se for orçamento de tráfego, criar/atualizar carteira virtual
        if (isTrafficBudget) {
          const wallet = getWalletByClientId(budget.clientId);
          const movementData = {
            type: "deposit" as const,
            value: budget.totalValue,
            date: now,
            description: `Depósito via ${budget.code} - ${budget.title}`,
          };

          if (!wallet) {
            await createWallet(budget.clientId, 0, movementData);
          } else {
            await addWalletMovement(wallet.id, movementData);
          }
        }
      }
    }
  };

  const getBudgetsByClientId = (clientId: number): Budget[] => {
    return budgets.filter((b) => b.clientId === clientId);
  };

  // ========================================
  // ACTIVITIES
  // ========================================
  const addActivity = async (
    activityData: Omit<Activity, "id" | "timestamp" | "read">,
  ) => {
    const newActivity = await activityService.create(
      activityData,
      tenantId || undefined,
    );
    if (newActivity) {
      setActivities((prev) => [newActivity, ...prev].slice(0, 50));
    }
  };

  const markActivityAsRead = async (activityId: number) => {
    const success = await activityService.markAsRead(activityId);
    if (success) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, read: true } : a)),
      );
    }
  };

  const markAllActivitiesAsRead = async () => {
    const success = await activityService.markAllAsRead();
    if (success) {
      setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
    }
  };

  const clearActivities = async () => {
    const success = await activityService.clearAll();
    if (success) {
      setActivities([]);
    }
  };

  const getUnreadActivitiesCount = () => {
    return activities.filter((a) => !a.read).length;
  };

  // ========================================
  // TEAMS
  // ========================================
  const addTeam = async (teamData: { name: string; description?: string }) => {
    const newTeam = await teamService.create(teamData, tenantId || undefined);
    if (newTeam) {
      setTeams((prev) => [newTeam, ...prev]);
    }
  };

  const updateTeam = async (
    teamId: number,
    data: { name?: string; description?: string },
  ) => {
    const updated = await teamService.update(teamId, data);
    if (updated) {
      setTeams((prev) =>
        prev.map((team) => (team.id === teamId ? updated : team)),
      );
    }
  };

  const deleteTeam = async (teamId: number): Promise<boolean> => {
    const success = await teamService.delete(teamId);
    if (success) {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      setTeamMembers((prev) => prev.filter((m) => m.teamId !== teamId));
    }
    return success;
  };

  const addTeamMember = async (
    teamId: number,
    userId: string,
    role: "leader" | "member" = "member",
  ) => {
    const newMember = await teamService.addMember(teamId, userId, role);
    if (newMember) {
      setTeamMembers((prev) => [...prev, newMember]);
    }
  };

  const removeTeamMember = async (memberId: number): Promise<boolean> => {
    const success = await teamService.removeMember(memberId);
    if (success) {
      setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
    return success;
  };

  const getTeamMembers = (teamId: number): TeamMember[] => {
    return teamMembers.filter((m) => m.teamId === teamId);
  };

  return (
    <DataContext.Provider
      value={{
        isLoading,
        leads,
        addLead,
        updateLeadStatus,
        markLeadAsViewed,
        markAllLeadsAsViewed,
        getUnviewedLeadsCount,
        deleteLead,
        convertLeadToClient,
        clients,
        addClient,
        updateClient,
        deleteClient,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        wallets,
        getWalletByClientId,
        createWallet,
        addWalletMovement,
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getClientTransactions,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        updateBudgetStatus,
        getBudgetsByClientId,
        getLeadByClientId,
        getClientByLeadId,
        getClientWithLeadData,
        activities,
        addActivity,
        markActivityAsRead,
        markAllActivitiesAsRead,
        clearActivities,
        getUnreadActivitiesCount,
        teams,
        teamMembers,
        addTeam,
        updateTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        getTeamMembers,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
