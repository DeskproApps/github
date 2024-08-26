import { FC, useEffect, useState } from "react";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
    TwoButtonGroup,
    TwoButtonGroupProps,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useSetAppTitle, useLoadDataDependencies } from "../hooks";
import { AddIssue } from "./AddIssue";
import { CreateIssue } from "./CreateIssue";
import { Loading, Container } from "../components/common";

const LinkIssuePage: FC = () => {
    const [selected, setSelected] = useState<TwoButtonGroupProps["selected"]>("one");
    const { loading } = useLoadDataDependencies();

    const { client } = useDeskproAppClient();

    useSetAppTitle("Add Issue");

    useEffect(() => {
        if (!client) {
            return;
        }

        client?.deregisterElement("githubPlusButton");
        client?.deregisterElement("githubHomeButton");
        client?.deregisterElement("githubEditButton");

        client?.registerElement("githubMenu", {
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

    if (loading) {
        return <Loading/>
    }

    return (
        <Container>
            <TwoButtonGroup
                selected={selected}
                oneIcon={faSearch}
                oneLabel="Find Issue"
                oneOnClick={onChangeSelected("one")}
                twoIcon={faPlus}
                twoLabel="Create Issue"
                twoOnClick={onChangeSelected("two")}
            />
            {selected === "one" && <AddIssue />}
            {selected === "two" && <CreateIssue />}
        </Container>
    );
};

export { LinkIssuePage };
