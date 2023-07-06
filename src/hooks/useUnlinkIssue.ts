import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import get from "lodash/get";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { deleteEntityIssueService } from "../services/entityAssociation";
import { Issue } from "../services/github/types";
import {
    useDeskproLabel,
    useAutomatedComment,
} from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import {
    ticketReplyNotesSelectionStateKey,
    ticketReplyEmailsSelectionStateKey,
} from "../utils/replyBox";
import {getIssueService} from "../services/github";

type Args = {
    issueUrl: Issue["url"],
};

type UseUnlinkIssue = () => {
    isLoading: boolean,
    unlinkIssue: (args: Args) => void,
};

const useUnlinkIssue: UseUnlinkIssue = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const { createAutomatedUnlinkedComment } = useAutomatedComment();
    const { removeDeskproLabel } = useDeskproLabel();
    const [state, dispatch] = useStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const ticketId = get(state, ["context", "data", "ticket", "id"], "");

    const unlinkIssue = useCallback(({ issueUrl }: Args) => {
        if (!client || !ticketId || !issueUrl) {
            return;
        }

        setIsLoading(true);
        getIssueService(client, { url: issueUrl })
            .then((issue) => {
                return deleteEntityIssueService(client, ticketId, issue.id)
                    .then(() => Promise.all([
                        client.deleteState(ticketReplyEmailsSelectionStateKey(ticketId, issue.id)),
                        client.deleteState(ticketReplyNotesSelectionStateKey(ticketId, issue.id)),
                        createAutomatedUnlinkedComment(issue.comments_url),
                        removeDeskproLabel(issue),
                    ]))
                    .then(() => dispatch({ type: "unlinkIssue", issueId: issue.id }))
                    .then(() => {
                        setIsLoading(false);
                        navigate("/home");
                    });
            })
    }, [client, ticketId, dispatch, navigate, createAutomatedUnlinkedComment, removeDeskproLabel]);

    return { isLoading, unlinkIssue };
};

export { useUnlinkIssue };
