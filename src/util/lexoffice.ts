import { Contact, ContactTemplate, ContactUpdate } from "@clinq/bridge";
import axios from "axios";
import querystring from "querystring";
import { authorizeApiKey } from "./access-token";
import {
  convertContactToVendorContact,
  convertVendorContactToContact
} from "./contact";
import {
  ILexofficeContactResponse,
  ILexofficeUpdateResponse
} from "./interfaces";
import parseEnvironment from "./parse-environment";

export async function createContact(
  accessToken: string,
  contact: ContactTemplate
): Promise<Contact> {
  const vendorContact = convertContactToVendorContact(contact);

  /**
   * TODO:
   * this route will fail if a user with same email address is already existing
   * There is an alternative route `/api/v2/users/create_or_update.json` that would update an existing user
   * what should we do?
   * FAIL or UPDATE?
   */
  const response = await axios.post<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/api/v2/users.json`,
    { user: vendorContact },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response || response.status !== 201) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || !response.data.user) {
    throw new Error(`Could not create Lexoffice contact.`);
  }

  const receivedContact = convertVendorContactToContact(response.data.user);
  if (!receivedContact) {
    throw new Error("Could not parse received contact");
  }
  return receivedContact;
}

export async function updateContact(
  accessToken: string,
  contact: ContactUpdate
): Promise<Contact> {
  const vendorContact = convertContactToVendorContact(contact, contact.id);

  const response = await axios.put<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/api/v2/users/${contact.id}.json`,
    { user: vendorContact },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || !response.data.user) {
    throw new Error(`Could not update Lexoffice contact.`);
  }

  const receivedContact = convertVendorContactToContact(response.data.user);
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
    if (contact && contact.phoneNumbers.length > 0) {
      contacts.push(contact);
    }
  }

  if (!response.data.last) {
    return getPaginatedContacts(accessToken, page + 1, contacts);
  }

  return contacts;
}

export async function deleteContact(
  accessToken: string,
  id: string
): Promise<void> {
  const response = await axios.delete<ILexofficeUpdateResponse>(
    `${parseEnvironment().LEXOFFICE_BASE_URL}/api/v2/users/${id}.json`,
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
