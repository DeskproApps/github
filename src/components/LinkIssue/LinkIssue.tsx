import React from "react";
import {
    Stack,
    HorizontalDivider,
} from "@deskpro/app-sdk";
import {
    Button,
    Loading,
    InputSearch,
} from "../common";
import { Issues } from "./Issues";
import { Filter } from "./Filter";
import type { FC, ChangeEvent } from "react";
import type { IssueGQL } from "../../services/github/types";
import type { OptionRepository, FilterValues } from "./types";

type Props = {
    loading: boolean,
    isSubmitting: boolean,
    issues: IssueGQL[],
    selectedIssues: Array<IssueGQL["id"]>,
    onChangeSelectedCard: (id: IssueGQL["id"]) => void,
    onCancel: () => void,
    onLinkIssues: () => void,
    selectedRepo: OptionRepository|null,
    onChangeSelectedRepo: (o: OptionRepository) => void,
    repoOptions: OptionRepository[],
    searchIssue: string,
    onClearSearch: () => void,
    onChangeSearch: (e: ChangeEvent<HTMLInputElement>) => void,
    onChangeFilter: (values: FilterValues) => void,
};

const LinkIssue: FC<Props> = ({
    issues,
    loading,
    onCancel,
    repoOptions,
    selectedRepo,
    onLinkIssues,
    isSubmitting,
    selectedIssues,
    onChangeSelectedRepo,
    onChangeSelectedCard,
    searchIssue,
    onClearSearch,
    onChangeSearch,
    onChangeFilter,
}) => {
    return (
        <div style={{ minHeight: "500px" }}>
            <InputSearch
                value={searchIssue}
                onClear={onClearSearch}
                onChange={onChangeSearch}
            />

            <Filter
                onChange={onChangeFilter}
                repoOptions={repoOptions}
                selectedRepo={selectedRepo}
                onChangeSelectedRepo={onChangeSelectedRepo}
            />

            <Stack justify="space-between" style={{ paddingBottom: "4px" }}>
                <Button
                    disabled={selectedIssues.length === 0 || !selectedRepo?.value || isSubmitting}
                    loading={isSubmitting}
                    text="Link Issue"
                    onClick={onLinkIssues}
                />
                <Button
                    text="Cancel"
                    onClick={onCancel}
                    intent="secondary"
                />
            </Stack>

            <HorizontalDivider style={{ marginBottom: 10 }}/>

            {loading
                ? (<Loading/>)
                : (
                    <Issues
                        issues={issues}
                        selectedIssues={selectedIssues}
                        onChange={onChangeSelectedCard}
                    />
                )
            }
        </div>
    );
};

export { LinkIssue };
