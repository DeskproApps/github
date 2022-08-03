import { FC } from "react";
import styled from "styled-components";
import ReactTimeAgo from "react-time-ago";
import { faUser, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Avatar } from "@deskpro/deskpro-ui";
import { P1, P11, Stack, Button } from "@deskpro/app-sdk";
import { Title } from "../common";
import { mdToHtml } from "../../utils";
import { CommentProps } from "./types";

const TimeAgo = styled(ReactTimeAgo)`
    color: ${({ theme }) => theme.colors.grey80};
`;

const Author = styled(Stack)`
    width: 35px;
`;

const Comment = styled(P1)`
    width: calc(100% - 35px);
  
    p {
        white-space: pre-wrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
  
    img {
        width: 100%;
        height: auto;
    }
`;

const Comments: FC<CommentProps> = ({
    comments,
    onClickTitleAction,
}) => {
    const count = (Array.isArray(comments) && comments.length > 0) ? comments.length : 0;
    return (
        <>
            <Title>
                Comments ({count})
                &nbsp;
                <Button
                    icon={faPlus}
                    minimal
                    noMinimalUnderline
                    onClick={onClickTitleAction}
                />
            </Title>

            {!!comments?.length && comments.map(({ id, body, updated_at, user }) => (
                <Stack key={id} wrap="nowrap" gap={6} style={{ marginBottom: 10 }}>
                    <Author vertical>
                        <Avatar
                            size={18}
                            name={user.login}
                            backupIcon={faUser}
                            imageUrl={user.avatar_url}
                        />
                        <P11>
                            <TimeAgo date={new Date(updated_at)} timeStyle="mini" />
                        </P11>
                    </Author>
                    <Comment dangerouslySetInnerHTML={{ __html: mdToHtml(body) }} />
                </Stack>
            ))}
        </>
    )
};

export { Comments };
