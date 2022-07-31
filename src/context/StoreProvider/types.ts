import { Reducer } from "react";
import { Context } from "@deskpro/app-sdk";
import {
    User,
    Label,
    Issue,
    DateTime,
    Repository,
} from "../../services/github/types";

export type ErrorType = Error | string | unknown;

export type Page =
    | "home"
    | "log_in"
    | "link_issue"
    | "view_issue"
    | "edit_issue";

export type PageParams = {
    issueUrl?: Issue["url"],
};

export type DataDependencies = {
    repositories: Repository[],
    currentUser: User,
};

export interface State {
    page?: Page;
    pageParams?: PageParams,
    context?: Context,
    isAuth: boolean,
    issue?: Issue,
    dataDeps?: DataDependencies,
    //...
    _error?: ErrorType,
}

export type Action =
    | { type: "changePage", page: Page, params?: PageParams }
    | { type: "loadContext", context: Context }
    | { type: "error", error: ErrorType }
    | { type: "setAuth", isAuth: boolean }
    | { type: "setIssue", issue: Issue }
    | { type: "setDeps", deps: DataDependencies };

export type Dispatch = (action: Action) => void;

export type StoreReducer = Reducer<State, Action>;

export type AppElementPayload =
    | { type: "logout" }
    | { type: "changePage", page: Page, params?: PageParams }
    | {
        type: "unlinkTicket",
        ticketId: string,
        issueId: Issue["id"],
        commentsUrl: Issue["comments_url"],
    };

export type ReplyBoxNoteSelection = {
    id: string;
    selected: boolean;
};

export type EntityMetadata = {
    id: Issue["id"],
    title: Issue["title"],
    repository: Repository["name"],
    milestone: string,
    projects: Array<{ id: string, name: string }>,
    assignees: Array<{ username: string, name: string }>,
    labels: Array<{ id: Label["id"], name: Label["name"] }>,
    createdAt: DateTime
};

export type ClientStateIssue = {
    issueUrl: Issue["url"],
};
