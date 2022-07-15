import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import {
    P5,
    H3,
    OAuth2CallbackUrl,
    useDeskproAppClient,
    useDeskproOAuth2Auth,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { getQueryParams } from "../utils";
import { AnchorButton } from "../components/common";
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
    const { callback: initCallback } = useDeskproOAuth2Auth("code", /code=(?<token>[0-9a-f]+)$/);

    const [state, dispatch] = useStore();
    const [error, setError] = useState<string|null>(null);
    const [authUrl, setAuthUrl] = useState<string|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [callback, setCallback] = useState<OAuth2CallbackUrl|undefined>(initCallback);

    const clientId =  state?.context?.settings?.client_id;
    const callbackUrl = callback?.callbackUrl;

    useEffect(() => {
        if (!client) {
            return;
        }

        client.deregisterElement("githubPlusButton");
        client.deregisterElement("githubMenu");

        client?.registerElement("myRefreshButton", {
            type: "refresh_button"
        });
    }, [client]);

    useEffect(() => {
        if (!callback) {
            client?.oauth2()
                .getCallbackUrl("code", /code=(?<token>[0-9a-f]+)$/)
                .then((callback: OAuth2CallbackUrl) => setCallback(callback));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initCallback]);

    useEffect(() => {
        if (callbackUrl && clientId) {
            setAuthUrl(`https://github.com/login/oauth/authorize?${getQueryParams({
                client_id: clientId,
                redirect_uri: callbackUrl,
            })}`);
        } else {
            setAuthUrl(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callbackUrl, clientId]);

    if (error) {
        // eslint-disable-next-line no-console
        console.error(`Github LogIn: ${error}`);
    }

    const onSignIn = () => {
        if (!callback || !client) {
            return;
        }

        callback?.poll()
            .then(() => {
                setLoading(true);

                const clientId = state?.context?.settings?.client_id;
                const clientSecret = state?.context?.settings?.client_secret;

                return getAccessTokenService(client, clientId, clientSecret);
            })
            .then(({ access_token }) => client?.setUserState("oauth2/token", access_token))
            .then((res) => res?.isSuccess ? Promise.resolve() : Promise.reject())
            .then(() => getCurrentUserService(client))
            .then(({ id }) => {
                if (id) {
                    dispatch({ type: "setAuth", isAuth:  true });
                }
            })
            .catch((error) => setError(error?.code === 401 ? error.message : error))
            .finally(() => setLoading(false));
    };

    return (
        <>
            <H3 style={{ marginBottom: !error ? 14 : 2 }}>Log into your GitHub Account</H3>
            {error && (<LogInError>An error occurred, please try again.</LogInError>)}
            <AnchorButton
                text="Log In"
                target="_blank"
                loading={!authUrl || loading}
                disabled={!authUrl || loading}
                href={authUrl || ""}
                onClick={onSignIn}
            />
        </>
    );
};

export { LogInPage };
