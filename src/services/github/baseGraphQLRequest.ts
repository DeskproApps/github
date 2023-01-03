import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { placeholders } from "./constants";

const GRAPHQL_URL = "https://api.github.com/graphql";

export  type Params = {
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: Record<string, any>,
    skipError?: boolean,
}

/**
 * Base request service
 */
const baseGraphQLRequest = async (
    client: IDeskproClient,
    { query, variables = {}, skipError = false }: Params,
) => {
    const dpFetch = await proxyFetch(client);

    const headers: Record<string, string> = {
        "Authorization": `token ${placeholders.TOKEN}`
    };

    const res = await dpFetch(GRAPHQL_URL, {
        headers,
        method: "POST",
        body: JSON.stringify({ query, variables }),
    });

    if (res.status === 400) {
        return res.json();
    }

    /**
     * ToDo: handle by status codes
     * @see https://shopify.dev/api/admin-graphql#status_and_error_codes
     */
    if (res.status < 200 || res.status >= 400) {
        throw new Error(`${GRAPHQL_URL}: Response Status [${res.status}]`);
    }

    try {
        const response = await res.json();

        if (!skipError && response?.errors?.length) {
            return Promise.reject(response?.errors);
        }

        return response.data;
    } catch (e) {
        return {};
    }
};

export { baseGraphQLRequest };
