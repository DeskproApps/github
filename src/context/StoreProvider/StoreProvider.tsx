import { createContext, FC, ReactNode } from "react";
import { State, Dispatch } from "./types";
import { initialState, reducer } from "./reducer";
import { useStoreReducer } from "./hooks";

export const StoreContext = createContext<[State, Dispatch]>([initialState, () => {}]);

export interface StoreProviderProps {
    children: ReactNode | JSX.Element;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }: StoreProviderProps) => {
    const [state, dispatch] = useStoreReducer(reducer, initialState);

    return (
        <StoreContext.Provider value={[state, dispatch]}>
            {children}
        </StoreContext.Provider>
    );
};
