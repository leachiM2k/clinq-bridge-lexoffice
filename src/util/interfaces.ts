export interface ILexofficeAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

interface ILexofficeContactContactPersons {
  salutation?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface ILexofficeContact {
  id?: string;
  organizationId?: string;
  version?: number;
  roles?: {
    customer?: {
      number?: number;
    };
  };
  company?: {
    name?: string;
    taxNumber?: string;
    vatRegistrationId?: string;
    allowTaxFreeInvoices?: boolean;
    contactPersons?: ILexofficeContactContactPersons[];
  };
  emailAddresses?: {
    business?: string[];
    office?: string[];
    private?: string[];
    other?: string[];
  } & {
    [prop: string]: string;
  };
  phoneNumbers?: {
    business?: string[];
    office?: string[];
    mobile?: string[];
    private?: string[];
    fax?: string[];
    other?: string[];
  } & {
    [prop: string]: string[];
  };
  person?: {
    salutation?: string;
    firstName?: string;
    lastName?: string;
  };
  archived?: boolean;
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
  id: string;
  resourceUri: string;
  createdDate: string;
  updatedDate: string;
  version: number;
}
