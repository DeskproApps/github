import { IDeskproClient } from "@deskpro/app-sdk"
import { baseRequest } from "./baseRequest";
import { Issue } from "./types";

const searchByIssueService = (client: IDeskproClient, query: string) => {
    return baseRequest<{
        incomplete_results: boolean,
        items: Issue[],
        total_count: number,
    }>(client, {
        url: "/search/issues",
        queryParams: { q: `${query}+type:issue` },
        headers: {
            Accept: "application/vnd.github+json",
        }
    });
};

export { searchByIssueService };
