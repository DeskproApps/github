import { IDeskproClient } from "@deskpro/app-sdk";
import { baseGraphQLRequest } from "./baseGraphQLRequest";

const getIssuesByIdsGraphQLService = (
    client: IDeskproClient,
    ids: string[],
) => {
    const variables = { ids };
    const query = `
      query issuesByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ...on Issue {
            id,
            databaseId,
            createdAt,
            title,
            url,
            state,
            number,
            resourcePath,
            createdAt,
            milestone {
              title
            },
            repository {
              ... on Repository {
                name,
                nameWithOwner,
                id,
                databaseId,
                url,
                projects(first: 10) {
                  edges {
                    node { url, name, resourcePath }
                  }
                }
              }
            },
            assignees(first: 20){
              edges {
                node {
                  login, name, avatarUrl
                }
              }
            },
            author {
              ... on User {
                login, name
              }
            },
            labels(first: 10) {
              edges {
                node {
                  id, name, color
                }
              }
            }
          }
        }
      }
    `;

    return baseGraphQLRequest(client, { query, variables })
        .then(({ nodes }) => nodes.map((issue) => ({
            ...issue,
            html_url: issue.url,
            created_at: issue.createdAt,
            assignees: issue.assignees.edges?.map(({ node }) => node) ?? [],
            labels: issue.labels.edges?.map(({ node }) => node) ?? [],
        })));
};

export { getIssuesByIdsGraphQLService };
