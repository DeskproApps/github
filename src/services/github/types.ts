import { IDeskproClient } from "@deskpro/app-sdk";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestParams = {
    url?: string,
    rawUrl?: string,
    method?: ApiRequestMethod,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
    headers?: Record<string, string>,
    queryParams?: Record<string, string | string[]>,
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

export type Repository = {
    id: number,
    node_id: string,
    name: string,
    full_name: string,
    url: string,
    html_url: string,
    private: boolean,
    owner: User,
};

export type Label = {
    id: number,
    node_id: string,
    url: string,
    name: string,
    color: string,
    default: boolean,
    description?: string,
};

export type Labels = Label[];

export type Issue = {
    assignee: null,
    assignees?: User[],
    author_association: string, // ToDo: need enum
    body: string | null,
    closed_at: DateTime | null,
    comments: number,
    comments_url: string,
    created_at: DateTime,
    events_url: string,
    html_url: string,
    id: number,
    labels: Label[],
    labels_url: string,
    locked: boolean,
    milestone: null | Milestone,
    node_id: string,
    number: number,
    performed_via_github_app: null,
    reactions: Reactions,
    repository_url: Repository["url"],
    repository_name: Repository["name"],
    score: number,
    state: "open" | "closed",
    state_reason: null,
    timeline_url: string,
    title: string,
    updated_at: DateTime,
    url: string,
    user: User,
};

export type MilestoneGQL = {
    title: Milestone["title"],
    url: Milestone["html_url"],
}

export type RepositoryGQL = {
    name: Repository["name"],
    nameWithOwner: Repository["full_name"],
    id: string,
    databaseId: Repository["id"],
    url: Repository["html_url"],
    projectsUrl: string,
};

export type Member = {
    login: User["login"],
    name: User["name"],
    avatarUrl: User["avatar_url"],
};

export type LabelGQL = {
    id: string,
    name: Label["name"],
    color: Label["color"],
}

export type IssueGQL = {
    id: string,
    databaseId: Issue["id"],
    created_at: DateTime,
    title: Issue["title"],
    url: Issue["html_url"],
    state: Issue["state"],
    number: Issue["number"],
    resourcePath: string,
    milestone: MilestoneGQL,
    repository: RepositoryGQL,
    assignees: Member[],
    author: Member,
    labels: LabelGQL[],
    projects: ProjectGQL[],
};

export type Comment = {
    author_association: "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER",
    body: string,
    created_at: DateTime,
    html_url: string,
    id: number,
    issue_url: string,
    node_id: string,
    performed_via_github_app: null | object,
    reactions: Reactions
    updated_at: DateTime,
    url: string,
    user: User,
}

export type Comments = Comment[];

export type Project = {
    body: string,
    columns_url: string,
    created_at: DateTime,
    creator: User,
    html_url: string,
    id: number,
    name: string,
    node_id: string,
    number: number
    owner_url: string,
    state: "open" | "closed" | "all",
    updated_at: DateTime,
    url: string,
};

export type Projects = Project[];

export type ProjectColumn = {
    cards_url: string,
    created_at: DateTime,
    id: number,
    name: string,
    node_id: string,
    project_url: string,
    updated_at: DateTime,
    url: string,
};

export type ProjectGQL = {
    id: string,
    title: Project["name"],
    url: Project["html_url"],
};

export type PullRequest = {
    id: string,
    number: number,
    state: "OPEN" | "CLOSED" | "MERGED",
    title: string,
    url: string,
    createdAt: DateTime,
    updatedAt: DateTime,
};
