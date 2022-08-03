import isEmpty from "lodash/isEmpty";
import { proxyFetch } from "@deskpro/app-sdk";
import { Request } from "./types";
import { BASE_URL, placeholders } from "./constants";
import { getQueryParams } from "../../utils";

const baseRequest: Request = async (client, {
    url,
    rawUrl,
    data = {},
    method = "GET",
    queryParams = {},
    headers: customHeaders
}) => {
    const dpFetch = await proxyFetch(client);

    let body = undefined;
    const headers: Record<string, string> = {};

    const baseUrl = `${rawUrl ? rawUrl : `${BASE_URL}${url}`}`;
    const params = `${isEmpty(queryParams) ? "" : `?${getQueryParams(queryParams, true)}`}`;
    const requestUrl = `${baseUrl}${params}`;

    if (data instanceof FormData) {
        body = data;
    } else if(data) {
        body = JSON.stringify(data);
    }

    if (body instanceof FormData) {
        //...
    } else if (data) {
        headers["Accept"] = "application/vnd.github+json";
        headers["Content-Type"] = "application/json";
        headers["Authorization"] = `token ${placeholders.TOKEN}`;
    }

    const res = await dpFetch(requestUrl, {
        method,
        body,
        headers: {
            ...headers,
            ...customHeaders,
        },
    });

    if (res.status === 400) {
        return res.json();
    }

    if (res.status > 400 && res.status <=499) {
        const status = res.status;
        return res.json()
            .then((err) => Promise.reject({ ...err, status }));
    }

    if (res.status < 200 || res.status >= 400) {
        throw new Error(`${method} ${url}: Response Status [${res.status}]`);
    }

    // ToDo: consider this case
    // https://docs.github.com/en/developers/apps/managing-oauth-apps/troubleshooting-oauth-app-access-token-request-errors#bad-verification-code

    try {
        return await res.json();
    } catch (e) {
        return {};
    }
};

export { baseRequest };
