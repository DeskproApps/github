import { IDeskproClient } from "@deskpro/app-sdk"
import { baseGraphQLRequest } from "./baseGraphQLRequest";
import { getProjectsV2, getProjectsClassic } from "./utils";

const searchByIssueGraphQLService = (
    client: IDeskproClient,
    q: string,
) => {
    const variables = {
        q: `${q} is:issue`
    };
    const query = `
      query SearchByIssues($q: String!) {
        search(first: 100, type: ISSUE, query: $q) {
          issueCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              ... on Issue {
                id,
                databaseId,
                createdAt,
                title,
                url,
                state,
                number,
                resourcePath,
                createdAt,
                milestone { title, url },
                projectsV2(first: 100) {
                  edges {
                    node {
                      id, title, url
                    }
                  }
                },
                projectCards(first: 100) {
                  edges {
                    node {
                      id, project {
                        id, name, url,
                      }
                    }
                  }
                },
                repository {
                  ... on Repository {
                    name,
                    nameWithOwner,
                    id,
                    databaseId,
                    url,
                    projectsUrl,
                  }
                },
                assignees(first: 10){
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
        }
      }
    `;

    return baseGraphQLRequest(client, { query, variables })
        .then(({ search }) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
            return search.edges.map(({ node }) => ({
                ...node,
                html_url: node.url,
                created_at: node.createdAt,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                assignees: node.assignees.edges?.map(({ node }) => node) ?? [],
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                labels: node.labels.edges?.map(({ node }) => node) ?? [],
                projects: [
                    ...getProjectsClassic(node?.projectCards),
                    ...getProjectsV2(node?.projectsV2)
                ],
            }))
        });
};

export { searchByIssueGraphQLService };
