import { FC, Fragment } from "react";
import capitalize from "lodash/capitalize";
import {
    H3,
    Pill,
    Stack,
    HorizontalDivider,
    useDeskproAppTheme,
} from "@deskpro/app-sdk";
import {
    Title,
    TwoSider,
    GithubLink,
} from "../common";
import { isLast, getPRStateColor } from "../../utils";
import { format } from "../../utils/date";
import { Props, PullRequestProps } from "./types";

const PullRequest: FC<PullRequestProps> = ({ url, title, state, theme, date }) => (
    <>
        <Stack gap={6} align="start" style={{ marginBottom: 10 }}>
            <H3 style={{ flexGrow: 1 }}>{title}</H3>
            <GithubLink href={url} />
        </Stack>
        <TwoSider
            leftText={(
                <Pill
                    label={capitalize(state)}
                    textColor={theme.colors.white}
                    backgroundColor={getPRStateColor(theme, state)}
                />
            )}
            rightText={format(date)}
        />
    </>
);

const PullRequests: FC<Pick<Props, "pullRequests">> = ({ pullRequests = [] }) => {
    const { theme } = useDeskproAppTheme();

    return (
        <>
            <Title>Linked Pull Requests ({pullRequests?.length || 0})</Title>

            {pullRequests.map(({ id, createdAt, ...prProps }, idx) => (
                <Fragment key={id}>
                    <PullRequest date={createdAt} theme={theme} {...prProps} />
                    {isLast(pullRequests, idx) && <HorizontalDivider style={{ margin: "10px 0" }}/>}
                </Fragment>
            ))}

            <HorizontalDivider style={{ margin: "0 -8px 10px" }}/>
        </>
    );
};

export { PullRequests };
