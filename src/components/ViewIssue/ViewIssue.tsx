import { FC } from "react";
import { Info } from "./Info";
import { PullRequests } from "./PullRequests";
import { Comments } from "./Comments";
import { Props } from "./types";

const ViewIssue: FC<Props> = ({
    issue,
    users,
    comments,
    projects,
    repository,
    pullRequests,
    onAddNewComment,
}) => {
    return (
        <>
            <Info
                issue={issue}
                users={users}
                projects={projects}
                repository={repository}
            />

            <PullRequests pullRequests={pullRequests}/>

            <Comments comments={comments} onClickTitleAction={onAddNewComment} />
        </>
    );
};

export { ViewIssue };
