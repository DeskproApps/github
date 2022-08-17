import { Issue, Repository, User, Comments, ProjectGQL } from "../../services/github/types";

export type Props = {
    issue: Issue,
    users: Record<User["id"], User>,
    repository: Repository,
    comments: Comments,
    projects: ProjectGQL[],
    onAddNewComment: () => void,
};

export type CommentProps = {
    comments: Comments,
    onClickTitleAction: () => void,
};
