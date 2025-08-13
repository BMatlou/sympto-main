export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_sessions: {
        Row: {
          activity_type: string
          average_heart_rate: number | null
          calories_burned: number | null
          created_at: string | null
          device_id: string | null
          distance_meters: number | null
          duration_minutes: number
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          average_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_id?: string | null
          distance_meters?: number | null
          duration_minutes: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at: string
          user_id: string
        }
        Update: {
          activity_type?: string
          average_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string | null
          device_id?: string | null
          distance_meters?: number | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          doctor_name: string
          id: string
          location: string | null
          notes: string | null
          specialty: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          video_link: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          doctor_name: string
          id?: string
          location?: string | null
          notes?: string | null
          specialty?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          video_link?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          doctor_name?: string
          id?: string
          location?: string | null
          notes?: string | null
          specialty?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          video_link?: string | null
        }
        Relationships: []
      }
      connected_fitness_apps: {
        Row: {
          app_name: string
          app_type: string
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          sync_data: Json | null
          user_id: string
        }
        Insert: {
          app_name: string
          app_type: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          sync_data?: Json | null
          user_id: string
        }
        Update: {
          app_name?: string
          app_type?: string
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          sync_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          model: string | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          model?: string | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          model?: string | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_type: string
          id: string
          is_active: boolean | null
          target_date: string | null
          target_value: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value: number
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_value?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          device_id: string | null
          id: string
          metric_type: string
          recorded_at: string | null
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          metric_type: string
          recorded_at?: string | null
          unit: string
          user_id: string
          value: number
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          metric_type?: string
          recorded_at?: string | null
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string | null
          date_of_record: string | null
          description: string | null
          doctor_name: string | null
          facility_name: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          record_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_record?: string | null
          description?: string | null
          doctor_name?: string | null
          facility_name?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          record_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_record?: string | null
          description?: string | null
          doctor_name?: string | null
          facility_name?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          record_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_info: {
        Row: {
          contraindications: string[] | null
          created_at: string | null
          description: string | null
          dosage_forms: string[] | null
          drug_interactions: string[] | null
          id: string
          masked_symptoms: string[] | null
          medication_name: string
          side_effects: string[] | null
          updated_at: string | null
          warnings: string[] | null
        }
        Insert: {
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          dosage_forms?: string[] | null
          drug_interactions?: string[] | null
          id?: string
          masked_symptoms?: string[] | null
          medication_name: string
          side_effects?: string[] | null
          updated_at?: string | null
          warnings?: string[] | null
        }
        Update: {
          contraindications?: string[] | null
          created_at?: string | null
          description?: string | null
          dosage_forms?: string[] | null
          drug_interactions?: string[] | null
          id?: string
          masked_symptoms?: string[] | null
          medication_name?: string
          side_effects?: string[] | null
          updated_at?: string | null
          warnings?: string[] | null
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string | null
          dosage_taken: string | null
          id: string
          medication_id: string
          notes: string | null
          skipped: boolean | null
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage_taken?: string | null
          id?: string
          medication_id: string
          notes?: string | null
          skipped?: boolean | null
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage_taken?: string | null
          id?: string
          medication_id?: string
          notes?: string | null
          skipped?: boolean | null
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reminders: {
        Row: {
          created_at: string | null
          days_of_week: number[]
          id: string
          is_active: boolean | null
          medication_id: string
          reminder_time: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week: number[]
          id?: string
          is_active?: boolean | null
          medication_id: string
          reminder_time: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[]
          id?: string
          is_active?: boolean | null
          medication_id?: string
          reminder_time?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          name: string
          notes: string | null
          prescribing_doctor: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          name: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          name?: string
          notes?: string | null
          prescribing_doctor?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_log: {
        Row: {
          calories: number | null
          created_at: string | null
          food_item: string
          id: string
          logged_at: string | null
          macros: Json | null
          meal_type: string
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          food_item: string
          id?: string
          logged_at?: string | null
          macros?: Json | null
          meal_type: string
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          food_item?: string
          id?: string
          logged_at?: string | null
          macros?: Json | null
          meal_type?: string
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sensitive_data: {
        Row: {
          created_at: string | null
          data: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          data?: string | null
          id?: number
        }
        Relationships: []
      }
      symptoms_library: {
        Row: {
          category: string
          common_triggers: string[] | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          severity_indicators: Json | null
        }
        Insert: {
          category: string
          common_triggers?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          severity_indicators?: Json | null
        }
        Update: {
          category?: string
          common_triggers?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          severity_indicators?: Json | null
        }
        Relationships: []
      }
      symptoms_log: {
        Row: {
          created_at: string | null
          description: string | null
          environmental_data: Json | null
          id: string
          location_data: Json | null
          logged_at: string | null
          notes: string | null
          severity: number | null
          symptom: string
          triggers: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environmental_data?: Json | null
          id?: string
          location_data?: Json | null
          logged_at?: string | null
          notes?: string | null
          severity?: number | null
          symptom: string
          triggers?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environmental_data?: Json | null
          id?: string
          location_data?: Json | null
          logged_at?: string | null
          notes?: string | null
          severity?: number | null
          symptom?: string
          triggers?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          age: number | null
          allergies: string[] | null
          citizenship_status: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          id_number: string | null
          medical_conditions: string[] | null
          passport_number: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
          weight_kg: number | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          citizenship_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          id_number?: string | null
          medical_conditions?: string[] | null
          passport_number?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          citizenship_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          id_number?: string | null
          medical_conditions?: string[] | null
          passport_number?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          anonymous_analytics_enabled: boolean | null
          biometric_lock_enabled: boolean | null
          created_at: string | null
          fitness_app_sync_enabled: boolean | null
          health_data_sharing_enabled: boolean | null
          id: string
          notification_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anonymous_analytics_enabled?: boolean | null
          biometric_lock_enabled?: boolean | null
          created_at?: string | null
          fitness_app_sync_enabled?: boolean | null
          health_data_sharing_enabled?: boolean | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anonymous_analytics_enabled?: boolean | null
          biometric_lock_enabled?: boolean | null
          created_at?: string | null
          fitness_app_sync_enabled?: boolean | null
          health_data_sharing_enabled?: boolean | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string | null
          id: string
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          id?: string
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          id?: string
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_health_score: {
        Args:
          | Record<PropertyKey, never>
          | { id_number: string }
          | { patient_id: number }
          | { user_id: number; assessment_date?: string }
          | { user_uuid: string; target_date?: string }
        Returns: number
      }
      can_access_sensitive_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      decode_sa_id: {
        Args: { id_number: string }
        Returns: Json
      }
      is_mfa_verified: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_password: {
        Args: { password: string }
        Returns: undefined
      }
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
