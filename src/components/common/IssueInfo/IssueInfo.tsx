import { FC, MouseEvent, useState, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import {
    faUser,
    faTimes,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Avatar, Tag, H3, P5, Pill, Icon, Stack } from "@deskpro/deskpro-ui";
import { useDeskproAppTheme, useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { getEntityAssociationCountService } from "../../../services/entityAssociation";
import {
    IssueGQL,
    ProjectGQL,
    Milestone as MilestoneType,
} from "../../../services/github/types";
import { format } from "../../../utils/date";
import { getIssueStatueColorScheme } from "../../../utils";
import { nbsp } from "../../../constants";
import { GithubLink } from "../GithubLink";
import { TwoSider } from "../TwoSider";
import { TextBlockWithLabel } from "../TextBlockWithLabel";
import { Link } from "../Link";

type Props = IssueGQL & {
    onClick?: () => void,
};

const Title: FC<Props> = ({ title, url, onClick }) => {
    const { theme } = useDeskproAppTheme();
    const onClickTitle = useCallback((e: MouseEvent) => {
        e.preventDefault();
        onClick && onClick();
    }, [onClick]);

    return (
        <Stack gap={6} style={{ marginBottom: "6px" }} align="center">
            <H3>
                <a
                    href="#"
                    style={{ color: theme.colors.cyan100, textDecoration: "none" }}
                    onClick={onClickTitle}
                >{title}</a>
            </H3>
            <GithubLink href={url} />
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
            rightText={format(props.created_at)}
        />
    );
};

const Assignees: FC<{ assignees: IssueGQL["assignees"] }> = ({ assignees }) => {
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

const Labels: FC<{ labels: IssueGQL["labels"] }> = ({ labels }) => {
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

const Milestone: FC<{
    milestone: Pick<MilestoneType, "title" | "url">
}> = ({ milestone }) => {
    return isEmpty(milestone)
        ? (<>-</>)
        : (
            <P5>
                {milestone.title}
                {nbsp}
                <Link href={milestone.url} target="_blank">
                    <Icon icon={faArrowUpRightFromSquare}/>
                </Link>
            </P5>
        );
};

const Projects: FC<{ projects: ProjectGQL[] }> = ({ projects }) => {
    return (
        <Stack vertical>
            {(Array.isArray(projects) && projects.length > 0)
                ? projects.map(({ id, title, url }) => (
                    <P5 key={id}>
                        {title}
                        {nbsp}
                        <Link href={url} target="_blank">
                            <Icon icon={faArrowUpRightFromSquare}/>
                        </Link>
                    </P5>
                ))
                : <>-</>
            }
        </Stack>
    );
};

const TicketsInfo: FC<Props> = ({ id, repository, number, assignees, labels, milestone, projects }) => {
    const [ticketCount, setTicketCount] = useState<number>(0);

    useInitialisedDeskproAppClient((client) => {
        getEntityAssociationCountService(client, `${id}`).then(setTicketCount);
    });

    return (
        <>
            <TwoSider
                leftLabel="Issue ID"
                leftText={number}
                rightLabel="Repository"
                rightText={(
                    <P5>
                        {repository.name}
                        {nbsp}
                        <Link href={repository?.url ?? ""} target="_blank">
                            <Icon icon={faArrowUpRightFromSquare} />
                        </Link>
                    </P5>
                )}
            />
            <TwoSider
                leftLabel="Projects"
                leftText={<Projects projects={projects}/>}
                rightLabel="Milestone"
                rightText={<Milestone milestone={milestone} />}
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
