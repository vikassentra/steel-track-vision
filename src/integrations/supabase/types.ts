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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      benchmarks: {
        Row: {
          company: string
          id: number
          intensity_value: number
          site: string | null
          type: string
          year: string
        }
        Insert: {
          company: string
          id?: number
          intensity_value: number
          site?: string | null
          type: string
          year: string
        }
        Update: {
          company?: string
          id?: number
          intensity_value?: number
          site?: string | null
          type?: string
          year?: string
        }
        Relationships: []
      }
      emissions_data: {
        Row: {
          activity_data_value: number | null
          co2e_value: number | null
          driver_name: string
          ef_source: string | null
          ef_unit: string | null
          emission_factor: number | null
          facility_name: string
          id: number
          is_accepted: number | null
          is_product: number | null
          is_to_be_subtracted: number | null
          plant_name: string
          scope_category_name: string
          scope_name: string
          source: string | null
          timestamp: string
          user_type: string | null
        }
        Insert: {
          activity_data_value?: number | null
          co2e_value?: number | null
          driver_name: string
          ef_source?: string | null
          ef_unit?: string | null
          emission_factor?: number | null
          facility_name: string
          id?: number
          is_accepted?: number | null
          is_product?: number | null
          is_to_be_subtracted?: number | null
          plant_name: string
          scope_category_name: string
          scope_name: string
          source?: string | null
          timestamp: string
          user_type?: string | null
        }
        Update: {
          activity_data_value?: number | null
          co2e_value?: number | null
          driver_name?: string
          ef_source?: string | null
          ef_unit?: string | null
          emission_factor?: number | null
          facility_name?: string
          id?: number
          is_accepted?: number | null
          is_product?: number | null
          is_to_be_subtracted?: number | null
          plant_name?: string
          scope_category_name?: string
          scope_name?: string
          source?: string | null
          timestamp?: string
          user_type?: string | null
        }
        Relationships: []
      }
      kpi_values: {
        Row: {
          id: number
          metric_name: string
          unit: string
          updated_at: string | null
          value: number
        }
        Insert: {
          id?: number
          metric_name: string
          unit: string
          updated_at?: string | null
          value: number
        }
        Update: {
          id?: number
          metric_name?: string
          unit?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      plant_kpis: {
        Row: {
          id: number
          intensity: number
          plant_name: string
          production: number
          s1_intensity: number
          s2_intensity: number
          s3_intensity: number
          s3_mining_intensity: number
          total_emissions: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          intensity: number
          plant_name: string
          production?: number
          s1_intensity?: number
          s2_intensity?: number
          s3_intensity?: number
          s3_mining_intensity?: number
          total_emissions: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          intensity?: number
          plant_name?: string
          production?: number
          s1_intensity?: number
          s2_intensity?: number
          s3_intensity?: number
          s3_mining_intensity?: number
          total_emissions?: number
          updated_at?: string | null
        }
        Relationships: []
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
