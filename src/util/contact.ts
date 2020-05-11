import {
  Contact,
  ContactTemplate,
  ContactUpdate,
  PhoneNumber,
  PhoneNumberLabel
} from "@clinq/bridge";
import { ILexofficeContact } from "./interfaces";

export function convertVendorContactToContact(
  vendorContact: ILexofficeContact
): Contact | null {
  if (!vendorContact.id) {
    return null;
  }

  return {
    id: String(vendorContact.id),
    name: vendorContact.name,
    firstName: null,
    lastName: null,
    email: vendorContact.email || null,
    organization: null,
    contactUrl: null,
    avatarUrl: vendorContact.photo ? vendorContact.photo.content_url : null,
    phoneNumbers: collectPhoneNumbersFromVendorContact(vendorContact)
  };
}

function collectPhoneNumbersFromVendorContact(
  vendorContact: ILexofficeContact
): PhoneNumber[] {
  if (vendorContact.phone) {
    return [{ label: PhoneNumberLabel.WORK, phoneNumber: vendorContact.phone }];
  }
  return [];
}

export function convertContactToVendorContact(
  contact: ContactUpdate | ContactTemplate,
  id?: string
): ILexofficeContact {
  const vendorContact: ILexofficeContact = {
    name: contact.name || [contact.firstName, contact.lastName].join(" ")
  };

  if (id) {
    vendorContact.id = Number(id);
  } else {
    vendorContact.verified = true;
    vendorContact.role = "end-user";
  }

  if (contact.email) {
    vendorContact.email = contact.email;
  }

  if (Array.isArray(contact.phoneNumbers)) {
    const phoneNumberMap: { [key: string]: string | null } = {
      [PhoneNumberLabel.WORK]: null,
      [PhoneNumberLabel.MOBILE]: null,
      [PhoneNumberLabel.HOME]: null
    };
    contact.phoneNumbers.forEach(
      (entry: PhoneNumber) => (phoneNumberMap[entry.label] = entry.phoneNumber)
    );

    vendorContact.phone =
      phoneNumberMap[PhoneNumberLabel.WORK] ||
      phoneNumberMap[PhoneNumberLabel.MOBILE] ||
      phoneNumberMap[PhoneNumberLabel.HOME];
  }

  return vendorContact;
}
