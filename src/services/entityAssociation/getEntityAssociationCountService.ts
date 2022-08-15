import { IDeskproClient } from "@deskpro/app-sdk";
import { ENTITY_GITHUB_ISSUE } from "./constants";

const getEntityAssociationCountService = (client: IDeskproClient, id: string) => {
    return client.entityAssociationCountEntities(ENTITY_GITHUB_ISSUE, id);
};

export { getEntityAssociationCountService };
