// ========================================
// Tipos do Supabase Database
// Gerado manualmente baseado no schema
// ========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadStatus = "novo" | "contato" | "proposta" | "fechado";
export type LeadOrigin =
  | "site"
  | "instagram"
  | "facebook"
  | "indicacao"
  | "google"
  | "outro";
export type ClientStatus = "active" | "pending" | "inactive";
export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";
export type BudgetStatus = "draft" | "sent" | "approved" | "rejected";
export type ClientGoal = "sales" | "engagement" | "branding" | "leads";
export type ActivityType =
  | "lead"
  | "client"
  | "transaction"
  | "budget"
  | "wallet";
export type WalletMovementType = "deposit" | "withdrawal";

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string;
          company: string | null;
          status: LeadStatus;
          origin: LeadOrigin;
          value: number | null;
          created_at: string;
          notes: string | null;
          converted_to_client_id: number | null;
          self_registered: boolean;
          viewed: boolean;
          followers: number | null;
          posts: number | null;
          monthly_budget: number | null;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          phone: string;
          company?: string | null;
          status?: LeadStatus;
          origin: LeadOrigin;
          value?: number | null;
          created_at?: string;
          notes?: string | null;
          converted_to_client_id?: number | null;
          self_registered?: boolean;
          viewed?: boolean;
          followers?: number | null;
          posts?: number | null;
          monthly_budget?: number | null;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string;
          company?: string | null;
          status?: LeadStatus;
          origin?: LeadOrigin;
          value?: number | null;
          created_at?: string;
          notes?: string | null;
          converted_to_client_id?: number | null;
          self_registered?: boolean;
          viewed?: boolean;
          followers?: number | null;
          posts?: number | null;
          monthly_budget?: number | null;
        };
      };
      clients: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string;
          status: ClientStatus;
          projects: number;
          value: number;
          avatar: string | null;
          responsible: string | null;
          social_media: Json | null;
          lead_id: number | null;
          origin: LeadOrigin | null;
          converted_at: string | null;
          profile_analysis: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          phone: string;
          status?: ClientStatus;
          projects?: number;
          value?: number;
          avatar?: string | null;
          responsible?: string | null;
          social_media?: Json | null;
          lead_id?: number | null;
          origin?: LeadOrigin | null;
          converted_at?: string | null;
          profile_analysis?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string;
          status?: ClientStatus;
          projects?: number;
          value?: number;
          avatar?: string | null;
          responsible?: string | null;
          social_media?: Json | null;
          lead_id?: number | null;
          origin?: LeadOrigin | null;
          converted_at?: string | null;
          profile_analysis?: Json | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          type: TransactionType;
          description: string;
          value: number;
          date: string;
          category: string;
          status: TransactionStatus;
          client_id: number | null;
          budget_id: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          type: TransactionType;
          description: string;
          value: number;
          date: string;
          category: string;
          status?: TransactionStatus;
          client_id?: number | null;
          budget_id?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          type?: TransactionType;
          description?: string;
          value?: number;
          date?: string;
          category?: string;
          status?: TransactionStatus;
          client_id?: number | null;
          budget_id?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: number;
          client_id: number;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          client_id: number;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          client_id?: number;
          balance?: number;
          created_at?: string;
        };
      };
      wallet_movements: {
        Row: {
          id: number;
          wallet_id: number;
          type: WalletMovementType;
          value: number;
          date: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          wallet_id: number;
          type: WalletMovementType;
          value: number;
          date: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          wallet_id?: number;
          type?: WalletMovementType;
          value?: number;
          date?: string;
          description?: string;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: number;
          code: string;
          client_id: number;
          title: string;
          description: string | null;
          items: Json;
          total_value: number;
          status: BudgetStatus;
          created_at: string;
          valid_until: string;
          sent_at: string | null;
          approved_at: string | null;
          rejected_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: number;
          code: string;
          client_id: number;
          title: string;
          description?: string | null;
          items: Json;
          total_value: number;
          status?: BudgetStatus;
          created_at?: string;
          valid_until: string;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: number;
          code?: string;
          client_id?: number;
          title?: string;
          description?: string | null;
          items?: Json;
          total_value?: number;
          status?: BudgetStatus;
          created_at?: string;
          valid_until?: string;
          sent_at?: string | null;
          approved_at?: string | null;
          rejected_at?: string | null;
          notes?: string | null;
        };
      };
      activities: {
        Row: {
          id: number;
          type: ActivityType;
          title: string;
          description: string;
          timestamp: string;
          read: boolean;
          icon: string | null;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          type: ActivityType;
          title: string;
          description: string;
          timestamp?: string;
          read?: boolean;
          icon?: string | null;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          type?: ActivityType;
          title?: string;
          description?: string;
          timestamp?: string;
          read?: boolean;
          icon?: string | null;
          link?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lead_status: LeadStatus;
      lead_origin: LeadOrigin;
      client_status: ClientStatus;
      transaction_type: TransactionType;
      transaction_status: TransactionStatus;
      budget_status: BudgetStatus;
      client_goal: ClientGoal;
      activity_type: ActivityType;
      wallet_movement_type: WalletMovementType;
    };
  };
}
