import { Issue, Repository, User, Comments } from "../../services/github/types";

export type Props = {
    issue: Issue,
    users: Record<User["id"], User>,
    repository: Repository,
    comments: Comments,
};
