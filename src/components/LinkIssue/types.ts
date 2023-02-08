import { Repository, RepositoryGQL } from "../../services/github/types";

export type OptionRepository = {
    key: RepositoryGQL["id"],
    value: RepositoryGQL["nameWithOwner"],
    label: Repository["name"],
    type: "value",
};

export type SearchInValue = "all"|"title"|"body"|"comments";

export type FilterValues = {
    involveMe: boolean,
    searchIn: Array<SearchInValue>,
};
