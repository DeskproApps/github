import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { BASE_URL } from "./constants";
import { isBaseUrl } from "../../utils";
import { Issue } from "./types";

export const getIssueUrl = (url: string): string => {
    if (isBaseUrl(url)) {
        return url;
    } else {
        return `${BASE_URL}/repos${url}`;
    }
};

const getIssueService = (client: IDeskproClient, { url }: { url: string }) => {
    return baseRequest<Issue>(client, { rawUrl: getIssueUrl(url) });
};

export { getIssueService };
