import { Repository, RepositoryGQL } from "../../../services/github/types";

export type OptionRepository = {
    key: RepositoryGQL["id"],
    value: RepositoryGQL["nameWithOwner"],
    label: Repository["name"],
    type: "value",
};

export type Props = {
    value: OptionRepository|null,
    options: OptionRepository[],
    onChange: (option: OptionRepository) => void,
};
