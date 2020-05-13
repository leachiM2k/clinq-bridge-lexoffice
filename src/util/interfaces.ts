export interface ILexofficeAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export interface ILexofficeContact {
  id?: number;
  organizationId?: string;
  version?: number;
  roles?: {
    customer: {
      number: number;
    };
  };
  person?: {
    salutation: string;
    firstName: string;
    lastName: string;
  };
  archived: boolean;
}

export interface ILexofficeContactResponse {
  content: ILexofficeContact[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  numberOfElements: boolean;
}

export interface ILexofficeUpdateResponse {
  user?: ILexofficeContact;
}
