import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { placeholders } from "./constants";

const GRAPHQL_URL = "https://api.github.com/graphql";

/**
 * Base request service
 */
const baseGraphQLRequest = async (
    client: IDeskproClient,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    { query, variables = {} }: { query: string, variables?: Record<string, any> },
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

        if (response?.errors?.length) {
            return Promise.reject(response?.errors);
        }

        return response.data;
    } catch (e) {
        return {};
    }
};

export { baseGraphQLRequest };
