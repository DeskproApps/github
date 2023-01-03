import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Label, Repository } from "./types";

export type Params = {
    repoFullName?: string,
    rawUrl?: Repository["url"],
    data: Record<string, string>,
};

const createLabelService = (client: IDeskproClient, {
    data,
    rawUrl = "",
    repoFullName = "",
}: Params) => {
    return baseRequest<Label>(client, {
        method: "POST",
        ...(rawUrl ? { rawUrl } : { url: `/repos/${repoFullName}/labels` }),
        data,
    });
};

export { createLabelService };
