import { FC, useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";
import { createSearchParams } from "react-router-dom";
import { P5, H3 } from "@deskpro/deskpro-ui";
import { useDeskproAppClient, OAuth2StaticCallbackUrl } from "@deskpro/app-sdk";
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
    const key = useMemo(() => uuidv4(), []);
    const { client } = useDeskproAppClient();

    const [state, dispatch] = useStore();
    const [error, setError] = useState<string|null>(null);
    const [authUrl, setAuthUrl] = useState<string|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [callback, setCallback] = useState<OAuth2StaticCallbackUrl|undefined>();

    const clientId = state?.context?.settings?.client_id;
    const callbackUrl = callback?.callbackUrl;

    useEffect(() => {
        if (!client) {
            return;
        }

        client.deregisterElement("githubPlusButton");
        client.deregisterElement("githubHomeButton");
        client.deregisterElement("githubMenu");
    }, [client]);

    const selfHosted=true;
    useEffect(() => {
        if (!callback) {
            if (selfHosted === true) {
                client?.oauth2().getGenericCallbackUrl(key, /code=(?<token>[0-9a-f]+)/, /state=(?<key>.+)/)
                    .then(setCallback);
            } else {
                client?.oauth2().getGenericCallbackUrl(key, /code=(?<token>[0-9a-f]+)/, /state=(?<key>.+)/)
                    .then(setCallback);
            }
        }
    }, [client, key, callback]);

    useEffect(() => {
        if (callbackUrl && clientId) {
            setAuthUrl(`https://github.com/login/oauth/authorize?${createSearchParams([
                ["state", key],
                ["client_id", clientId],
                ["redirect_uri", callbackUrl],
                ["scope", ["repo", "read:project"].join(",")],
            ])}`);
        } else {
            setAuthUrl(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callbackUrl, clientId]);

    if (error) {
        // eslint-disable-next-line no-console
        console.error(`Github LogIn: ${error}`);
    }

    const onSignIn = useCallback(() => {
        if (!callback || !client) {
            return;
        }

        callback?.poll()
            .then(({ token }) => {
                setLoading(true);
                return getAccessTokenService(client, clientId, token);
            })
            .then(({ access_token }) => {
                return client?.setUserState(placeholders.OAUTH_TOKEN_PATH, access_token, { backend: true })
            })
            .then((res) => {
                return res?.isSuccess ? Promise.resolve() : Promise.reject()
            })
            .then(() => getCurrentUserService(client))
            .then((user) => {
                if (user.id) {
                    dispatch({ type: "setAuth", isAuth:  true });
                }
            })
            .catch((error) => setError(error?.code === 401 ? error.message : error))
            .finally(() => setLoading(false));
    }, [client, callback, clientId, dispatch]);

    return (
        <Container>
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
        </Container>
    );
};

export { LogInPage };
