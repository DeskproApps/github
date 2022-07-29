import { useState } from "react";
import isEmpty from "lodash/isEmpty";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    getUserReposService,
    getCurrentUserService,
} from "../services/github";

const useLoadDataDependencies = () => {
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(true);

    useInitialisedDeskproAppClient((client) => {
        if (isEmpty(state.dataDeps)) {
            Promise.all([
                getUserReposService(client)
                    .then((repos) => {
                        // ToDo: Do it in service and retry as long as there are items
                        if (repos.length === 100) {
                            return getUserReposService(client, 2)
                                .then((secondPageRepos) => [...repos, ...secondPageRepos]);
                        } else {
                            return repos;
                        }
                    }),
                getCurrentUserService(client)
            ])
                .then(([repos, currentUser]) => {
                    dispatch({ type: "setDeps", deps: {
                        repositories: repos,
                        currentUser,
                    }})
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    });

    return { loading };
};

export { useLoadDataDependencies };
