import { FC } from "react";
import styled from "styled-components";
import ReactTimeAgo from "react-time-ago";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Avatar } from "@deskpro/deskpro-ui";
import { P1, P11, Stack } from "@deskpro/app-sdk";
import { Title } from "../common";
import { mdToHtml } from "../../utils";
import { Props } from "./types";

const TimeAgo = styled(ReactTimeAgo)`
    color: ${({ theme }) => theme.colors.grey80};
`;

const Comments: FC<Pick<Props, "comments">> = ({ comments }) => {
    const count = (Array.isArray(comments) && comments.length > 0) ? comments.length : 0;
    return (
        <>
            <Title>Comments ({count})</Title>

            {!!comments?.length && comments.map(({ id, body, updated_at, user }) => (
                <Stack key={id} wrap="nowrap" gap={6} style={{ marginBottom: 10 }}>
                    <Stack vertical style={{ minWidth: 32 }}>
                        <Avatar
                            size={18}
                            name={user.login}
                            backupIcon={faUser}
                            imageUrl={user.avatar_url}
                        />
                        <P11>
                            <TimeAgo date={new Date(updated_at)} timeStyle="mini" />
                        </P11>
                    </Stack>
                    <P1 dangerouslySetInnerHTML={{ __html: mdToHtml(body) }} />
                </Stack>
            ))}
        </>
    )
};

export { Comments };
