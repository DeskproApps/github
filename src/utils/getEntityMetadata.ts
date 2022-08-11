import isEmpty from "lodash/isEmpty";
import { EntityMetadata } from "../context/StoreProvider/types";
import { IssueGQL } from "../services/github/types";

const getEntityMetadata = (issue: IssueGQL): undefined|EntityMetadata => {
    if (!issue || isEmpty(issue)) {
        return undefined;
    }

    return {
        id: issue.databaseId,
        title: issue.title,
        repository: issue?.repository.nameWithOwner || "",
        milestone: issue?.milestone?.title || "",
        projects: [],
        // ToDo: need user full info
        assignees: issue.assignees?.map(({ login, name }) => ({ name: name || "", username: login })) ?? [],
        labels: issue.labels?.map(({ id, name }) => ({ id, name })) ?? [],
        createdAt: issue.created_at,
    };
};

export { getEntityMetadata };
