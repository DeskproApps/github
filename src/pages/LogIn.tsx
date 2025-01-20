import { FC, useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { createSearchParams } from "react-router-dom";
import { P5, H3 } from "@deskpro/deskpro-ui";
import { proxyFetch, useDeskproAppClient, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { placeholders } from "../services/github/constants";
import { AnchorButton, Container } from "../components/common";
import {
  getCurrentUserService,
  getAccessTokenService,
} from "../services/github";

const LogInError = styled(P5)`
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.scarlett100};
`;

const LogInPage: FC = () => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext<unknown, { client_id: string, use_deskpro_sass: boolean }>();
  console.log({ context })

  const [state, dispatch] = useStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authorizationUrl, setAuthorizationUrl] = useState<string>();

  useEffect(() => {
    if (!client) {
      return;
    }

    client.deregisterElement("githubPlusButton");
    client.deregisterElement("githubHomeButton");
    client.deregisterElement("githubMenu");
  }, [client]);


  useInitialisedDeskproAppClient(async (client) => {
    if (context?.settings.use_deskpro_sass === undefined) {
      // Make sure settings have loaded.
      return;
    }
    const clientId = context?.settings.client_id;
    const mode = context?.settings.use_deskpro_sass ? 'global' : 'local';
    if (mode === 'local' && typeof clientId !== 'string') {
      // Local mode requires a clientId.
      return;
    }
    const oauth2 =
      mode === 'local'
        // Local Version (custom/self-hosted app)
        // This supports code and pkce flows, the developer will provide the IDP's authorize URL as a template
        // apps client will "augment" the IDP's authorize URL with the required redirect URI, OAuth gateway, etc.
        // we also need to let Deskpro know how to "acquire" the auth code
        ? await client.startOauth2Local(
          ({ state, callbackUrl, codeChallenge }) => {
            return `https://github.com/login/oauth/authorize?${createSearchParams([
              ["state", state],
              ["client_id", clientId],
              ["redirect_uri", callbackUrl],
              ["scope", ["repo", "read:project"].join(",")],
            ])}`;
          },
          /\?code=(?<code>.+?)&/,
          async function convertResponseToToken(code: string) {
            const auth = await getAccessTokenService(client, clientId, code);
            return { data: { access_token: auth.access_token! } };
          },
        )
        // Global Proxy Service
        // Developer will provide clientId, the rest of OAuth2 flow is in the Global Proxy Service.
        // (clientId is required incase an app supports multiple OAuth2s)
        : await client.startOauth2Global("pjdfMRropxn59iFpAZWWAPZI");

    // store the auth URL and present this as the "login" link to the app user
    setAuthorizationUrl(oauth2.authorizationUrl);

    try {
      // Poll will resolve when OAuth2 has succeeded or failed. 
      const pollResult = await oauth2.poll();
      console.log("Auth Code Acquired!", pollResult);

      await client.setUserState(placeholders.OAUTH_TOKEN_PATH, pollResult.data.access_token, { backend: true });
      await getCurrentUserService(client);
      dispatch({ type: "setAuth", isAuth:  true });
    } catch (error) {
      // Some Generic Error occurred (no internet?)
      console.log("Error!", error);
    }
  }, [setAuthorizationUrl, context?.settings.client_id, context?.settings.use_deskpro_sass]);

  const onSignIn = useCallback(() => {
    setLoading(true);
    window.open(authorizationUrl, '_blank');
  }, [setLoading, authorizationUrl]);

  return (
    <Container>
      <H3 style={{ marginBottom: !error ? 14 : 2 }}>Log into your GitHub Account</H3>
      {error && (<LogInError>An error occurred, please try again.</LogInError>)}
      <AnchorButton
        text="Log In"
        target="_blank"
        loading={!authorizationUrl || loading}
        disabled={!authorizationUrl || loading}
        href={authorizationUrl || ""}
        onClick={onSignIn}
      />
    </Container>
  );
};

export { LogInPage };
