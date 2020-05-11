import { Contact, ContactTemplate, ContactUpdate } from "@clinq/bridge";
import axios from "axios";
import querystring from "querystring";
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

export async function getContacts(
  accessToken: string,
  page: number = 1,
  previousContacts?: Contact[]
): Promise<Contact[]> {
  const url = `${parseEnvironment().LEXOFFICE_BASE_URL}/api/v2/users.json`;
  const response = await axios.get<ILexofficeContactResponse>(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { role: "end-user", page }
  });

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  if (!response.data || response.data.users.length === 0) {
    return previousContacts || [];
  }

  const contacts: Contact[] = previousContacts || [];

  for (const vendorContact of response.data.users) {
    const contact = convertVendorContactToContact(vendorContact);
    if (contact && contact.phoneNumbers.length > 0) {
      contacts.push(contact);
    }
  }

  if (response.data.next_page) {
    return getContacts(accessToken, page + 1, contacts);
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
    LEXOFFICE_BASE_URL
  } = parseEnvironment();
  return (
    LEXOFFICE_BASE_URL +
    "/oauth/authorizations/new?" +
    querystring.encode({
      client_id: LEXOFFICE_CLIENT_ID,
      response_type: "code",
      redirect_uri: LEXOFFICE_REDIRECT_URL,
      scope: "users:read users:write"
      // state: Math.random() // XXX: optional
    })
  );
}
