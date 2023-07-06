import { IDeskproClient } from "@deskpro/app-sdk"
import { baseGraphQLRequest } from "./baseGraphQLRequest";
import { RepositoryGQL, User } from "./types";

const getUserReposGraphQLService = (
    client: IDeskproClient,
    login: User["login"],
): Promise<RepositoryGQL[]> => {
    const variables = {
        user: login,
    };
    const query = `
        query listRepos($user: String!) {
            repositoryOwner(login: $user) {
                repositories(first: 100) {
                    totalCount,
                    edges {
                        node {
                            id,
                            url,
                            name,
                            databaseId,
                            nameWithOwner,
                        }
                    }
                }
            }
        }
    `;

    return baseGraphQLRequest(client, { query, variables })
        .then(({ repositoryOwner: { repositories }}) => {
            if (repositories.totalCount > 0) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return repositories.edges.map(({ node }) => node);
            } else {
                return [];
            }
        })
};

export { getUserReposGraphQLService };
