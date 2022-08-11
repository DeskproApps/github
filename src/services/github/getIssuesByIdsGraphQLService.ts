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
            milestone { title, url },
            repository {
              ... on Repository {
                name,
                nameWithOwner,
                id,
                databaseId,
                url,
                projectsUrl,
                projects(first: 10) {
                  edges {
                    node { url, name }
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .then(({ nodes }) => nodes.map((issue) => ({
            ...issue,
            html_url: issue.url,
            created_at: issue.createdAt,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            assignees: issue.assignees.edges?.map(({ node }) => node) ?? [],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            labels: issue.labels.edges?.map(({ node }) => node) ?? [],
            repository: {
                ...issue.repository,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                projects: issue.repository.projects.edges?.map(({ node }) => node) ?? [],
            },
        })));
};

export { getIssuesByIdsGraphQLService };
