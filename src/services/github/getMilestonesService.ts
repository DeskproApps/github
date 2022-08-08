import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Milestone } from "./types";

export type Params = {
    repoFullName: string,
};

const getMilestonesService = (client: IDeskproClient, {
    repoFullName,
}: Params) => {
    return baseRequest<Milestone[]>(client, {
        url: `/repos/${repoFullName}/milestones`,
    });
};

export { getMilestonesService };
