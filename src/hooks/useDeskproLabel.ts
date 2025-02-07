import { useCallback, useMemo } from "react";
import has from "lodash/has";
import replace from "lodash/replace";
import toLower from "lodash/toLower";
import {
    useDeskproAppTheme,
    useDeskproAppClient,
    useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import {
    baseRequest,
    getLabelsService,
    createLabelService,
} from "../services/github";
import { Issue, IssueGQL, Labels, Label } from "../services/github/types";
import { Settings } from "../types";

type UseDeskproLabel = () => {
    addDeskproLabel: (issue: Issue|IssueGQL) => Promise<Issue|void>,
    removeDeskproLabel: (issue: Issue|IssueGQL) => Promise<Issue|void>,
};

const isRestIssue = (issue: Issue|IssueGQL): issue is Issue => {
    return !!has(issue, ["repository_url"]);
};

const useDeskproLabel: UseDeskproLabel = () => {
    const { client } = useDeskproAppClient();
    const { theme } = useDeskproAppTheme();
    const { context } = useDeskproLatestAppContext<unknown, Settings>();
    const dontAddDeskproLabel = context?.settings.dont_add_deskpro_label === true;

    const deskproLabel = useMemo(() => ({
        name: "Deskpro",
        color: replace(theme.colors.cyan100, "#", ""),
    }), [theme.colors.cyan100]);

    const addDeskproLabel = useCallback((issue: Issue|IssueGQL) => {
        if (dontAddDeskproLabel || !client) {
            return Promise.resolve();
        }

        return (isRestIssue(issue)
            ? baseRequest<Labels>(client, { rawUrl: `${issue.repository_url}/labels` })
            : getLabelsService(client, { repoFullName: issue.repository.nameWithOwner })
        )
            .then<Label|void>((labels) => {
                if (Array.isArray(labels) && labels.some(({ name }) => toLower(name) === toLower(deskproLabel.name))) {
                    return Promise.resolve();
                } else {
                    return createLabelService(client, {
                        ...(isRestIssue(issue)
                            ? { rawUrl: issue.repository_url }
                            : { repoFullName: issue.repository.nameWithOwner }
                        ),
                        data: deskproLabel,
                    })
                }
            })
            .then(() => {
                return baseRequest<Issue>(client, {
                    ...(isRestIssue(issue)
                        ? { rawUrl: issue.url }
                        : { url: `/repos${issue.resourcePath}` }
                    ),
                    method: "PATCH",
                    data: {
                        labels: [
                            ...issue.labels.map(({ name }) => name),
                            deskproLabel.name,
                        ],
                    },
                });
            })
            .catch(() => {});
    }, [client, deskproLabel, dontAddDeskproLabel]);

    const removeDeskproLabel = useCallback((issue: Issue|IssueGQL) => {
        if (dontAddDeskproLabel || !client) {
            return Promise.resolve();
        }

        return baseRequest<Issue>(client, {
            ...(isRestIssue(issue)
                    ? { rawUrl: issue.url }
                    : { url: `/repos${issue.resourcePath}` }
            ),
            method: "PATCH",
            data: {
                labels: [
                    ...issue.labels
                        .map(({ name }) => name)
                        .filter((name) => toLower(name) !== toLower(deskproLabel.name)),
                ],
            },
        });
        // return getIssueService(client, )
    }, [client, deskproLabel, dontAddDeskproLabel]);

    return { addDeskproLabel, removeDeskproLabel };
};

export { useDeskproLabel };
