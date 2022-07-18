import { IDeskproClient } from "@deskpro/app-sdk"
import { baseRequest } from "./baseRequest";
import { Issue, Repository } from "./types";

type Response = {
    incomplete_results: boolean,
    items: Issue[],
    total_count: number,
}

const searchByIssueService = (
    client: IDeskproClient,
    query: string,
    repo: Repository["full_name"],
) => {
    return baseRequest<Response>(client, {
        url: "/search/issues",
        queryParams: {
            state: "all",
            q: `${query}+type:issue repo:${repo}`,
            per_page: 100,
        },
        headers: {
            Accept: "application/vnd.github+json",
        }
    });
};

export { searchByIssueService };
