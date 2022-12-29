import { Reducer } from "react";
import { To } from "react-router-dom";
import { Context } from "@deskpro/app-sdk";
import {
    User,
    Issue,
    DateTime,
    Repository, LabelGQL, IssueGQL,
} from "../../services/github/types";

export type ErrorType = Error | string | unknown;

export type Page =
    | "home"
    | "log_in"
    | "link_issue"
    | "view_issue"
    | "edit_issue"
    | "add_comment";

export type PageParams = {
    issueUrl?: Issue["url"],
    commentUrl?: Issue["comments_url"],
    repoFullName?: Repository["full_name"],
};

export type DataDependencies = {
    repositories: Repository[],
    currentUser: User,
};

export interface State {
    context?: Context,
    isAuth: boolean,
    issue?: Issue | null,
    issues?: IssueGQL[],
    dataDeps?: DataDependencies,
    //...
    _error?: ErrorType,
}

export type Action =
    | { type: "loadContext", context: Context }
    | { type: "error", error: ErrorType }
    | { type: "setAuth", isAuth: boolean }
    | { type: "setIssue", issue: Issue | null }
    | { type: "setIssues", issues: IssueGQL[] }
    | { type: "unlinkIssue", issueId: Issue["id"] }
    | { type: "setDeps", deps: DataDependencies };

export type Dispatch = (action: Action) => void;

export type StoreReducer = Reducer<State, Action>;

export type AppElementPayload =
    | { type: "logout" }
    | { type: "changePage", params: To }
    | {
        type: "unlinkTicket",
        ticketId: string,
        issueId: Issue["id"],
        commentsUrl: Issue["comments_url"],
    };

export type ReplyBoxSelection = {
    id: IssueGQL["id"],
    selected: boolean,
};

export type EntityMetadata = {
    id: Issue["id"],
    title: Issue["title"],
    repository: Repository["name"],
    milestone: string,
    projects: Array<{ id: string, name: string }>,
    assignees: Array<{ username: string, name: string }>,
    labels: Array<{ id: LabelGQL["id"], name: LabelGQL["name"] }>,
    createdAt: DateTime
};

export type ClientStateIssue = {
    issueUrl: Issue["url"],
    nodeId: string,
};
