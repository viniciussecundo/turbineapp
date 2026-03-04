// ========================================
// Tipos do Supabase Database — Multi-tenant
// ========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
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
export type UserRole = "admin" | "sales" | "finance" | "viewer";
export type ProfileStatus = "active" | "pending" | "blocked";
export type TenantStatus = "active" | "suspended" | "cancelled";
export type TenantPlan = "starter" | "pro" | "enterprise";
export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          plan: TenantPlan;
          status: TenantStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan?: TenantPlan;
          status?: TenantStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: TenantPlan;
          status?: TenantStatus;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string | null;
          role: UserRole;
          status: ProfileStatus;
          is_master_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          tenant_id: string;
          full_name?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          is_master_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          is_master_admin?: boolean;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: number;
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          tenant_id: string;
          client_id: number;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          tenant_id: string;
          client_id: number;
          balance?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          tenant_id?: string;
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
          tenant_id: string;
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
          tenant_id: string;
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
          tenant_id?: string;
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
      invitations: {
        Row: {
          id: string;
          tenant_id: string;
          token: string;
          role: UserRole;
          invited_email: string | null;
          status: InvitationStatus;
          created_by: string;
          accepted_by: string | null;
          expires_at: string;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          token?: string;
          role?: UserRole;
          invited_email?: string | null;
          status?: InvitationStatus;
          created_by: string;
          accepted_by?: string | null;
          expires_at?: string;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          token?: string;
          role?: UserRole;
          invited_email?: string | null;
          status?: InvitationStatus;
          created_by?: string;
          accepted_by?: string | null;
          expires_at?: string;
          created_at?: string;
          accepted_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_tenant_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_master_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_tenant_with_profile: {
        Args: {
          p_tenant_name: string;
          p_full_name: string;
        };
        Returns: Json;
      };
      update_member_role: {
        Args: {
          p_user_id: string;
          p_role: UserRole;
        };
        Returns: undefined;
      };
      update_member_status: {
        Args: {
          p_user_id: string;
          p_status: ProfileStatus;
        };
        Returns: undefined;
      };
      remove_tenant_member: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      create_invitation: {
        Args: {
          p_role?: UserRole;
          p_invited_email?: string | null;
          p_expires_in_days?: number;
        };
        Returns: Json;
      };
      get_invitation_by_token: {
        Args: {
          p_token: string;
        };
        Returns: Json;
      };
      accept_invitation: {
        Args: {
          p_token: string;
          p_full_name: string;
        };
        Returns: Json;
      };
      revoke_invitation: {
        Args: {
          p_invitation_id: string;
        };
        Returns: undefined;
      };
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
      user_role: UserRole;
      profile_status: ProfileStatus;
      tenant_status: TenantStatus;
      tenant_plan: TenantPlan;
      invitation_status: InvitationStatus;
    };
  };
}
