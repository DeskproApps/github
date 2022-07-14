import { IDeskproClient } from "@deskpro/app-sdk";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestParams = {
    url?: string,
    rawUrl?: string,
    method?: ApiRequestMethod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    headers?: Record<string, string>,
    queryParams?: Record<string, string|number|boolean>,
};

export type Request = <T>(
    client: IDeskproClient,
    params: RequestParams
) => Promise<T>;

/**
 * An ISO-8601 encoded UTC date time string. Example value: `""2019-09-07T15:50:00Z"`.
 */
export type DateTime = string;

export type User = {
    avatar_url: null | string,
    bio: null | string,
    blog: string,
    company: null | string,
    created_at: DateTime,
    email: string,
    events_url: null | string,
    followers: number,
    followers_url: string,
    following: number,
    following_url: string,
    gists_url: string,
    gravatar_id: string,
    hireable: null | string,
    html_url: string,
    id: number,
    location: null | string,
    login: string,
    name: string,
    node_id: string,
    organizations_url: string,
    public_gists: number,
    public_repos: number,
    received_events_url: string,
    repos_url: string,
    site_admin: boolean,
    starred_url: string,
    subscriptions_url: string,
    twitter_username: null | string,
    type: "User",
    updated_at: DateTime,
    url: string,
};

export type Milestone = {
    closed_at: null | DateTime,
    closed_issues: number,
    created_at: DateTime,
    creator: User,
    description: string,
    due_on: null | DateTime,
    html_url: string,
    id: number,
    labels_url: string,
    node_id: string,
    number: number,
    open_issues: number,
    state: string, // ToDo: need enum
    title: string,
    updated_at: DateTime,
    url: string,
};

export type Reactions = {
    "+1": number,
    "-1": number,
    confused: number,
    eyes: number,
    heart: number,
    hooray: number,
    laugh: number,
    rocket: number,
    total_count: number,
    url: string,
};

// ToDo: need full typings
export type Repository = {
    name: string,
    url: string,
};

export type Issue = {
    assignee: null,
    assignees: [],
    author_association: string, // ToDo: need enum
    body: null,
    closed_at: DateTime | null,
    comments: number,
    comments_url: string,
    created_at: DateTime,
    events_url: string,
    html_url: string,
    id: number,
    labels: [],
    labels_url: string,
    locked: boolean,
    milestone: null | Milestone,
    node_id: string,
    number: number,
    performed_via_github_app: null,
    reactions: Reactions,
    repository_url: Repository["url"],
    repository_name?: Repository["name"],
    score: number,
    state: string, /* ToDo: need enum */
    state_reason: null,
    timeline_url: string,
    title: string,
    updated_at: DateTime,
    url: string,
    user: User,
};
