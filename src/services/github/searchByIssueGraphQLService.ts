import { IDeskproClient } from "@deskpro/app-sdk"
import { baseGraphQLRequest } from "./baseGraphQLRequest";

const searchByIssueGraphQLService = (
    client: IDeskproClient,
    // query: string,
) => {
    const variables = {
        q:  "test involves:zpawn is:issue in:title"
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

    return baseGraphQLRequest(client, { query, variables });
};

export { searchByIssueGraphQLService };
