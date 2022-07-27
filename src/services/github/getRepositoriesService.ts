import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { User } from "./types";

export type Params = {
    repoFullName: string,
};

const getRepositoriesService = (client: IDeskproClient, {
    repoFullName,
}: Params) => {
    return baseRequest<User[]>(client, {
        url: `/repos/${repoFullName}/contributors`,
    });
};

export { getRepositoriesService };
