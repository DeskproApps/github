import { IDeskproClient } from "@deskpro/app-sdk"
import { baseGraphQLRequest } from "./baseGraphQLRequest";
import { User } from "./types";

const searchByIssueGraphQLService = (
    client: IDeskproClient,
    q: string,
    login: User["login"],
) => {
    const variables = {
        q: `${q} involves:${login} is:issue in:title`
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .then(({ search }) => search.edges.map(({ node }) => ({
            ...node,
            html_url: node.url,
            created_at: node.createdAt,
            assignees: node.assignees.edges?.map(({ node }) => node) ?? [],
            labels: node.labels.edges?.map(({ node }) => node) ?? [],
        })));
};

export { searchByIssueGraphQLService };
