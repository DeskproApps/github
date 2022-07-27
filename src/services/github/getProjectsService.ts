import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Projects } from "./types";

export type Params = {
    repoFullName: string,
};

const getProjectsService = (client: IDeskproClient, {
    repoFullName,
}: Params) => {
    return baseRequest<Projects>(client, {
        url: `/repos/${repoFullName}/projects`,
    });
};

export { getProjectsService };
