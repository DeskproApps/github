import { Reducer } from "react";
import { Context } from "@deskpro/app-sdk";

export type ErrorType = Error | string | unknown;

export type Page =
    | "home"
    | "log_in"
    | "add_issue";

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
