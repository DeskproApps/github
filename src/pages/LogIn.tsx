import { FC, useState, useEffect } from "react";
import styled from "styled-components";
import {
    P5,
    H3,
    Fetch,
    proxyFetch,
    useDeskproAppClient,
    useDeskproOAuth2Auth,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { getQueryParams } from "../utils";
import { Loading, AnchorButton } from "../components/common";
import { baseRequest } from "../services/github/baseRequest";

const LogInError = styled(P5)`
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.scarlett100};
`;

const LogInPage: FC = () => {
    const { client } = useDeskproAppClient();
    const { callback } = useDeskproOAuth2Auth("code", /code=(?<token>[0-9a-f]+)$/);

    const [state, dispatch] = useStore();
    const [error, setError] = useState<string | null>(null);

    const [authUrl, setAuthUrl] = useState<string|null>(null);

    useEffect(() => {
        if (!client) {
            return;
        }

        client?.registerElement("myRefreshButton", {
            type: "refresh_button"
        });
    }, [client]);

    useEffect(() => {
        const callbackUrl = callback?.callbackUrl;
        const clientId =  state?.context?.settings?.client_id;

        if (callbackUrl && clientId) {
            setAuthUrl(`https://github.com/login/oauth/authorize?${getQueryParams({
                client_id: clientId,
                redirect_uri: callbackUrl,
            })}`);
        } else {
            setAuthUrl(null);
        }
    }, [callback?.callbackUrl, state?.context?.settings?.client_id]);

    if (error) {
        console.error(`Trello: ${error}`);
    }

    const onSignIn = () => {
        if (!callback) {
            return;
        }

        callback?.poll()
            .then((data) => {
                // statePath: "oauth2/code"
                // statePathPlaceholder: "[user[oauth2/code]]"
                console.log(">>> login:code", data);
                const { statePathPlaceholder } = data;

                const clientId =  state?.context?.settings?.client_id;
                const clientSecret =  state?.context?.settings?.client_secret;
                const requestUrl = `https://github.com/login/oauth/access_token?${getQueryParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: statePathPlaceholder,
                })}`
                // @ts-ignore
                return proxyFetch(client)
                    .then((dpFetch) => dpFetch(requestUrl, {
                        method: "POST",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                        }
                    }));
            })
            .then((res) => {
                /*{
                  "access_token":"gho_16C7e42F292c6912E7710c838347Ae178B4a",
                  "scope":"repo,gist",
                  "token_type":"bearer"
                }*/
                console.log(">>> login:access:", res);
            });
    };

    return (
        <>
            <H3 style={{ marginBottom: !error ? 14 : 2 }}>Log into your Trello Account</H3>
            {error && (<LogInError>An error occurred, please try again.</LogInError>)}
            <AnchorButton
                text="Sign In"
                target="_blank"
                loading={!authUrl}
                disabled={!authUrl}
                href={authUrl || ""}
                onClick={onSignIn}
            />
        </>
    );
};

export { LogInPage };
