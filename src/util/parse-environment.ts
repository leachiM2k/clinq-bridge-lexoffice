export interface IOAuth2Options {
  LEXOFFICE_CLIENT_ID: string;
  LEXOFFICE_CLIENT_SECRET: string;
  LEXOFFICE_REDIRECT_URL: string;
  LEXOFFICE_BASE_URL: string;
}

export default function parseEnvironment(): IOAuth2Options {
  const {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_CLIENT_SECRET,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_BASE_URL
  } = process.env;

  if (!LEXOFFICE_CLIENT_ID) {
    throw new Error("Missing client ID in environment.");
  }

  if (!LEXOFFICE_CLIENT_SECRET) {
    throw new Error("Missing client secret in environment.");
  }

  if (!LEXOFFICE_REDIRECT_URL) {
    throw new Error("Missing redirect url in environment.");
  }

  if (!LEXOFFICE_BASE_URL) {
    throw new Error("Missing base URL in environment.");
  }

  return {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_CLIENT_SECRET,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_BASE_URL
  };
}
