import { __, match } from "ts-pattern";
import { State, Action, StoreReducer } from "./types";

export const initialState: State = {
    isAuth: false,
    _error: undefined,
};

export const reducer: StoreReducer = (state: State, action: Action): State => {
    return match<[State, Action]>([state, action])
        .with([__, { type: "changePage" }], ([prevState, action]) => ({
            ...prevState,
            page: action.page,
            pageParams: action.params,
        }))
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
        .otherwise(() => state);
};
