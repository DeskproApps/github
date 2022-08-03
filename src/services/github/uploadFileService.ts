import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest"
import { Repository } from "./types";
import { getUniqFilename } from "../../utils";

export type Params = {
    repoFullName: Repository["full_name"],
    fileName: string,
    file: string,
};

/**
 * @see Repository content https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
 */
const uploadFileService = (client: IDeskproClient, {
    file,
    fileName,
    repoFullName,
}: Params) => {
    return baseRequest(client, {
        url: `/repos/${repoFullName}/contents/${getUniqFilename(fileName)}`,
        method: "PUT",
        data: {
            message: fileName,
            content: file,
        },
    });
};

export { uploadFileService };
