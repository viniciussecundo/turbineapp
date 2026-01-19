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

// Initial Data
const initialLeads: Lead[] = [
  {
    id: 1,
    name: "Carlos Mendes",
    email: "carlos@empresa.com",
    phone: "(11) 99999-1111",
    company: "Empresa ABC",
    status: "novo",
    origin: "site",
    value: 15000,
    createdAt: "2026-01-15",
  },
  {
    id: 2,
    name: "Ana Paula Silva",
    email: "ana.paula@gmail.com",
    phone: "(21) 98888-2222",
    company: "Studio Design",
    status: "contato",
    origin: "instagram",
    value: 8500,
    createdAt: "2026-01-14",
  },
  {
    id: 3,
    name: "Roberto Lima",
    email: "roberto@techcorp.com",
    phone: "(31) 97777-3333",
    company: "TechCorp",
    status: "proposta",
    origin: "indicacao",
    value: 32000,
    createdAt: "2026-01-12",
  },
  {
    id: 4,
    name: "Mariana Costa",
    email: "mariana@startup.io",
    phone: "(41) 96666-4444",
    company: "Startup.io",
    status: "fechado",
    origin: "google",
    value: 25000,
    createdAt: "2026-01-10",
    convertedToClientId: 6,
  },
  {
    id: 5,
    name: "Fernando Oliveira",
    email: "fernando@oliveira.com",
    phone: "(51) 95555-5555",
    status: "novo",
    origin: "facebook",
    value: 12000,
    createdAt: "2026-01-16",
  },
  {
    id: 6,
    name: "Juliana Martins",
    email: "juliana@agencia.com",
    phone: "(11) 94444-6666",
    company: "Agência Digital",
    status: "contato",
    origin: "site",
    value: 18000,
    createdAt: "2026-01-13",
  },
];

const initialClients: Client[] = [
  {
    id: 1,
    name: "Tech Solutions Ltda",
    email: "contato@techsolutions.com.br",
    phone: "(11) 99999-1234",
    status: "active",
    projects: 5,
    value: 75000,
    avatar:
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
    responsible: "João Silva",
  },
  {
    id: 2,
    name: "Marketing Digital Pro",
    email: "admin@mdpro.com",
    phone: "(21) 98888-5678",
    status: "active",
    projects: 3,
    value: 42000,
    avatar:
      "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop",
    responsible: "Maria Santos",
  },
  {
    id: 3,
    name: "E-commerce Master",
    email: "suporte@emaster.com.br",
    phone: "(31) 97777-9012",
    status: "pending",
    projects: 2,
    value: 28000,
    avatar: "",
    responsible: "Pedro Costa",
  },
  {
    id: 4,
    name: "Startup Innovation",
    email: "hello@startupinno.io",
    phone: "(41) 96666-3456",
    status: "inactive",
    projects: 1,
    value: 15000,
    avatar:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Digital Agency Co",
    email: "contact@dagency.com",
    phone: "(51) 95555-7890",
    status: "active",
    projects: 8,
    value: 120000,
    avatar: "",
    responsible: "Ana Lima",
  },
  {
    id: 6,
    name: "Startup.io",
    email: "mariana@startup.io",
    phone: "(41) 96666-4444",
    status: "active",
    projects: 1,
    value: 25000,
    avatar: "",
    responsible: "Mariana Costa",
    leadId: 4,
    origin: "google",
  },
];

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

  // Utils
  getLeadByClientId: (clientId: number) => Lead | undefined;
  getClientByLeadId: (leadId: number) => Client | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// LocalStorage keys
const LEADS_STORAGE_KEY = "turbine_leads";
const CLIENTS_STORAGE_KEY = "turbine_clients";

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

  // Salvar no LocalStorage quando os dados mudarem
  useEffect(() => {
    saveToStorage(LEADS_STORAGE_KEY, leads);
  }, [leads]);

  useEffect(() => {
    saveToStorage(CLIENTS_STORAGE_KEY, clients);
  }, [clients]);

  // Lead Functions
  const addLead = (
    leadData: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered: boolean = false,
  ) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.max(...leads.map((l) => l.id), 0) + 1,
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

    const newClientId = Math.max(...clients.map((c) => c.id), 0) + 1;

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
      id: Math.max(...clients.map((c) => c.id), 0) + 1,
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
