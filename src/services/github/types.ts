import { IDeskproClient } from "@deskpro/app-sdk";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestParams = {
    url: string,
    method?: ApiRequestMethod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    queryParams?: Record<string, string|number|boolean>
};

export type Request = <T>(
    client: IDeskproClient,
    params: RequestParams
) => Promise<T>;

/**
 * An ISO-8601 encoded UTC date time string. Example value: `""2019-09-07T15:50:00Z"`.
 */
export type DateTime = string;
