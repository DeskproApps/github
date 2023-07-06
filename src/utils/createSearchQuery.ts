import type { User } from "../services/github/types";
import type { FilterValues } from "../components/LinkIssue/types";

export type Filters = Partial<FilterValues> & {
    login?: User["login"],
};

const createSearchQuery = (q: string, filter?: Filters): string => {
    let searchQuery = `${q} is:issue`;

    if (filter?.involveMe && filter?.login) {
        searchQuery = `${searchQuery} involves:${filter.login}`;
    }

    if (filter?.searchIn && (filter.searchIn.length !== 0) && !filter.searchIn.some((v) => v === "all")) {
        searchQuery = `${searchQuery} in:${filter.searchIn.join(",")}`;
    }

    return searchQuery;
};

export { createSearchQuery };
