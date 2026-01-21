import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  selfRegistered?: boolean; // true se o lead se cadastrou pelo link público
  // Dados para gestão de tráfego
  followers?: number; // número de seguidores
  posts?: number; // número de posts
  monthlyBudget?: number; // orçamento mensal para gestão de tráfego
}

// ========================================
// ANÁLISE DE PERFIL DO CLIENTE
// Adicione/remova campos conforme necessário
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
  segment: string; // Segmento de mercado
  targetAudience: string; // Público-alvo
  mainGoal: ClientGoal; // Objetivo principal
  overallScore: number; // 1-10 avaliação geral
  notes: string; // Observações detalhadas
}
// ========================================

// ========================================
// FINANÇAS
// ========================================
export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";

// Categorias de despesas da empresa
export const EXPENSE_CATEGORIES = [
  "Salários",
  "Ferramentas/Software",
  "Marketing",
  "Infraestrutura",
  "Impostos",
  "Serviços",
  "Outros",
] as const;

// Categorias de receitas
export const INCOME_CATEGORIES = [
  "Serviço de Cliente",
  "Gestão de Tráfego",
  "Consultoria",
  "Projeto Avulso",
  "Outros",
] as const;

// Transação geral da empresa (entrada/saída)
export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  value: number;
  date: string;
  category: string;
  status: TransactionStatus;
  clientId?: number; // Vinculado a um cliente (opcional)
  notes?: string;
}

// Movimentação na carteira virtual do cliente
export interface WalletMovement {
  id: number;
  type: "deposit" | "withdrawal"; // depósito ou saque/gasto
  value: number;
  date: string;
  description: string;
}

// Carteira virtual por cliente (para gestão de tráfego)
export interface ClientWallet {
  id: number;
  clientId: number; // Vinculado ao cliente
  balance: number; // Saldo atual
  movements: WalletMovement[]; // Histórico de movimentações
  createdAt: string;
}
// ========================================

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  projects: number;
  value: number;
  avatar: string;
  responsible?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  leadId?: number; // Referência ao lead original
  origin?: LeadOrigin;
  profileAnalysis?: ProfileAnalysis; // Análise do perfil
}

// Initial Data - Arrays vazios para começar do zero
const initialLeads: Lead[] = [];

const initialClients: Client[] = [];

// Transações iniciais - vazio para começar do zero
const initialTransactions: Transaction[] = [];

// Carteiras virtuais iniciais - vazio para começar do zero
const initialWallets: ClientWallet[] = [];

// Context Interface
interface DataContextType {
  // Leads
  leads: Lead[];
  addLead: (
    lead: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered?: boolean,
  ) => void;
  updateLeadStatus: (leadId: number, status: LeadStatus) => void;
  deleteLead: (leadId: number) => boolean;
  convertLeadToClient: (
    leadId: number,
    clientData?: Partial<Client>,
  ) => Client | null;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (clientId: number, data: Partial<Client>) => void;
  deleteClient: (clientId: number) => boolean;

  // Finanças - Transações
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (
    transactionId: number,
    data: Partial<Transaction>,
  ) => void;
  deleteTransaction: (transactionId: number) => boolean;

  // Finanças - Carteira Virtual
  wallets: ClientWallet[];
  getWalletByClientId: (clientId: number) => ClientWallet | undefined;
  createWallet: (
    clientId: number,
    initialDeposit?: number,
    initialMovement?: Omit<WalletMovement, "id">,
  ) => ClientWallet;
  addWalletMovement: (
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ) => void;

  // Finanças - Cálculos
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getClientTransactions: (clientId: number) => Transaction[];

