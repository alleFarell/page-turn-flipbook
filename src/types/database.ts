export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      flipbooks: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string
          page_count: number | null
          page_paths: string[] | null
          pdf_path: string | null
          share_token: string | null
          status: string
          title: string
          visibility: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id: string
          page_count?: number | null
          page_paths?: string[] | null
          pdf_path?: string | null
          share_token?: string | null
          status?: string
          title: string
          visibility?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string
          page_count?: number | null
          page_paths?: string[] | null
          pdf_path?: string | null
          share_token?: string | null
          status?: string
          title?: string
          visibility?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_flipbook_for_viewer: {
        Args: { p_id: string; p_token?: string }
        Returns: {
          created_at: string | null
          id: string
          owner_id: string
          page_count: number | null
          page_paths: string[] | null
          pdf_path: string | null
          share_token: string | null
          status: string
          title: string
          visibility: string
        }[]
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

export type Flipbook = Database['public']['Tables']['flipbooks']['Row']
export type FlipbookInsert = Database['public']['Tables']['flipbooks']['Insert']
export type FlipbookUpdate = Database['public']['Tables']['flipbooks']['Update']
