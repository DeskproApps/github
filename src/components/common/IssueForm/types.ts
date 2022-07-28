import { ReactElement } from "react";
import { Repository } from "../../../services/github/types";

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
    description: string,
    repository: Option<string>,
    milestone: Option<string>,
    projects: Option<string>,
    assignees: string[],
    labels: string[],
};

export type Props = {
    repositories: Repository[],
    onSubmit: (values: Values) => void,
    onCancel: () => void,
};

export type OptionRepository = {
    key: Repository["id"],
    value: Repository["full_name"],
    label: Repository["name"],
    type: "value",
};
