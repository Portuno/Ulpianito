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
          created_at?: string;
        };
        Update: {
          nombre?: string;
          tipo_documento?: string;
        };
      };
      sujetos: {
        Row: {
          id: string;
          expediente_id: string;
          nombre: string;
          rol_procesal: string;
          dni: string | null;
          contacto: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expediente_id: string;
          nombre: string;
          rol_procesal: string;
          dni?: string | null;
          contacto?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nombre?: string;
          rol_procesal?: string;
          dni?: string | null;
          contacto?: string | null;
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
    };
  };
};

export type Despacho = Database["public"]["Tables"]["despachos"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Expediente = Database["public"]["Tables"]["expedientes"]["Row"];
export type Documento = Database["public"]["Tables"]["documentos"]["Row"];
export type Sujeto = Database["public"]["Tables"]["sujetos"]["Row"];
export type Factura = Database["public"]["Tables"]["facturas"]["Row"];
