import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { BASE_URL } from "./constants";
import { isBaseUrl } from "../../utils";

const getUrl = (url: string): string => {
    if (isBaseUrl(url)) {
        return url;
    } else {
        return `${BASE_URL}/repos/${url}`;
    }
};

const getIssueService = (client: IDeskproClient, { url }: { url: string }) => {
    return baseRequest(client, { rawUrl: getUrl(url) });
};

export { getIssueService };
