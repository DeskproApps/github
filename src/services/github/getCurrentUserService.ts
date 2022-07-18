import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { User } from "./types";

const getCurrentUserService = (client: IDeskproClient) => {
    return baseRequest<User>(client, { url: "/user" });
};

export { getCurrentUserService };
