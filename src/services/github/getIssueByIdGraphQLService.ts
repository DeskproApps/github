import { IDeskproClient } from "@deskpro/app-sdk";
import { baseGraphQLRequest } from "./baseGraphQLRequest";
import { getProjectsV2, getProjectsClassic } from "./utils";
import { IssueGQL } from "./types";

const getIssueByIdGraphQLService = (
    client: IDeskproClient,
    id: IssueGQL["id"],
) => {
    const variables = { id };
    const query = `
      query issueById($id: ID!) {
        node(id: $id) {
          ... on Issue {
            id
            databaseId
            createdAt
            title
            url
            state
            number
            resourcePath
            milestone {
              title
              url
            }
            projectsV2(first: 100) {
              edges {
                node {
                  id
                  title
                  url
                }
              }
            }
            projectCards(first: 100) {
              edges {
                node {
                  id
                  project {
                    id
                    name
                    url
                  }
                }
              }
            }
            repository {
              ... on Repository {
                name
                nameWithOwner
                id
                databaseId
                url
                projectsUrl
                projects(first: 10) {
                  edges {
                    node {
                      url
                      name
                    }
                  }
                }
              }
            }
            assignees(first: 20) {
              edges {
                node {
                  login
                  name
                  avatarUrl
                }
              }
            }
            author {
              ... on User {
                login
                name
              }
            }
            labels(first: 10) {
              edges {
                node {
                  id
                  name
                  color
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
        .then(({ node: issue }) => {
            return ({
                ...issue,
                html_url: issue.url,
                created_at: issue.createdAt,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                assignees: issue.assignees.edges?.map(({ node }) => node) ?? [],
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                labels: issue.labels.edges?.map(({ node }) => node) ?? [],
                projects: [
                    ...getProjectsClassic(issue?.projectCards),
                    ...getProjectsV2(issue?.projectsV2)
                ],
            })
        });
};

export { getIssueByIdGraphQLService };
