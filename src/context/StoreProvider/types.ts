import { Reducer } from "react";
import { Context } from "@deskpro/app-sdk";
import {Issue, DateTime, Repository} from "../../services/github/types";

export type ErrorType = Error | string | unknown;

export type Page =
    | "home"
    | "log_in"
    | "link_issue";

export type PageParams = {
    //...
};

export interface State {
    page?: Page;
    pageParams?: PageParams,
    context?: Context,
    _error?: ErrorType,
    isAuth: boolean,
}

export type Action =
    | { type: "changePage", page: Page, params?: PageParams }
    | { type: "loadContext", context: Context }
    | { type: "error", error: ErrorType }
    | { type: "setAuth", isAuth: boolean };

export type Dispatch = (action: Action) => void;

export type StoreReducer = Reducer<State, Action>;

export type AppElementPayload =
    | { type: "logout" }
    | { type: "changePage", page: Page, params?: PageParams };

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
    labels: Array<{ id: string, name: string }>,
    createdAt: DateTime
};
