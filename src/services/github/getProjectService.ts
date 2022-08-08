import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Project } from "./types";

const getProjectService = (client: IDeskproClient, projectId: Project["id"]) => {
    return baseRequest<Project>(client, {
        url: `/projects/${projectId}`
    })
};

export { getProjectService };
