import { FC, useState } from "react";
import isEmpty from "lodash/isEmpty";
import {faArrowUpRightFromSquare, faTimes, faUser} from "@fortawesome/free-solid-svg-icons";
import {Avatar, Tag} from "@deskpro/deskpro-ui";
import {
    H3,
    P5,
    Pill,
    Icon,
    Stack,
    useDeskproAppTheme,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import {
    getEntityAssociationCountService,
} from "../../../services/entityAssociation/getEntityAssociationCountService";
import { Issue } from "../../../services/github/types";
import { getDate } from "../../../utils/date";
import { getIssueStatueColorScheme } from "../../../utils";
import { nbsp } from "../../../constants";
import { GithubLink } from "../GithubLink";
import { TwoSider } from "../TwoSider";
import { TextBlockWithLabel } from "../TextBlockWithLabel";
import { Link } from "../Link";

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

const Assignees: FC<{ assignees: Issue["assignees"] }> = ({ assignees }) => {
    return (!Array.isArray(assignees) || !assignees.length)
        ? <>-</>
        : <Stack wrap="wrap" gap={6}>
            {assignees.map(({ login, name, avatarUrl }) => (
                <Stack gap={6} key={login}>
                    <Avatar
                        size={18}
                        name={name}
                        backupIcon={faUser}
                        {...(avatarUrl ? { imageUrl: avatarUrl } : {})}
                    />
                    <P5>{name}</P5>
                </Stack>
            ))}
        </Stack>
};

const Labels: FC<{ labels: Issue["labels"] }> = ({ labels }) => {
    const { theme } = useDeskproAppTheme();
    return (Array.isArray(labels) && labels.length > 0)
        ? (
            <Stack wrap="wrap" gap={6}>
                {labels.map((label) => {
                    return (
                        <Tag
                            closeIcon={faTimes}
                            key={label.id}
                            color={{
                                borderColor: `#${label.color}`,
                                backgroundColor: `#${label.color}33`,
                                textColor: theme.colors.grey100,
                            }}
                            label={label.name}
                            withClose={false}
                        />
                    );
                })}
            </Stack>
        )
        : <>-</>;
};

const TicketsInfo: FC<Props> = ({ id, repository, number, assignees, labels }) => {
    const [ticketCount, setTicketCount] = useState<number>(0);

    useInitialisedDeskproAppClient((client) => {
        getEntityAssociationCountService(client, `${id}`).then(setTicketCount);
    });

    return (
        <>
            <TwoSider
                leftLabel="Issue ID"
                leftText={number}
                rightLabel={(
                    <>
                        Repository
                        {nbsp}
                        <Link href={repository?.url ?? ""} target="_blank">
                            <Icon icon={faArrowUpRightFromSquare} />
                        </Link>
                    </>
                )}
                rightText={repository.name}
            />
            <TwoSider
                leftLabel="Projects"
                leftText="Projects"
                rightLabel="Milestone"
                rightText="Milestone"
            />
            <TextBlockWithLabel
                label="Asignees"
                text={<Assignees assignees={assignees}/>}
            />
            <TextBlockWithLabel
                label="Labels"
                text={<Labels labels={labels}/>}
            />
            <TextBlockWithLabel
                label="Deskpro Tickets"
                text={ticketCount}
            />
        </>
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