  // Utils
  getLeadByClientId: (clientId: number) => Lead | undefined;
  getClientByLeadId: (leadId: number) => Client | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// LocalStorage keys
const LEADS_STORAGE_KEY = "turbine_leads";
const CLIENTS_STORAGE_KEY = "turbine_clients";
const TRANSACTIONS_STORAGE_KEY = "turbine_transactions";
const WALLETS_STORAGE_KEY = "turbine_wallets";

// Helper functions para LocalStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() =>
    loadFromStorage(LEADS_STORAGE_KEY, initialLeads),
  );
  const [clients, setClients] = useState<Client[]>(() =>
    loadFromStorage(CLIENTS_STORAGE_KEY, initialClients),
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(TRANSACTIONS_STORAGE_KEY, initialTransactions),
  );
  const [wallets, setWallets] = useState<ClientWallet[]>(() =>
    loadFromStorage(WALLETS_STORAGE_KEY, initialWallets),
  );

  // Salvar no LocalStorage quando os dados mudarem
  useEffect(() => {
    saveToStorage(LEADS_STORAGE_KEY, leads);
  }, [leads]);

  useEffect(() => {
    saveToStorage(CLIENTS_STORAGE_KEY, clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage(TRANSACTIONS_STORAGE_KEY, transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage(WALLETS_STORAGE_KEY, wallets);
  }, [wallets]);

  // Lead Functions
  const addLead = (
    leadData: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered: boolean = false,
  ) => {
    const newLead: Lead = {
      ...leadData,
      id: leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1,
      status: "novo",
      createdAt: new Date().toISOString().split("T")[0],
      selfRegistered,
    };
    setLeads([newLead, ...leads]);
  };

  const updateLeadStatus = (leadId: number, status: LeadStatus) => {
    setLeads(
      leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
    );
  };

  const deleteLead = (leadId: number): boolean => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return false;

    // Se o lead foi convertido em cliente, também remove a referência do cliente
    if (lead.convertedToClientId) {
      setClients(
        clients.map((c) =>
          c.id === lead.convertedToClientId
            ? { ...c, leadId: undefined, origin: undefined }
            : c,
        ),
      );
    }

    setLeads(leads.filter((l) => l.id !== leadId));
    return true;
  };

  const convertLeadToClient = (
    leadId: number,
    clientData?: Partial<Client>,
  ): Client | null => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    // Check if already converted
    if (lead.convertedToClientId) {
      return clients.find((c) => c.id === lead.convertedToClientId) || null;
    }

    const newClientId =
      clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1;

    const newClient: Client = {
      id: newClientId,
      name: lead.company || lead.name,
      email: lead.email,
      phone: lead.phone,
      status: "active",
      projects: 0,
      value: lead.value || 0,
      avatar: "",
      responsible: lead.name,
      leadId: lead.id,
      origin: lead.origin,
      ...clientData,
    };

    setClients([...clients, newClient]);

    // Update lead with client reference and set status to fechado
    setLeads(
      leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: "fechado" as LeadStatus,
              convertedToClientId: newClientId,
            }
          : l,
      ),
    );

    return newClient;
  };

  // Client Functions
  const addClient = (clientData: Omit<Client, "id">) => {
    const newClient: Client = {
      ...clientData,
      id: clients.length > 0 ? Math.max(...clients.map((c) => c.id)) + 1 : 1,
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (clientId: number, data: Partial<Client>) => {
    setClients(
      clients.map((client) =>
        client.id === clientId ? { ...client, ...data } : client,
      ),
    );
  };

  const deleteClient = (clientId: number): boolean => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return false;

    // Se o cliente veio de um lead, remove a referência do lead
    if (client.leadId) {
      setLeads(
        leads.map((l) =>
          l.id === client.leadId ? { ...l, convertedToClientId: undefined } : l,
        ),
      );
    }

    setClients(clients.filter((c) => c.id !== clientId));
    return true;
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

  // ========================================
  // FUNÇÕES DE FINANÇAS
  // ========================================

  // Transações
  const addTransaction = (transactionData: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id:
        transactions.length > 0
          ? Math.max(...transactions.map((t) => t.id)) + 1
          : 1,
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const updateTransaction = (
    transactionId: number,
    data: Partial<Transaction>,
  ) => {
    setTransactions(
      transactions.map((t) => (t.id === transactionId ? { ...t, ...data } : t)),
    );
  };

  const deleteTransaction = (transactionId: number): boolean => {
    const exists = transactions.find((t) => t.id === transactionId);
    if (!exists) return false;
    setTransactions(transactions.filter((t) => t.id !== transactionId));
    return true;
  };

  // Carteira Virtual
  const getWalletByClientId = (clientId: number): ClientWallet | undefined => {
    return wallets.find((w) => w.clientId === clientId);
  };

  const createWallet = (
    clientId: number,
    initialDeposit: number = 0,
    initialMovement?: Omit<WalletMovement, "id">,
  ): ClientWallet => {
    const existingWallet = getWalletByClientId(clientId);
    if (existingWallet) return existingWallet;

    let movements: WalletMovement[] = [];
    let balance = 0;

    // Se tem movimento inicial customizado, usar ele
    if (initialMovement) {
      movements = [{ ...initialMovement, id: 1 }];
      balance =
        initialMovement.type === "deposit"
          ? initialMovement.value
          : -initialMovement.value;
    } else if (initialDeposit > 0) {
      // Senão, se tem depósito inicial, criar movimento de depósito
      movements = [
        {
          id: 1,
          type: "deposit",
          value: initialDeposit,
          date: new Date().toISOString().split("T")[0],
          description: "Depósito inicial",
        },
      ];
      balance = initialDeposit;
    }

    const newWallet: ClientWallet = {
      id: wallets.length > 0 ? Math.max(...wallets.map((w) => w.id)) + 1 : 1,
      clientId,
      balance,
      createdAt: new Date().toISOString().split("T")[0],
      movements,
    };
    setWallets([...wallets, newWallet]);
    return newWallet;
  };

  const addWalletMovement = (
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ) => {
    setWallets(
      wallets.map((wallet) => {
        if (wallet.id !== walletId) return wallet;

        const newMovementId =
          wallet.movements.length > 0
            ? Math.max(...wallet.movements.map((m) => m.id)) + 1
            : 1;
        const newMovement: WalletMovement = { ...movement, id: newMovementId };

        const newBalance =
          movement.type === "deposit"
            ? wallet.balance + movement.value
            : wallet.balance - movement.value;

        return {
          ...wallet,
          balance: newBalance,
          movements: [newMovement, ...wallet.movements],
        };
      }),
    );
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

  return (
    <DataContext.Provider
      value={{
        leads,
        addLead,
        updateLeadStatus,
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
        getLeadByClientId,
        getClientByLeadId,
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
