# CLINQ CRM-Bridge for Lexoffice

This service provides contacts from Lexoffice for the CLINQ app.

## Prerequisites

Please create `.env` file or provide following environment variables:

- OAUTH_IDENTIFIER - Name of CRM Bridge
- LEXOFFICE_CLIENT_ID - Unique Identifier of registered Lexoffice OAuth Client (for local integration see https://<your-instance>.lexoffice.com/agent/admin/api/oauth_clients/)
- LEXOFFICE_CLIENT_SECRET - Client Secret of registered Lexoffice OAuth Client, provided by Lexoffice
- LEXOFFICE_REDIRECT_URL - URL of current bridge, must match with registered data at Lexoffice
- LEXOFFICE_BASE_URL - URL of your Lexoffice instance

## License

[Apache 2.0](LICENSE)
