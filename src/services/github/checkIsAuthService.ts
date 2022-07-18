import { IDeskproClient } from "@deskpro/app-sdk";
import { getCurrentUserService } from "./getCurrentUserService";

const checkIsAuthService = (client: IDeskproClient) => {
    return getCurrentUserService(client)
        .then((data) => Promise.resolve(!!data?.id))
        .catch(() => Promise.resolve(false));
};

export { checkIsAuthService };
