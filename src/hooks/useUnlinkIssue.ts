import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import get from "lodash/get";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { deleteEntityIssueService } from "../services/entityAssociation";
import { Issue } from "../services/github/types";
import { useAutomatedComment } from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import {
    ticketReplyNotesSelectionStateKey,
    ticketReplyEmailsSelectionStateKey,
} from "../utils/replyBox";

type Args = {
    issueId: Issue["id"],
    commentsUrl: Issue["comments_url"],
};

type UseUnlinkIssue = () => {
    isLoading: boolean,
    unlinkIssue: (args: Args) => void,
};

const useUnlinkIssue: UseUnlinkIssue = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const { createAutomatedUnlinkedComment } = useAutomatedComment();
    const [state, dispatch] = useStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const ticketId = get(state, ["context", "data", "ticket", "id"], "");

    const unlinkIssue = useCallback(({ issueId, commentsUrl }: Args) => {
        if (!client || !ticketId || !issueId || !commentsUrl) {
            return;
        }

        setIsLoading(true);
        deleteEntityIssueService(client, ticketId, issueId)
            .then(() => createAutomatedUnlinkedComment(commentsUrl))
            .then(() => {
                return Promise.all([
                    client.deleteState(ticketReplyEmailsSelectionStateKey(ticketId, issueId)),
                    client.deleteState(ticketReplyNotesSelectionStateKey(ticketId, issueId)),
                ])
            })
            .then(() => dispatch({ type: "unlinkIssue", issueId }))
            .then(() => {
                setIsLoading(false);
                navigate("/home");
            });
    }, [client, ticketId, dispatch, navigate, createAutomatedUnlinkedComment]);

    return { isLoading, unlinkIssue };
};

export { useUnlinkIssue };
