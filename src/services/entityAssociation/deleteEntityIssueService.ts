import { IDeskproClient } from "@deskpro/app-sdk";
import { ENTITY_GITHUB_ISSUE } from "./constants";
import { Issue } from "../github/types";

const deleteEntityIssueService = (
    client: IDeskproClient,
    ticketId: string,
    issueId: Issue["id"],
) => {
    return client
        .getEntityAssociation(ENTITY_GITHUB_ISSUE, ticketId)
        .delete(`${issueId}`)
        .then(() => client.deleteState(`issues/${issueId}`));
};

export { deleteEntityIssueService };
