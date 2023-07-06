import { DeskproAppTheme } from "@deskpro/app-sdk";
import { Issue, Repository, User, Comments, ProjectGQL, PullRequest, DateTime } from "../../services/github/types";

export type Props = {
    issue: Issue,
    users: Record<User["id"], User>,
    repository: Repository,
    comments: Comments,
    projects: ProjectGQL[],
    onAddNewComment: () => void,
    pullRequests: PullRequest[],
};

export type PullRequestProps = Pick<PullRequest, "state"|"title"|"url"> & {
    date: DateTime,
    theme: DeskproAppTheme["theme"],
};

export type CommentProps = {
    comments: Comments,
    onClickTitleAction: () => void,
};
