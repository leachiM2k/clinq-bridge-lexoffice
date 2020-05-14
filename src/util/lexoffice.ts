import { Contact, ContactTemplate, ContactUpdate } from "@clinq/bridge";
import axios from "axios";
import querystring from "querystring";
import { authorizeApiKey } from "./access-token";
import {
  convertContactToVendorContact,
  convertContactUpdateToVendorContact,
  convertVendorContactToContact
} from "./contact";
import {
  ILexofficeContact,
  ILexofficeContactResponse,
  ILexofficeUpdateResponse
} from "./interfaces";
import parseEnvironment from "./parse-environment";

export async function createContact(
  apiKey: string,
  contact: ContactTemplate
): Promise<Contact> {
  const vendorContact = convertContactToVendorContact(contact);
  const { accessToken } = await authorizeApiKey(apiKey);
  const response = await axios.post<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/`,
    vendorContact,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || !response.data.id) {
    throw new Error(`Could not create Lexoffice contact.`);
  }

  return getSingleContact(accessToken, response.data.id);
}

export async function updateContact(
  apiKey: string,
  contact: ContactUpdate
): Promise<Contact> {
  const { accessToken } = await authorizeApiKey(apiKey);
  const responseGet = await axios.get<ILexofficeContact>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/${contact.id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!responseGet || responseGet.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${responseGet.statusText}`
    );
  }

  const response = await axios.put<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/${contact.id}`,
    convertContactUpdateToVendorContact(contact, responseGet.data),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || !response.data.id) {
    throw new Error(`Could not update Lexoffice contact.`);
  }

  return getSingleContact(accessToken, response.data.id);
}

async function getSingleContact(
  accessToken: string,
  id: string
): Promise<Contact> {
  const responseGet = await axios.get<ILexofficeContact>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/${id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!responseGet || responseGet.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${responseGet.statusText}`
    );
  }

  const receivedContact = convertVendorContactToContact(responseGet.data);
  if (!receivedContact) {
    throw new Error("Could not parse received contact");
  }
  return receivedContact;
}

export async function getContacts(apiKey: string): Promise<Contact[]> {
  const { accessToken } = await authorizeApiKey(apiKey);
  return getPaginatedContacts(accessToken);
}

async function getPaginatedContacts(
  accessToken: string,
  page: number = 0,
  previousContacts?: Contact[]
): Promise<Contact[]> {
  const url = `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/`;
  const response = await axios.get<ILexofficeContactResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page }
  });

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || response.data.content.length === 0) {
    return previousContacts || [];
  }

  const contacts: Contact[] = previousContacts || [];

  for (const vendorContact of response.data.content) {
    const contact = convertVendorContactToContact(vendorContact);
    if (contact) {
      contacts.push(contact);
    }
  }

  if (!response.data.last) {
    return getPaginatedContacts(accessToken, page + 1, contacts);
  }

  return contacts;
}

export async function deleteContact(apiKey: string, id: string): Promise<void> {
  const { accessToken } = await authorizeApiKey(apiKey);
  const response = await axios.delete<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/v1/contacts/${id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response || response.status !== 200) {
    throw new Error(`Could not delete Lexoffice contact.`);
  }
}

export function getOAuth2RedirectUrl(): string {
  const {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_AUTH_URL
  } = parseEnvironment();
  return (
    LEXOFFICE_AUTH_URL +
    "/api/oauth2/authorize?" +
    querystring.encode({
      client_id: LEXOFFICE_CLIENT_ID,
      response_type: "code",
      redirect_uri: LEXOFFICE_REDIRECT_URL
    })
  );
}
