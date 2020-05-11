import axios from "axios";
import { ILexofficeAuthResponse } from "./interfaces";
import parseEnvironment from "./parse-environment";

export async function getTokens(code: string): Promise<ILexofficeAuthResponse> {
  const {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_CLIENT_SECRET,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_BASE_URL
  } = parseEnvironment();
  const payload = {
    code,
    redirect_uri: LEXOFFICE_REDIRECT_URL,
    client_id: LEXOFFICE_CLIENT_ID,
    client_secret: LEXOFFICE_CLIENT_SECRET,
    grant_type: "authorization_code",
    scope: "read"
  };

  const response = await axios.post<ILexofficeAuthResponse>(
    `${LEXOFFICE_BASE_URL}/oauth/tokens`,
    payload
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  return response.data;
}
