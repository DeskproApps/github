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
                  createdAt
                  title
                  url,
                  state,
                  number,
                  createdAt,
                  milestone {
                    title
                  },
                  repository {
                    ... on Repository {
                      name,
                      projects(first: 10) {
                        edges {
                          node {
                            name
                          }
                        }
                      }
                    }
                  },
                  assignees(first: 10){
                    edges {
                      node {
                        login
                      }
                    }
                  },
                  author { login },
                  labels(first: 10) {
                    edges {
                      node {
                        name, color
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
            id: node.id,
            title: node.title,
            html_url: node.url,
            state: node.state,
            created_at: node.createdAt,
            repository: node.repository,
        })));
};

export { searchByIssueGraphQLService };
