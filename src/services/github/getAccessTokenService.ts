import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { placeholders } from "./constants";
import { getQueryParams } from "../../utils";

const getAccessTokenService = (
    client: IDeskproClient,
    clientId: string,
    clientSecret: string,
): Promise<{ access_token?: string }> => {
    const requestUrl = `https://github.com/login/oauth/access_token?${getQueryParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: placeholders.CODE,
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

            try {
                return res.json();
            } catch (e) {
                return {};
            }
        });
};

export { getAccessTokenService };
