import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { createSearchParams } from "react-router-dom";

const getAccessTokenService = (
    client: IDeskproClient,
    clientId: string,
    code: string,
): Promise<{ access_token: string }> => {
    const requestUrl = `https://github.com/login/oauth/access_token?${createSearchParams({
        client_id: clientId,
        client_secret: "__client_secret__",
        code,
    })}`;

    return proxyFetch(client)
        .then((dpFetch) => dpFetch(requestUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        }))
        .then((res) => {
            if (res.status === 400) {
                return res.json();
            }

            if (res.status === 401) {
                return Promise.reject({
                    code: 401,
                    message: "Bad credentials",
                });
            }

            if (res.status < 200 || res.status >= 400) {
                throw new Error(`POST ${requestUrl}: Response Status [${res.status}]`);
            }

            return res.json();
        });
};

export { getAccessTokenService };
