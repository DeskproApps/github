import { IDeskproClient } from "@deskpro/app-sdk";
import { ENTITY_GITHUB_ISSUE } from "./constants";

const getEntityCardListService = (
    client: IDeskproClient,
    ticketId: string,
): Promise<string[]> => {
    return client
        .getEntityAssociation(ENTITY_GITHUB_ISSUE, ticketId)
        .list();
};

export { getEntityCardListService };
