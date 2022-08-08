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

    const requestUrl = rawUrl
        ? rawUrl
        : `${BASE_URL}${url}${
            isEmpty(queryParams) ? "" : `?${getQueryParams(queryParams, true)}`
        }`;

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

    if (res.status === 401) {
        return Promise.reject({
            code: 401,
            message: "Bad credentials",
        });
    }

    if (res.status === 403) {
        return Promise.reject({ code: 403 });
    }

    if (res.status === 410) {
        return Promise.reject({
            code: 410,
            message: "Issue doesn't exist",
        })
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
