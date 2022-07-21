import { FC, useState } from "react";
import {
    H3,
    Pill,
    Stack,
    useDeskproAppTheme,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { Issue } from "../../../services/github/types";
import { getDate } from "../../../utils/date";
import { getIssueStatueColorScheme } from "../../../utils";
import { GithubLink } from "../GithubLink";
import { TwoSider } from "../TwoSider";
import { TextBlockWithLabel } from "../TextBlockWithLabel";

type Props = Issue & {
    onClick?: () => void,
};

const Title: FC<Props> = ({ title, html_url, onClick }) => {
    const { theme } = useDeskproAppTheme();

    return (
        <Stack gap={6} style={{ marginBottom: "6px" }} align="center">
            <H3>
                <a
                    href="#"
                    style={{ color: theme.colors.cyan100, textDecoration: "none" }}
                    onClick={onClick}
                >{title}</a>
            </H3>
            <GithubLink href={html_url} />
        </Stack>
    );
};

const StatusAndDate: FC<Props> = (props) => {
    const { theme } = useDeskproAppTheme();

    return (
        <TwoSider
            leftLabel="Status"
            leftText={
                <Pill
                    label={props.state}
                    textColor={theme.colors.white}
                    backgroundColor={getIssueStatueColorScheme(theme, props.state)}
                />
            }
            rightLabel="Date Created"
            rightText={getDate(props.created_at)}
        />
    );
};

const TicketsInfo: FC<Props> = ({ id }) => {
    const [ticketCount, setTicketCount] = useState<number>(0);

    useInitialisedDeskproAppClient((client) => {
        client.entityAssociationCountEntities("linkedGithubIssue", `${id}`).then(setTicketCount);
    });

    return (
        <TextBlockWithLabel
            label="Deskpro Tickets"
            text={ticketCount}
        />
    );
};

const IssueInfo: FC<Props> = (props) => {
    return (
        <>
            <Title {...props} />
            <StatusAndDate {...props} />
            <TicketsInfo {...props} />
        </>
    );
};

export { IssueInfo };
