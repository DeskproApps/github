import isEmpty from "lodash/isEmpty";
import { EntityMetadata } from "../context/StoreProvider/types";
import { Issue } from "../services/github/types";

const getEntityMetadata = (issue: Issue): undefined|EntityMetadata => {
    if (!issue || isEmpty(issue)) {
        return undefined;
    }

    return {
        id: issue.id,
        title: issue.title,
        repository: issue?.repository_name || "",
        milestone: issue?.milestone?.title || "",
        projects: [],
        // ToDo: need user full info
        assignees: issue.assignees?.map(({ login }) => ({ name: "", username: login })) || [],
        labels: issue.labels?.map(({ id, name }) => ({ id, name })) || [],
        createdAt: issue.created_at,
    };
};

export { getEntityMetadata };
