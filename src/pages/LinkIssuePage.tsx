import { FC, useEffect/*, useState*/ } from "react";
// import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
    // TwoButtonGroup,
    // TwoButtonGroupProps,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useSetAppTitle } from "../hooks";
import { AddIssue } from "./AddIssue";
// import { CreateIssue } from "./CreateIssue";

const LinkIssuePage: FC = () => {
    // const [selected, setSelected] = useState<TwoButtonGroupProps["selected"]>("one");
    const { client } = useDeskproAppClient();

    useSetAppTitle("Add Issue");

    useEffect(() => {
        if (!client) {
            return;
        }

        client?.deregisterElement("githubPlusButton");
        client?.deregisterElement("githubHomeButton");

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

    // const onChangeSelected = (active: TwoButtonGroupProps["selected"]) => () => setSelected(active);

    return (<AddIssue/>);
    /*
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
            {selected === "one" && <AddIssue />}
            {selected === "two" && <CreateIssue />}
        </>
    );
    */
};

export { LinkIssuePage };
