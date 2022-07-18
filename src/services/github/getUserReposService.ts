import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Repository } from "./types";

const getUserReposService = (client: IDeskproClient) => {
    return baseRequest<Repository[]>(client, {
        url: "/user/repos",
        queryParams: {
            per_page: 100,
            affiliation: "collaborator,organization_member",
        }
    })
};

export { getUserReposService };
