import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Labels } from "./types";

export type Params = {
    repoFullName: string,
};

const getLabelsService = (client: IDeskproClient, {
    repoFullName,
}: Params) => {
    return baseRequest<Labels>(client, {
        url: `/repos/${repoFullName}/labels`,
    });
};

export { getLabelsService };
