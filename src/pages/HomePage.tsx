import { FC, useState, useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { getEntityCardListService } from "../services/entityAssociation";
import { useSetAppTitle } from "../hooks";
import { Loading } from "../components/common";

const HomePage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const ticketId = state.context?.data.ticket.id;

    useSetAppTitle("GitHub Issues");

    useEffect(() => {
        if (!client) {
            return;
        }

        client?.registerElement("githubPlusButton", {
            type: "plus_button",
            payload: { type: "changePage", page: "link_issue" },
        });
        client?.registerElement("githubMenu", {
            type: "menu",
            items: [{
                title: "Log Out",
                payload: { type: "logout" },
            }],
        });
    }, [client]);

    useEffect(() => {
        if (!ticketId || !client) {
            return;
        }

        setLoading(true);

        getEntityCardListService(client, ticketId)
            .then((issueIds) => {
                if (Array.isArray(issueIds) && issueIds.length > 0) {
                    //...
                } else {
                    dispatch({ type: "changePage", page: "link_issue" })
                }
            })
            .catch((error) => dispatch({ type: "error", error }))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, ticketId]);

    return loading
        ? (<Loading/>)
        : (
            <>Length: 0</>
        );
};

export { HomePage };
