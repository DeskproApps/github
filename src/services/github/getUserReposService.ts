import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Repository } from "./types";

const getUserReposService = (client: IDeskproClient, page?: number) => {
    return baseRequest<Repository[]>(client, {
        url: "/user/repos",
        queryParams: {
            per_page: 100,
            affiliation: "owner,collaborator,organization_member",
            ...(page ? { page } : {}),
        }
    })
};

export { getUserReposService };
