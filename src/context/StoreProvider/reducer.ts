import { __, match } from "ts-pattern";
import { State, Action, StoreReducer } from "./types";

export const initialState: State = {
    isAuth: false,
    _error: undefined,
};

export const reducer: StoreReducer = (state: State, action: Action): State => {
    return match<[State, Action]>([state, action])
        .with([__, { type: "loadContext" }], ([prevState, action]) => ({
            ...prevState,
            context: action.context,
        }))
        .with([__, { type: "error" }], ([prevState, action]) => ({
            ...prevState,
            _error: action.error,
        }))
        .with([__, { type: "setAuth" }], ([prevState, action]) => ({
            ...prevState,
            isAuth: action.isAuth,
        }))
        .with([__, { type: "setIssue" }], ([prevState, action]) => ({
            ...prevState,
            issue: action.issue,
        }))
        .with([__, { type: "setIssues" }], ([prevState, action]) => ({
            ...prevState,
            issues: action.issues,
        }))
        .with([__, { type: "unlinkIssue" }], ([prevState, action]) => ({
            ...prevState,
            issues: (prevState.issues ?? []).filter(({ databaseId }) => databaseId !== action.issueId),
        }))
        .with([__, { type: "setDeps" }], ([prevState, action]) => ({
            ...prevState,
            dataDeps: action.deps,
        }))
        .otherwise(() => state);
};
