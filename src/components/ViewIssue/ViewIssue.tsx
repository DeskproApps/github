import { FC } from "react";
import {
    faUser,
    faTimes,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Tag, Avatar, Icon } from "@deskpro/deskpro-ui";
import {
    H3,
    P5,
    Pill,
    Stack,
    HorizontalDivider,
    useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { getIssueStatueColorScheme } from "../../utils";
import { getDate } from "../../utils/date";
import {
    TwoSider,
    GithubLink,
    TextBlockWithLabel,
} from "../common";
import { Comments } from "./Comments";
import { mdToHtml } from "../../utils";
import { Props } from "./types";
import styled from "styled-components";

const Link = styled.a`
    color: ${({ theme }) => theme.colors.grey40};
`;

const ViewIssue: FC<Props> = ({ issue, repository, users, comments, onAddNewComment }) => {
    const { theme } = useDeskproAppTheme();

    return (
        <>
            <Stack align="center" gap={6} style={{ marginBottom: 10 }}>
                <H3>{issue.title}</H3>
                <GithubLink href={issue.html_url} />
            </Stack>

            <TextBlockWithLabel
                text={<P5 dangerouslySetInnerHTML={{ __html: mdToHtml(issue.body || "") }} />}
                label="Description"
            />

            <TwoSider
                leftLabel="Status"
                leftText={
                    <Pill
                        label={issue.state}
                        textColor={theme.colors.white}
                        backgroundColor={getIssueStatueColorScheme(theme, issue.state)}
                    />
                }
                rightLabel="Date Created"
                rightText={getDate(issue.created_at)}
            />

            <TwoSider
                leftLabel="Issue ID"
                leftText={issue.number}
                rightLabel="Repository"
                rightText={(
                    <P5>
                        {repository.name}
                        &nbsp;
                        <Link href={repository.html_url} target="_blank">
                            <Icon icon={faArrowUpRightFromSquare} />
                        </Link>
                    </P5>
                )}
            />

            <TextBlockWithLabel
                label="Milestone"
                text={!issue.milestone
                    ? "-"
                    : (
                        <P5>
                            {issue.milestone?.title}&nbsp;
                            <Link href={issue.milestone?.html_url} target="_blank">
                                <Icon icon={faArrowUpRightFromSquare} />
                            </Link>
                        </P5>
                    )
                }
            />

            <TextBlockWithLabel
                label="Author"
                text={(
                    <Stack gap={6}>
                        <Avatar
                            size={18}
                            name={issue.user.login}
                            backupIcon={faUser}
                            {...(issue.user?.avatar_url ? { imageUrl: issue.user.avatar_url } : {})}
                        />
                        <P5>{users[issue.user.id].name}</P5>
                    </Stack>
                )}
            />

            <TextBlockWithLabel
                label="Assignees"
                text={
                    (!Array.isArray(issue.assignees) || !issue.assignees.length)
                        ? <>-</>
                        : <Stack wrap="wrap" gap={6}>
                            {issue.assignees.map(({ id, avatar_url }) => (
                                <Stack gap={6} key={id}>
                                    <Avatar
                                        size={18}
                                        name={users[id].name}
                                        backupIcon={faUser}
                                        {...(avatar_url ? { imageUrl: avatar_url } : {})}
                                    />
                                    <P5>{users[id].name}</P5>
                                </Stack>
                            ))}
                        </Stack>
                }
            />

            <TextBlockWithLabel
                label="Labels"
                text={(Array.isArray(issue.labels) && issue.labels.length > 0)
                    ? (
                        <Stack wrap="wrap" gap={6}>
                            {issue.labels.map((label) => {
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
                    : "-"
                }
            />

            <HorizontalDivider style={{ marginBottom: 10 }} />

            <Comments comments={comments} onClickTitleAction={onAddNewComment} />
        </>
    );
};

export { ViewIssue };
