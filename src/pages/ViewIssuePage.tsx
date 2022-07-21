import { FC, useState} from "react";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { baseRequest } from "../services/github";
import { Issue, Repository, Comments, User } from "../services/github/types";
import { getUniqUsersLogin } from "../utils";
import { ViewIssue } from "../components/ViewIssue";
import { Loading } from "../components/common";

const ViewIssuePage: FC = () => {
    const [state] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [issue, setIssue] = useState<Issue|null>(null);
    const [repository, setRepository] = useState<Repository|null>(null);
    const [users, setUsers] = useState<Record<User["id"], User>>({});
    const [comments, setComments] = useState<Comments>([]);
    const issueUrl = state.pageParams?.issueUrl;

    useInitialisedDeskproAppClient((client) => {

        if (issueUrl) {
            setLoading(true);

            baseRequest<Issue>(client, { rawUrl: issueUrl })
                .then((issue) => {
                    setIssue(issue);

                    return Promise.all([
                        Promise.resolve<Issue>(issue),
                        baseRequest<Repository>(client, { rawUrl: issue.repository_url }),
                        baseRequest<Comments>(client, { rawUrl: issue.comments_url }),
                    ])
                })
                .then(([issue, repository, comments]) => {
                    setRepository(repository);
                    setComments(comments);

                    const users = getUniqUsersLogin(issue.user, issue.assignee, issue.assignees);

                    return Promise.all(
                        users.map((userLogin) =>
                            baseRequest<User>(client, { rawUrl: `https://api.github.com/users/${userLogin}` })
                        )
                    );
                })
                .then((users) => {
                    setUsers(users.reduce((acc: Record<User["id"], User>, user: User) => {
                        if (!acc[user.id]) {
                            acc[user.id] = user;
                        }

                        return acc;
                    }, {}));
                })
                .finally(() => setLoading(false));
        }
    }, [issueUrl]);

    return loading
        ? (<Loading/>)
        : issue && repository && (
            <ViewIssue
                issue={issue}
                users={users}
                comments={comments}
                repository={repository}
            />
        );
};

export { ViewIssuePage };
