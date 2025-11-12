export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          account_number: string | null
          application_data: Json
          credit_limit: number | null
          id: string
          interest_rate: number | null
          loan_amount: number | null
          loan_term: string | null
          product_type: string
          status: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          application_data: Json
          credit_limit?: number | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number | null
          loan_term?: string | null
          product_type: string
          status?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          application_data?: Json
          credit_limit?: number | null
          id?: string
          interest_rate?: number | null
          loan_amount?: number | null
          loan_term?: string | null
          product_type?: string
          status?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          address: string | null
          balance: number | null
          created_at: string | null
          currency: string | null
          full_name: string | null
          gender: string | null
          id: string
          nin_number: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          address?: string | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nin_number?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          address?: string | null
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          nin_number?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_cards: {
        Row: {
          account_id: string
          card_holder_name: string
          card_number: string
          card_type: string
          category: string
          created_at: string
          currency: string
          cvv: string
          expiry_date: string
          id: string
          is_physical: boolean
          status: string
          user_id: string
        }
        Insert: {
          account_id: string
          card_holder_name: string
          card_number: string
          card_type: string
          category: string
          created_at?: string
          currency: string
          cvv: string
          expiry_date: string
          id?: string
          is_physical?: boolean
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string
          card_holder_name?: string
          card_number?: string
          card_type?: string
          category?: string
          created_at?: string
          currency?: string
          cvv?: string
          expiry_date?: string
          id?: string
          is_physical?: boolean
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          created_at: string | null
          extracted_data: Json | null
          id: string
          intent: string | null
          messages: Json
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          intent?: string | null
          messages: Json
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          intent?: string | null
          messages?: Json
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          account_id: string
          ai_analysis: Json | null
          created_at: string
          decision_at: string | null
          id: string
          interest_rate: number
          loan_amount: number
          loan_purpose: string
          loan_term_months: number
          monthly_payment: number
          requested_at: string
          status: string
          total_repayment: number
          user_id: string
        }
        Insert: {
          account_id: string
          ai_analysis?: Json | null
          created_at?: string
          decision_at?: string | null
          id?: string
          interest_rate: number
          loan_amount: number
          loan_purpose: string
          loan_term_months: number
          monthly_payment: number
          requested_at?: string
          status?: string
          total_repayment: number
          user_id: string
        }
        Update: {
          account_id?: string
          ai_analysis?: Json | null
          created_at?: string
          decision_at?: string | null
          id?: string
          interest_rate?: number
          loan_amount?: number
          loan_purpose?: string
          loan_term_months?: number
          monthly_payment?: number
          requested_at?: string
          status?: string
          total_repayment?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          annual_income: number
          banking_goal: string | null
          city: string
          created_at: string | null
          date_of_birth: string
          email: string
          employer_name: string | null
          employment_duration: string | null
          employment_status: string
          existing_checking: boolean | null
          existing_credit_cards: number | null
          existing_savings: boolean | null
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          monthly_expenses: number | null
          onboarding_completed: boolean | null
          phone: string
          residence_type: string | null
          ssn_last_four: string
          state: string
          street_address: string
          updated_at: string | null
          years_at_address: string | null
          zip_code: string
        }
        Insert: {
          annual_income: number
          banking_goal?: string | null
          city: string
          created_at?: string | null
          date_of_birth: string
          email: string
          employer_name?: string | null
          employment_duration?: string | null
          employment_status: string
          existing_checking?: boolean | null
          existing_credit_cards?: number | null
          existing_savings?: boolean | null
          first_name: string
          id: string
          job_title?: string | null
          last_name: string
          monthly_expenses?: number | null
          onboarding_completed?: boolean | null
          phone: string
          residence_type?: string | null
          ssn_last_four: string
          state: string
          street_address: string
          updated_at?: string | null
          years_at_address?: string | null
          zip_code: string
        }
        Update: {
          annual_income?: number
          banking_goal?: string | null
          city?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          employer_name?: string | null
          employment_duration?: string | null
          employment_status?: string
          existing_checking?: boolean | null
          existing_credit_cards?: number | null
          existing_savings?: boolean | null
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          monthly_expenses?: number | null
          onboarding_completed?: boolean | null
          phone?: string
          residence_type?: string | null
          ssn_last_four?: string
          state?: string
          street_address?: string
          updated_at?: string | null
          years_at_address?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          created_at: string
          description: string
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          created_at?: string
          description: string
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
