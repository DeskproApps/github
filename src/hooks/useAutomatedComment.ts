import { useCallback } from "react";
import get from "lodash/get";
import isString from "lodash/isString";
import {
    useDeskproAppClient,
    useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { baseRequest, createIssueCommentService } from "../services/github";
import { Issue, Comment, Repository } from "../services/github/types";

export type Params = {
    repoFullName: Repository["full_name"],
    issueNumber: Issue["number"],
};

type UseAutomatedComment = () => {
    createAutomatedLinkedComment: (
        commentsUrl: Issue["comments_url"]|Params,
    ) => Promise<Comment|void>,
    createAutomatedUnlinkedComment: (
        commentsUrl: Issue["comments_url"]|Params,
    ) => Promise<Comment|void>,
};

const useAutomatedComment: UseAutomatedComment = () => {
    const { client } = useDeskproAppClient();
    const { context } = useDeskproLatestAppContext();

    const dontAddComment = get(context, ["settings", "dont_add_comment_when_linking_issue"]) === true;
    const ticketId = get(context, ["data", "ticket", "id"], "");
    const permalinkUrl = get(context, ["data", "ticket", "permalinkUrl"], "");

    const createAutomatedLinkedComment = useCallback((param: Issue["comments_url"]|Params) => {
        if (!client || !ticketId || dontAddComment) {
            return Promise.resolve();
        }

        const comment = `Linked to Deskpro ticket ${ticketId}${permalinkUrl ? `, ${permalinkUrl}` : ""}`

        if (isString(param)) {
            return baseRequest<Comment>(client, {
                rawUrl: param,
                method: "POST",
                data: { body: comment },
            })
        } else {
            return createIssueCommentService(client, {
                comment,
                issueNumber: param.issueNumber,
                repoFullName: param.repoFullName,
            })
        }
    }, [client, ticketId, permalinkUrl, dontAddComment]);

    const createAutomatedUnlinkedComment = useCallback((param: Issue["comments_url"]|Params) => {
        if (!client || !ticketId || dontAddComment) {
            return Promise.resolve();
        }

        const comment = `Unlinked from Deskpro ticket ${ticketId}${permalinkUrl ? `, ${permalinkUrl}` : ""}`;

        if (isString(param)) {
            return baseRequest<Comment>(client, {
                rawUrl: param,
                method: "POST",
                data: {
                    body: comment
                }
            })
        } else {
            return createIssueCommentService(client, {
                comment,
                issueNumber: param.issueNumber,
                repoFullName: param.repoFullName,
            });
        }

    }, [client, ticketId, permalinkUrl, dontAddComment]);

    return {
        createAutomatedLinkedComment,
        createAutomatedUnlinkedComment,
    };
};

export { useAutomatedComment };
