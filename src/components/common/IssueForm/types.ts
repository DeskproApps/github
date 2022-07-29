import { ReactElement } from "react";
import { User, Repository, Issue } from "../../../services/github/types";

export type Option<Value> = {
    value: Value,
    key: Value,
    label: string | ReactElement,
    type: "value" | "header",
    disabled?: boolean,
    selected?: boolean,
};

export type Values = {
    title: string,
    description: Issue["body"],
    repository: Option<string>,
    milestone: Option<number>,
    projects: Option<string>,
    assignees: Array<User["login"]>,
    labels: string[],
};

export type Props = {
    repositories: Repository[],
    currentUser: User,
    onSubmit: (values: Values) => void,
    onCancel: () => void,
};

export type OptionRepository = {
    key: Repository["id"],
    value: Repository["full_name"],
    label: Repository["name"],
    type: "value",
};
