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
  if (!vendorContact.id || vendorContact.archived) {
    return null;
  }

  const contact: Contact = {
    id: vendorContact.id,
    name: null,
    firstName: null,
    lastName: null,
    email: collectEMailFromVendorContact(vendorContact),
    organization: (vendorContact.company && vendorContact.company.name) || null,
    contactUrl: null,
    avatarUrl: null,
    phoneNumbers: collectPhoneNumbersFromVendorContact(vendorContact)
  };
  enrichNameOfVendorContact(vendorContact, contact);

  return contact;
}

function enrichNameOfVendorContact(
  vendorContact: ILexofficeContact,
  contact: Contact
) {
  if (
    vendorContact.company &&
    Array.isArray(vendorContact.company.contactPersons)
  ) {
    contact.firstName =
      vendorContact.company.contactPersons[0].firstName || null;
    contact.lastName = vendorContact.company.contactPersons[0].lastName || null;
  } else if (vendorContact.person) {
    contact.firstName = vendorContact.person.firstName || null;
    contact.lastName = vendorContact.person.lastName || null;
  }
}

function collectEMailFromVendorContact(
  vendorContact: ILexofficeContact
): string | null {
  if (
    vendorContact.company &&
    Array.isArray(vendorContact.company.contactPersons) &&
    vendorContact.company.contactPersons[0].emailAddress
  ) {
    return vendorContact.company.contactPersons[0].emailAddress;
  }
  if (!vendorContact.emailAddresses) {
    return null;
  }
  for (const type of ["business", "office", "private", "other"]) {
    if (vendorContact.emailAddresses[type]) {
      return vendorContact.emailAddresses[type][0];
    }
  }
  return null;
}

const phoneNumberMap: { [key: string]: string } = {
  [PhoneNumberLabel.WORK]: "business",
  [PhoneNumberLabel.MOBILE]: "mobile",
  [PhoneNumberLabel.HOME]: "private",
  FAX: "fax",
  OTHER: "other"
};

function collectPhoneNumbersFromVendorContact(
  vendorContact: ILexofficeContact
): PhoneNumber[] {
  const phoneNumbers: PhoneNumber[] = [];

  if (
    vendorContact.company &&
    Array.isArray(vendorContact.company.contactPersons) &&
    vendorContact.company.contactPersons[0].phoneNumber
  ) {
    phoneNumbers.push({
      label: PhoneNumberLabel.WORK,
      phoneNumber: vendorContact.company.contactPersons[0].phoneNumber
    });
  }

  if (!vendorContact.phoneNumbers) {
    return phoneNumbers;
  }

  Object.entries(phoneNumberMap).forEach(([localKey, vendorKey]) => {
    if (
      vendorContact.phoneNumbers &&
      Array.isArray(vendorContact.phoneNumbers[vendorKey])
    ) {
      vendorContact.phoneNumbers[vendorKey].forEach((phoneNumber: string) => {
        phoneNumbers.push({ label: localKey as PhoneNumberLabel, phoneNumber });
      });
    }
  });

  return phoneNumbers;
}

function tryConvertNameToFirstLastName(contact: ContactTemplate) {
  if (!(contact.name && !contact.firstName && !contact.lastName)) {
    return;
  }

  const splitByComma = contact.name.match(/(.*),(.*)/);
  if (splitByComma) {
    contact.firstName = splitByComma[2] && splitByComma[2].trim();
    contact.lastName = splitByComma[1] && splitByComma[1].trim();
    return;
  }

  const splitByWhiteSpace = contact.name.match(/(.*) (.*)/);
  if (splitByWhiteSpace) {
    contact.firstName = splitByWhiteSpace[1] && splitByWhiteSpace[1].trim();
    contact.lastName = splitByWhiteSpace[2] && splitByWhiteSpace[2].trim();
    return;
  }

  contact.firstName = "";
  contact.lastName = contact.name;
}

export function convertContactToVendorContact(
  contact: ContactUpdate | ContactTemplate
): ILexofficeContact {
  const vendorContact: ILexofficeContact = {
    version: 0,
    roles: { customer: {} }
  };

  tryConvertNameToFirstLastName(contact);

  if (contact.organization) {
    vendorContact.company = {
      name: contact.organization,
      contactPersons: [
        {
          firstName: contact.firstName || undefined,
          lastName: contact.lastName || undefined
        }
      ]
    };
  } else {
    vendorContact.person = {
      salutation: "Herr", // TODO: Needed field, but how to handle salutation properly?
      firstName: contact.firstName || undefined,
      lastName: contact.lastName || undefined
    };
  }

  if (contact.email) {
    vendorContact.emailAddresses = vendorContact.emailAddresses || {};
    vendorContact.emailAddresses.business = [contact.email];
  }

  if (Array.isArray(contact.phoneNumbers)) {
    contact.phoneNumbers.forEach((entry: PhoneNumber) => {
      if (phoneNumberMap[entry.label]) {
        const key = phoneNumberMap[entry.label];
        vendorContact.phoneNumbers = vendorContact.phoneNumbers || {};
        vendorContact.phoneNumbers[key] = [entry.phoneNumber];
      }
    });
  }

  return vendorContact;
}

export function convertContactUpdateToVendorContact(
  contact: ContactUpdate,
  previousContact: ILexofficeContact
): ILexofficeContact {
  tryConvertNameToFirstLastName(contact);
  const vendorContact = { ...previousContact };

  if (contact.organization) {
    vendorContact.company = {
      name: contact.organization,
      contactPersons: [
        {
          firstName: contact.firstName || undefined,
          lastName: contact.lastName || undefined
        }
      ]
    };
    if (vendorContact.person) {
      delete vendorContact.person;
    }
  }

  if (vendorContact.person) {
    vendorContact.person.firstName = contact.firstName || undefined;
    vendorContact.person.lastName = contact.lastName || undefined;
  }

  if (contact.email) {
    vendorContact.emailAddresses = vendorContact.emailAddresses || {};
    vendorContact.emailAddresses.business = [contact.email];
  }

  if (Array.isArray(contact.phoneNumbers)) {
    contact.phoneNumbers.forEach((entry: PhoneNumber) => {
      if (phoneNumberMap[entry.label]) {
        const key = phoneNumberMap[entry.label];
        vendorContact.phoneNumbers = vendorContact.phoneNumbers || {};
        vendorContact.phoneNumbers[key] = [entry.phoneNumber];
      }
    });
  }
  return vendorContact;
}
