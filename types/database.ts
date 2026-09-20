/**
 * Tipos TypeScript que espelham o schema definido em supabase/schema.sql.
 * Atualize este arquivo manualmente sempre que o schema mudar
 * (ou gere via `supabase gen types typescript` quando o CLI estiver configurado).
 *
 * Usamos `type` (não `interface`) porque o `@supabase/postgrest-js` exige
 * que cada `Row`/`Insert`/`Update` satisfaça `Record<string, unknown>`, e
 * interfaces não têm índice de string implícito para isso.
 */

export type UserRole = "admin" | "senior" | "leader";
export type ProfileStatus = "pending" | "approved" | "blocked";
export type MeetingRecordStatus = "done" | "pending" | "late";

export type Church = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type Profile = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: ProfileStatus;
  church_id: string | null;
  created_at: string;
};

export type Cell = {
  id: string;
  name: string;
  leader_id: string | null;
  location: string | null;
  address: string | null;
  church_id: string;
  member_count: number;
  active: boolean;
  created_at: string;
};

export type Member = {
  id: string;
  cell_id: string;
  name: string;
  phone: string | null;
  is_visitor: boolean;
  active: boolean;
  joined_at: string;
};

export type Theme = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_by: string | null;
};

export type Meeting = {
  id: string;
  theme_id: string;
  meeting_number: number;
  pdf_url: string | null;
  checklist: Record<string, unknown> | null;
  verses: Record<string, unknown> | null;
  dynamic_idea: string | null;
  key_questions: Record<string, unknown> | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
};

export type MeetingRecord = {
  id: string;
  cell_id: string;
  meeting_id: string;
  occurred_at: string;
  status: MeetingRecordStatus;
  attendees_count: number;
  visitors_count: number;
  notes: string | null;
};

export type GeneralManual = {
  id: string;
  pdf_url: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      churches: {
        Row: Church;
        Insert: Partial<Church> & Pick<Church, "name" | "city" | "state">;
        Update: Partial<Church>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> &
          Pick<Profile, "auth_user_id" | "full_name" | "email">;
        Update: Partial<Profile>;
        Relationships: [];
      };
      cells: {
        Row: Cell;
        Insert: Partial<Cell> & Pick<Cell, "name" | "church_id">;
        Update: Partial<Cell>;
        Relationships: [];
      };
      members: {
        Row: Member;
        Insert: Partial<Member> & Pick<Member, "cell_id" | "name">;
        Update: Partial<Member>;
        Relationships: [];
      };
      themes: {
        Row: Theme;
        Insert: Partial<Theme> & Pick<Theme, "title">;
        Update: Partial<Theme>;
        Relationships: [];
      };
      meetings: {
        Row: Meeting;
        Insert: Partial<Meeting> &
          Pick<Meeting, "theme_id" | "meeting_number">;
        Update: Partial<Meeting>;
        Relationships: [];
      };
      meeting_records: {
        Row: MeetingRecord;
        Insert: Partial<MeetingRecord> &
          Pick<MeetingRecord, "cell_id" | "meeting_id">;
        Update: Partial<MeetingRecord>;
        Relationships: [];
      };
      general_manual: {
        Row: GeneralManual;
        Insert: Partial<GeneralManual> & Pick<GeneralManual, "pdf_url">;
        Update: Partial<GeneralManual>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      meeting_record_status: MeetingRecordStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
