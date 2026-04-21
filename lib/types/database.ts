export type AiSummary = {
  hechos_clave?: string[];
  normas_sugeridas?: { norma: string; articulo?: string; relevancia: string }[];
  riesgos?: string[];
  resumen?: string;
  generado_at?: string;
  modelo?: string;
};

/** Payload versionado guardado en documentos.extraction_report (Gemini / edición manual). */
export type DocumentExtractionReport = {
  schema_version: number;
  clasificacion?: {
    tipo_documento_detectado?: string;
    idioma?: string;
    resumen_corto?: string;
  };
  partes_y_proceso?: {
    personas_juridicas?: {
      nombre?: string;
      rol?: string;
      identificadores?: string;
    }[];
    personas_fisicas?: {
      nombre?: string;
      rol?: string;
      documento?: string;
    }[];
    organos_jurisdiccionales?: { nombre?: string; referencia?: string }[];
    fechas_relevantes?: { descripcion?: string; fecha?: string }[];
    referencias_procesales?: string[];
  };
  aspecto_patrimonial?: {
    importes?: {
      concepto?: string;
      importe?: string;
      moneda?: string;
    }[];
    lineas_detalle?: {
      descripcion?: string;
      cantidad?: string;
      importe?: string;
    }[];
  };
  otros?: {
    observaciones?: string;
    campos_adicionales?: Record<string, string>;
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      despachos: {
        Row: {
          id: string;
          nombre: string;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          plan?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          despacho_id: string;
          nombre: string;
          apellido: string;
          rol: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          despacho_id: string;
          nombre: string;
          apellido: string;
          rol?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          despacho_id?: string;
          nombre?: string;
          apellido?: string;
          rol?: string;
          email?: string;
          updated_at?: string;
        };
      };
      expedientes: {
        Row: {
          id: string;
          despacho_id: string;
          created_by: string;
          numero_expediente: string;
          titulo: string;
          tipo: string;
          estado: string;
          descripcion: string | null;
          notas: string | null;
          jurisdiccion: string | null;
          sede: string | null;
          cuantia: number | null;
          estado_procesal: string;
          etiquetas: string[];
          ai_summary: AiSummary | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          despacho_id: string;
          created_by: string;
          numero_expediente: string;
          titulo: string;
          tipo: string;
          estado?: string;
          descripcion?: string | null;
          notas?: string | null;
          jurisdiccion?: string | null;
          sede?: string | null;
          cuantia?: number | null;
          estado_procesal?: string;
          etiquetas?: string[];
          ai_summary?: AiSummary | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          numero_expediente?: string;
          titulo?: string;
          tipo?: string;
          estado?: string;
          descripcion?: string | null;
          notas?: string | null;
          jurisdiccion?: string | null;
          sede?: string | null;
          cuantia?: number | null;
          estado_procesal?: string;
          etiquetas?: string[];
          ai_summary?: AiSummary | null;
          updated_at?: string;
        };
      };
      documentos: {
        Row: {
          id: string;
          expediente_id: string;
          uploaded_by: string;
          nombre: string;
          storage_path: string;
          tipo_documento: string;
          mime_type: string;
          size_bytes: number;
          origen: string;
          validado_por: string | null;
          validado_at: string | null;
          extraction_status?: string;
          extraction_report?: DocumentExtractionReport | null;
          extraction_error?: string | null;
          extraction_at?: string | null;
          extraction_model?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          uploaded_by: string;
          nombre: string;
          storage_path: string;
          tipo_documento?: string;
          mime_type: string;
          size_bytes: number;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          extraction_status?: string;
          extraction_report?: DocumentExtractionReport | null;
          extraction_error?: string | null;
          extraction_at?: string | null;
          extraction_model?: string | null;
          created_at?: string;
        };
        Update: {
          nombre?: string;
          tipo_documento?: string;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          extraction_status?: string;
          extraction_report?: DocumentExtractionReport | null;
          extraction_error?: string | null;
          extraction_at?: string | null;
          extraction_model?: string | null;
        };
      };
      sujetos: {
        Row: {
          id: string;
          expediente_id: string;
          nombre: string;
          rol_procesal: string;
          tipo_sujeto: string;
          dni: string | null;
          contacto: string | null;
          email: string | null;
          telefono: string | null;
          notas: string | null;
          origen: string;
          validado_por: string | null;
          validado_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          nombre: string;
          rol_procesal: string;
          tipo_sujeto?: string;
          dni?: string | null;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          notas?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nombre?: string;
          rol_procesal?: string;
          tipo_sujeto?: string;
          dni?: string | null;
          contacto?: string | null;
          email?: string | null;
          telefono?: string | null;
          notas?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          updated_at?: string;
        };
      };
      facturas: {
        Row: {
          id: string;
          expediente_id: string;
          documento_id: string | null;
          numero_factura: string;
          emisor: string;
          receptor: string;
          fecha: string;
          base_imponible: number;
          iva: number;
          total: number;
          estado_validacion: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          documento_id?: string | null;
          numero_factura: string;
          emisor: string;
          receptor: string;
          fecha: string;
          base_imponible: number;
          iva: number;
          total: number;
          estado_validacion?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          numero_factura?: string;
          emisor?: string;
          receptor?: string;
          fecha?: string;
          base_imponible?: number;
          iva?: number;
          total?: number;
          estado_validacion?: string;
          updated_at?: string;
        };
      };
      eventos: {
        Row: {
          id: string;
          expediente_id: string;
          created_by: string;
          tipo_evento: string;
          titulo: string;
          descripcion: string | null;
          fecha_evento: string;
          fecha_vencimiento: string | null;
          completado: boolean;
          origen: string;
          validado_por: string | null;
          validado_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          created_by: string;
          tipo_evento: string;
          titulo: string;
          descripcion?: string | null;
          fecha_evento: string;
          fecha_vencimiento?: string | null;
          completado?: boolean;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tipo_evento?: string;
          titulo?: string;
          descripcion?: string | null;
          fecha_evento?: string;
          fecha_vencimiento?: string | null;
          completado?: boolean;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          updated_at?: string;
        };
      };
      activos: {
        Row: {
          id: string;
          expediente_id: string;
          created_by: string;
          tipo: string;
          categoria: string;
          descripcion: string;
          valor_estimado: number | null;
          moneda: string;
          referencia_registral: string | null;
          notas: string | null;
          origen: string;
          validado_por: string | null;
          validado_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          created_by: string;
          tipo: string;
          categoria: string;
          descripcion: string;
          valor_estimado?: number | null;
          moneda?: string;
          referencia_registral?: string | null;
          notas?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tipo?: string;
          categoria?: string;
          descripcion?: string;
          valor_estimado?: number | null;
          moneda?: string;
          referencia_registral?: string | null;
          notas?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          updated_at?: string;
        };
      };
      fundamentos: {
        Row: {
          id: string;
          expediente_id: string;
          created_by: string;
          tipo: string;
          norma: string;
          articulo: string | null;
          descripcion: string | null;
          url: string | null;
          origen: string;
          validado_por: string | null;
          validado_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          created_by: string;
          tipo: string;
          norma: string;
          articulo?: string | null;
          descripcion?: string | null;
          url?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          tipo?: string;
          norma?: string;
          articulo?: string | null;
          descripcion?: string | null;
          url?: string | null;
          origen?: string;
          validado_por?: string | null;
          validado_at?: string | null;
          updated_at?: string;
        };
      };
      ius_reward_rules: {
        Row: {
          id: string;
          action_key: string;
          description: string | null;
          amount: number;
          active: boolean;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          action_key: string;
          description?: string | null;
          amount: number;
          active?: boolean;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          action_key?: string;
          description?: string | null;
          amount?: number;
          active?: boolean;
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      ius_wallets: {
        Row: {
          profile_id: string;
          despacho_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          despacho_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          despacho_id?: string;
          balance?: number;
          updated_at?: string;
        };
      };
      ius_ledger: {
        Row: {
          id: string;
          profile_id: string;
          despacho_id: string;
          delta: number;
          reason: string;
          ref_type: string | null;
          ref_id: string | null;
          idempotency_key: string | null;
          meta: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          despacho_id: string;
          delta: number;
          reason: string;
          ref_type?: string | null;
          ref_id?: string | null;
          idempotency_key?: string | null;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          meta?: Record<string, unknown>;
        };
      };
      missions: {
        Row: {
          id: string;
          despacho_id: string | null;
          slug: string;
          title: string;
          description: string | null;
          mission_type: string;
          status: string;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          despacho_id?: string | null;
          slug: string;
          title: string;
          description?: string | null;
          mission_type?: string;
          status?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          despacho_id?: string | null;
          slug?: string;
          title?: string;
          description?: string | null;
          mission_type?: string;
          status?: string;
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      mission_runs: {
        Row: {
          id: string;
          mission_id: string;
          profile_id: string;
          despacho_id: string;
          expediente_id: string | null;
          documento_id: string | null;
          current_step: string;
          status: string;
          context_artifact: Record<string, unknown>;
          extractor_output: Record<string, unknown> | null;
          validator_output: Record<string, unknown> | null;
          planner_output: Record<string, unknown> | null;
          writer_output: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mission_id: string;
          profile_id: string;
          despacho_id: string;
          expediente_id?: string | null;
          documento_id?: string | null;
          current_step?: string;
          status?: string;
          context_artifact?: Record<string, unknown>;
          extractor_output?: Record<string, unknown> | null;
          validator_output?: Record<string, unknown> | null;
          planner_output?: Record<string, unknown> | null;
          writer_output?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          expediente_id?: string | null;
          documento_id?: string | null;
          current_step?: string;
          status?: string;
          context_artifact?: Record<string, unknown>;
          extractor_output?: Record<string, unknown> | null;
          validator_output?: Record<string, unknown> | null;
          planner_output?: Record<string, unknown> | null;
          writer_output?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      mission_step_events: {
        Row: {
          id: string;
          run_id: string;
          step_key: string;
          level: string;
          message: string;
          meta: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          step_key: string;
          level?: string;
          message: string;
          meta?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          message?: string;
          meta?: Record<string, unknown>;
        };
      };
      hitl_reviews: {
        Row: {
          id: string;
          run_id: string;
          reviewed_by: string;
          action: string;
          entity_mapping: Record<string, unknown>;
          risk_acknowledged: boolean;
          economic_alert_notes: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          reviewed_by: string;
          action: string;
          entity_mapping?: Record<string, unknown>;
          risk_acknowledged?: boolean;
          economic_alert_notes?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          action?: string;
          entity_mapping?: Record<string, unknown>;
          risk_acknowledged?: boolean;
          economic_alert_notes?: string | null;
          notes?: string | null;
        };
      };
      training_reviews: {
        Row: {
          id: string;
          run_id: string;
          reviewer_id: string;
          understood_sublicense_trap: boolean | null;
          comments: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          reviewer_id: string;
          understood_sublicense_trap?: boolean | null;
          comments?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          understood_sublicense_trap?: boolean | null;
          comments?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          despacho_id: string;
          expediente_id: string | null;
          documento_id: string | null;
          title: string;
          source_label: string | null;
          created_by: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          despacho_id: string;
          expediente_id?: string | null;
          documento_id?: string | null;
          title: string;
          source_label?: string | null;
          created_by: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          expediente_id?: string | null;
          documento_id?: string | null;
          title?: string;
          source_label?: string | null;
          status?: string;
          updated_at?: string;
        };
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          orden: number;
          question: string;
          options: unknown;
          correct_index: number;
          explanation: string | null;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          orden?: number;
          question: string;
          options: unknown;
          correct_index: number;
          explanation?: string | null;
        };
        Update: {
          orden?: number;
          question?: string;
          options?: unknown;
          correct_index?: number;
          explanation?: string | null;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          profile_id: string;
          score_pct: number | null;
          passed: boolean;
          completed_at: string | null;
          rewarded_at: string | null;
          idempotency_reward_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          profile_id: string;
          score_pct?: number | null;
          passed?: boolean;
          completed_at?: string | null;
          rewarded_at?: string | null;
          idempotency_reward_key?: string | null;
          created_at?: string;
        };
        Update: {
          score_pct?: number | null;
          passed?: boolean;
          completed_at?: string | null;
          rewarded_at?: string | null;
          idempotency_reward_key?: string | null;
        };
      };
      quiz_attempt_answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_index: number;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_index: number;
        };
        Update: {
          selected_index?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_quiz_pass_reward: {
        Args: { p_attempt_id: string };
        Returns: string | null;
      };
      claim_mission_step_reward: {
        Args: { p_run_id: string; p_action_key: string };
        Returns: string | null;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type WithRelationships<T extends { Row: unknown; Insert: unknown; Update: unknown }> = T & {
  Relationships: [];
};

type TablesWithRelationships = {
  [K in keyof Database["public"]["Tables"]]: WithRelationships<
    Database["public"]["Tables"][K]
  >;
};

export type SupabaseDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & {
    Tables: TablesWithRelationships;
  };
};

export type Despacho = Database["public"]["Tables"]["despachos"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Expediente = Database["public"]["Tables"]["expedientes"]["Row"];
export type Documento = Database["public"]["Tables"]["documentos"]["Row"];
export type Sujeto = Database["public"]["Tables"]["sujetos"]["Row"];
export type Factura = Database["public"]["Tables"]["facturas"]["Row"];
export type Evento = Database["public"]["Tables"]["eventos"]["Row"];
export type Activo = Database["public"]["Tables"]["activos"]["Row"];
export type Fundamento = Database["public"]["Tables"]["fundamentos"]["Row"];
export type IusWallet = Database["public"]["Tables"]["ius_wallets"]["Row"];
export type IusLedger = Database["public"]["Tables"]["ius_ledger"]["Row"];
export type Mission = Database["public"]["Tables"]["missions"]["Row"];
export type MissionRun = Database["public"]["Tables"]["mission_runs"]["Row"];
export type MissionStepEvent = Database["public"]["Tables"]["mission_step_events"]["Row"];
export type HitlReview = Database["public"]["Tables"]["hitl_reviews"]["Row"];
export type TrainingReview = Database["public"]["Tables"]["training_reviews"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type QuizQuestion = Database["public"]["Tables"]["quiz_questions"]["Row"];
export type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];

export type AppRole = "admin" | "jurista";
