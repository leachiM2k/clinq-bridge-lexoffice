import axios from "axios";
import querystring from "querystring";
import { ILexofficeAuthResponse } from "./interfaces";
import parseEnvironment from "./parse-environment";

export async function getTokens(code: string): Promise<ILexofficeAuthResponse> {
  const {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_CLIENT_SECRET,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_AUTH_URL
  } = parseEnvironment();
  const payload = {
    code,
    redirect_uri: LEXOFFICE_REDIRECT_URL,
    grant_type: "authorization_code"
  };
  const response = await axios.post<ILexofficeAuthResponse>(
    `${LEXOFFICE_AUTH_URL}/api/oauth2/token?${querystring.encode(payload)}`,
    {},
    {
      auth: { username: LEXOFFICE_CLIENT_ID, password: LEXOFFICE_CLIENT_SECRET }
    }
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  return response.data;
}

export async function authorizeApiKey(
  apiKey: string
): Promise<{ accessToken: string }> {
  if (typeof apiKey !== "string" || !apiKey || apiKey.trim().length === 0) {
    throw new Error("Invalid API key.");
  }
  const [, refreshToken] = apiKey.split(":");

  if (!refreshToken) {
    throw new Error("Could not extract refresh token from api key");
  }

  const { access_token } = await getNewAccessToken(refreshToken);
  // TODO: maybe it is worth to cache the access token? (with the refresher token as key)
  return { accessToken: access_token };
}

async function getNewAccessToken(
  refreshToken: string
): Promise<ILexofficeAuthResponse> {
  const {
    LEXOFFICE_CLIENT_ID,
    LEXOFFICE_CLIENT_SECRET,
    LEXOFFICE_REDIRECT_URL,
    LEXOFFICE_AUTH_URL
  } = parseEnvironment();
  const payload = {
    refresh_token: refreshToken,
    redirect_uri: LEXOFFICE_REDIRECT_URL,
    grant_type: "refresh_token"
  };
  const response = await axios.post<ILexofficeAuthResponse>(
    `${LEXOFFICE_AUTH_URL}/api/oauth2/token?${querystring.encode(payload)}`,
    {},
    {
      auth: { username: LEXOFFICE_CLIENT_ID, password: LEXOFFICE_CLIENT_SECRET }
    }
  );

  if (!response || response.status !== 200) {
    return Promise.reject(
      `Error in Lexoffice response: ${response.statusText}`
    );
  }

  return response.data;
}
