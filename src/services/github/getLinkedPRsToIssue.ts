import get from "lodash/get";
import has from "lodash/has";
import { IDeskproClient } from "@deskpro/app-sdk";
import { baseGraphQLRequest } from "./baseGraphQLRequest";
import { sortDate } from "../../utils/date";
import { Repository, Issue, PullRequest, DateTime } from "./types";

type Timeline = {
    id: string,
    __typename: "ConnectedEvent" | "DisconnectedEvent",
    createdAt: DateTime,
    subject: PullRequest,
};

type Response = {
    repository: {
        issue: {
            id: Issue["node_id"],
            number: Issue["number"],
            title: Issue["title"],
            timelineItems: {
                nodes: Timeline[],
            },
        },
    },
};

const sortByUpdateDateFn = (a: Timeline, b: Timeline) => sortDate(a.createdAt, b.createdAt);

const getMapTimelineByPRIds = (
    acc: Record<PullRequest["id"], Timeline[]>,
    timeline: Timeline,
): Record<PullRequest["id"], Timeline[]> => {
    if (!has(acc, [timeline.subject.id])) {
        acc[timeline.subject.id] = [];
    }

    acc[timeline.subject.id].push(timeline);

    return acc;
};

const skipUnlinkPRs = (PRs: Response["repository"]["issue"]["timelineItems"]["nodes"]): PullRequest[] => {
    const mapTimelineByPRIds = PRs.reduce<Record<PullRequest["id"], Timeline[]>>(getMapTimelineByPRIds, {});

    const prIds: Array<PullRequest["id"]> = Object.keys(mapTimelineByPRIds);

    prIds.forEach((prId) => {
        mapTimelineByPRIds[prId] = mapTimelineByPRIds[prId].sort(sortByUpdateDateFn)
    });

    return prIds.reduce<PullRequest[]>((acc, prId) => {
        if (mapTimelineByPRIds[prId][0].__typename !== "DisconnectedEvent") {
            return [...acc, mapTimelineByPRIds[prId][0].subject];
        }
        return acc;
    }, []);
};

const getLinkedPRsToIssue = (
    client: IDeskproClient,
    owner: Repository["owner"]["login"],
    name: Repository["name"],
    issueNumber: Issue["number"],
) => {
    const variables = { owner, name, issueNumber };
    const query = `
        query getLinkedPRsToIssue($owner: String!, $name: String!, $issueNumber: Int!) {
            repository(owner: $owner, name: $name){
                issue(number: $issueNumber){
                    id,
                    number,
                    title,
                    timelineItems(itemTypes: [CONNECTED_EVENT, DISCONNECTED_EVENT], first: 100) {
                        nodes {
                            ... on ConnectedEvent {
                                id, __typename, createdAt, subject {
                                    ... on PullRequest { id, number, title, state, url, createdAt, updatedAt }
                                }
                            }
                            ... on DisconnectedEvent {
                                id, __typename, createdAt, subject {
                                    ... on PullRequest { id, number, title, state, url, createdAt, updatedAt }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    return baseGraphQLRequest(client, { query, variables })
        .then(({ repository }: Response) => get(repository, ["issue", "timelineItems", "nodes"], []))
        .then(skipUnlinkPRs);
};

export { getLinkedPRsToIssue };
