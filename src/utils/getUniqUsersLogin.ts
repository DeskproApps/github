import uniq from "lodash/uniq";
import isArray from "lodash/isArray";
import { User } from "../services/github/types";

const getUniqUsersLogin = (
    user?: User|null,
    assignee?: User|null,
    assignees?: User[],
): Array<User["login"]> => {
    let users = [];

    if (user?.login) {
        users.push(user.login);
    }

    if (assignee?.login) {
        users.push(assignee.login);
    }

    if (isArray(assignees)) {
        users = users.concat(assignees.map(({ login }) => login));
    }

    users = uniq(users);

    return users
};

export { getUniqUsersLogin };
