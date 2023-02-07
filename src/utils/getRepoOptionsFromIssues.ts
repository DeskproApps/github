import uniqWith from "lodash/uniqWith";
import { IssueGQL, RepositoryGQL } from "../services/github/types";

const getRepoOptionsFromIssues = (issues: IssueGQL[]): Array<{
    key: RepositoryGQL["id"],
    value: RepositoryGQL["nameWithOwner"],
    label: RepositoryGQL["name"],
    type: "value",
}>=> {
    if (!Array.isArray(issues) || issues.length === 0) {
        return [];
    }

    return uniqWith(issues, (a, b) => a.repository.id === b.repository.id).map((issue) => ({
        key: issue.repository.id,
        value: issue.repository.nameWithOwner,
        label: issue.repository.name,
        type: "value",
    }));
};

export { getRepoOptionsFromIssues };
