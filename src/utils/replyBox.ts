import { IDeskproClient } from "@deskpro/app-sdk";
import { State } from "../context/StoreProvider/types";
import { getIssueCommentUrl } from "../services/github";

export const registerReplyBoxNotesAdditionsTargetAction = (client: IDeskproClient, state: State) => {
    const ticketId = state?.context?.data.ticket.id;
    const linkedIssues = (state?.issues ?? []);

    if (!ticketId) {
        return;
    }

    Promise
        .all(linkedIssues.map((issue) => client.getState<{ selected: boolean }>(ticketReplyNotesSelectionStateKey(ticketId, issue.id.toLowerCase()))))
        .then((flags) => {
            client.registerTargetAction("githubReplyBoxNoteAdditions", "reply_box_note_item_selection", {
                title: "Add to GitHub",
                payload: (state?.issues ?? []).map((issue, idx) => ({
                    id: issue.id.toLowerCase(),
                    title: issue.number,
                    commentUrl: getIssueCommentUrl(issue.repository.nameWithOwner, issue.number),
                    selected: flags[idx][0]?.data?.selected ?? false,
                })),
            });
        })
    ;
};

export const registerReplyBoxEmailsAdditionsTargetAction = (client: IDeskproClient, state: State) => {
    const ticketId = state?.context?.data.ticket.id;
    const linkedIssues = (state?.issues ?? []);

    if (!ticketId) {
        return;
    }

    Promise
        .all(linkedIssues.map(
            (issue) => client.getState<{ selected: boolean }>(ticketReplyEmailsSelectionStateKey(ticketId, issue.id.toLowerCase())))
        )
        .then((flags) => client.registerTargetAction("githubReplyBoxEmailAdditions", "reply_box_email_item_selection", {
            title: "Add to GitHub",
            payload: (state?.issues ?? []).map((issue, idx) => ({
                id: issue.id.toLowerCase(),
                title: issue.number,
                commentUrl: getIssueCommentUrl(issue.repository.nameWithOwner, issue.number),
                selected: flags[idx][0]?.data?.selected ?? false,
            })),
        }));
};

export const ticketReplyNotesSelectionStateKey = (ticketId: string, issueId: string|number) => {
    return `tickets/${ticketId}/github/notes/selection/${issueId}`;
};

export const ticketReplyEmailsSelectionStateKey = (ticketId: string, issueId: string|number) => {
    return `tickets/${ticketId}/github/emails/selection/${issueId}`;
};
