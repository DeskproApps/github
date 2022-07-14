import { FC } from "react";
import {
    H3,
    Stack,
    useDeskproAppTheme,
} from "@deskpro/app-sdk";
import { Issue } from "../../../services/github/types";
import { getDate } from "../../../utils/date";
import { GithubLink, TwoSider } from "../../common";

const Title: FC<Issue & { onClick?: () => void }> = ({ title, html_url, onClick }) => {
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

const StatusAndDate: FC<Issue> = (props) => {
    return (
        <TwoSider
            leftLabel="Status"
            leftText={props.state}
            rightLabel="Date Created"
            rightText={getDate(props.created_at)}
        />
    );
};

const IssueInfo: FC<Issue> = (props) => {
    return (
        <>
            <Title {...props} />
            <StatusAndDate {...props} />
        </>
    );
};

export { IssueInfo };
