import { useContext, useReducer } from "react";
import { State, StoreReducer } from "./types";
import { StoreContext } from "./StoreProvider";

export const useStoreReducer = (reducer: StoreReducer, initialState: State) => useReducer(reducer, initialState);

export const useStore = () => useContext(StoreContext);
