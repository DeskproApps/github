import { FC, useState, useEffect } from "react";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
    TwoButtonGroup,
    TwoButtonGroupProps,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useSetAppTitle } from "../hooks";
import { LinkIssue } from "./LinkIssue";
import { CreateIssue } from "./CreateIssue";

const AddIssuePage: FC = () => {
    const [selected, setSelected] = useState<TwoButtonGroupProps["selected"]>("one");
    const { client } = useDeskproAppClient();

    useSetAppTitle("AddIssue");

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
    }, [client]);

    const onChangeSelected = (active: TwoButtonGroupProps["selected"]) => () => setSelected(active);

    return (
        <>
            <TwoButtonGroup
                selected={selected}
                oneIcon={faSearch}
                oneLabel="Find Card"
                oneOnClick={onChangeSelected("one")}
                twoIcon={faPlus}
                twoLabel="Create Card"
                twoOnClick={onChangeSelected("two")}
            />
            {selected === "one" && <LinkIssue />}
            {selected === "two" && <CreateIssue />}
        </>
    );
};

export { AddIssuePage };
