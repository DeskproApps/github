import { Repository } from "./services/github/types";

export type OptionRepository = {
    key: Repository["id"],
    value: Repository["full_name"],
    label: Repository["name"],
    type: "value",
};

export type Settings = {
    dont_add_comment_when_linking_issue: boolean,
    dont_add_deskpro_label: boolean,
    client_id: string,
    use_deskpro_saas: boolean,
};