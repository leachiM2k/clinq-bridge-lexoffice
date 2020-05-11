export interface ILexofficeAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface ILexofficeContactPhoto {
  url: string;
  id: number;
  file_name: string;
  content_url: string;
  mapped_content_url: string;
  content_type: string;
  size: number;
  width: number;
  height: number;
  inline: boolean;
  deleted: boolean;
  thumbnails: [
    {
      url: string;
      id: number;
      file_name: string;
      content_url: string;
      mapped_content_url: string;
      content_type: string;
      size: number;
      width: number;
      height: number;
      inline: boolean;
      deleted: boolean;
    }
  ];
}

export interface ILexofficeContact {
  id?: number;
  url?: string;
  name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  time_zone?: string;
  iana_time_zone?: string;
  phone?: string | null;
  shared_phone_number?: string | null;
  photo?: ILexofficeContactPhoto | null;
  locale_id?: number;
  locale?: string;
  organization_id?: string | null;
  role?: string;
  verified?: boolean;
  external_id?: string | null;
  tags?: string[];
  alias?: string | null;
  active?: boolean;
  shared?: boolean;
  shared_agent?: boolean;
  last_login_at?: string | null;
  two_factor_auth_enabled?: boolean;
  signature?: string | null;
  details?: string | null;
  notes?: string | null;
  role_type?: string | null;
  custom_role_id?: string | null;
  moderator?: boolean;
  ticket_restriction?: string;
  only_private_comments?: boolean;
  restricted_agent?: boolean;
  suspended?: boolean;
  chat_only?: boolean;
  default_group_id?: string | null;
  report_csv?: boolean;
  user_fields?: any;
}

export interface ILexofficeContactResponse {
  users: ILexofficeContact[];
  next_page: string;
  previous_page: string;
  count: number;
}

export interface ILexofficeUpdateResponse {
  user?: ILexofficeContact;
}
