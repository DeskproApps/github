import { IDeskproClient } from "@deskpro/app-sdk";
import { ENTITY_GITHUB_ISSUE } from "./constants";
import { EntityMetadata } from "../../context/StoreProvider/types";
import { Issue } from "../github/types";

const setEntityIssueService = (
    client: IDeskproClient,
    ticketId: string,
    issueId: Issue["id"],
    metaData?: EntityMetadata,
) => {
    return client
        .getEntityAssociation(ENTITY_GITHUB_ISSUE, ticketId)
        .set(`${issueId}`, metaData)
};

export { setEntityIssueService };
