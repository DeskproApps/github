import { FC, useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useSetAppTitle } from "../hooks";

const HomePage: FC = () => {
    const { client } = useDeskproAppClient();

    useSetAppTitle("GitHub Issues");

    useEffect(() => {
        if (!client) {
            return;
        }

        client?.registerElement("trelloMenu", {
            type: "menu",
            items: [{
                title: "Log Out",
                payload: {
                    type: "logout",
                },
            }],
        });
    }, [client])

    return (
        <></>
    );
};

export { HomePage };
