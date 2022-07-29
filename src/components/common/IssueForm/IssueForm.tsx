import { FC, useState, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import {
    // faPlus,
    // faTimes,
    faUser,
    faCheck,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useFormik } from "formik";
import * as yup from 'yup';
import {
    // Tag,
    TSpan,
    Avatar,
    InputWithDisplay,
} from "@deskpro/deskpro-ui";
import {
    P5,
    // Pill,
    Stack,
    Dropdown,
    DropdownItemType,
    // Label as LabelUI,
    // Button as ButtonUI,
    useDeskproAppTheme,
    DropdownTargetProps,
    useDeskproAppClient,
    DivAsInputWithDisplay,
} from "@deskpro/app-sdk";
import {
    // getLabelsService,
    getProjectsService,
    getMilestonesService,
    getRepoContributorsService,
} from "../../../services/github";
// import { getIssueStatueColorScheme } from "../../../utils";
import { Label } from "../Label";
import { Button } from "../Button";
import { TextArea } from "../TextArea";
import { SingleSelect } from "../SingleSelect";
// import { EmptyInlineBlock } from "../EmptyInlineBlock";
import { TextBlockWithLabel } from "../TextBlockWithLabel";
import { Milestone, User, Projects/*, Labels*/ } from "../../../services/github/types";
import { Props, Values, Option, OptionRepository } from "./types";

const validationSchema = yup.object().shape({
    title: yup.string().required(),
    description: yup.string(),
    repository: yup.object({
        key: yup.string().required(),
        label: yup.string().required(),
        value: yup.string().required(),
        type: yup.string().oneOf(["value"]).required(),
    }),
    milestone: yup.object({
        key: yup.string(),
        label: yup.string(),
        value: yup.string(),
        type: yup.string().oneOf(["value"]),
    }),
    assignees: yup.array(yup.string()),
    projects: yup.object({
        key: yup.string(),
        label: yup.string(),
        value: yup.string(),
        type: yup.string().oneOf(["value"]),
    }),
    labels: yup.array(yup.string()),
});

const getOption = <Value, >(
    value: Value,
    label: string,
): Option<Value> => ({
    label,
    value,
    key: value,
    type: "value",
});

const getDisabledOption = (value = "Not Found"): DropdownItemType => {
    return {
        type: "header",
        label: value,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        disabled: true,
    }
};

const getInitValues = (): Values => ({
    title: "",
    description: "",
    repository: getOption("", ""),
    milestone: getOption(0, ""),
    projects: getOption("", ""),
    assignees: [],
    labels: [],
});

const IssueForm: FC<Props> = ({ onSubmit, onCancel, repositories, currentUser }) => {
    const { client } = useDeskproAppClient();
    const { theme } = useDeskproAppTheme();

    const [repoOptions, setRepoOptions] = useState<Array<OptionRepository>>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Projects>([]);
    // const [labels, setLabels] = useState<Labels>([]);

    const {
        values,
        errors,
        touched,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        getFieldProps,
    } = useFormik<Values>({
        initialValues: getInitValues(),
        validationSchema,
        onSubmit: async (values: Values) => {
            await onSubmit(values);
        },
    });

    useEffect(() => {
        if (!isEmpty(repositories)) {
            setRepoOptions(repositories.map((repo) => ({
                key: repo.id,
                value: repo.full_name,
                label: repo.name,
                type: "value",
            })));
        }
    }, [repositories]);

    useEffect(() => {
        if (!isEmpty(repoOptions) && !isEmpty(repoOptions[0])) {
            setFieldValue("repository", repoOptions[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repoOptions]);

    // load Milestones
    useEffect(() => {
        if (!client || !values.repository.value) {
            return;
        }

        setMilestones([]);
        setMembers([]);
        setProjects([]);
        // setLabels([]);
        setFieldValue("milestone", getOption("", ""));
        setFieldValue("assignees", []);
        setFieldValue("projects", getOption("", ""));
        setFieldValue("labels", []);

        Promise.all([
            getMilestonesService(client, { repoFullName: values.repository.value }),
            getRepoContributorsService(client, { repoFullName: values.repository.value }),
            getProjectsService(client, { repoFullName: values.repository.value }),
            // getLabelsService(client, { repoFullName: values.repository.value })
        ]).then(([milestones, members, projects/*, labels*/]) => {
            setMilestones(milestones);
            setProjects(projects);
            setMembers([
                currentUser,
                ...((Array.isArray(members) && members.length > 0)
                    ? members.filter(({ login }) => login !== currentUser.login)
                    : []
                ),
            ]);
            // setLabels(labels);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, values.repository.value]);

    return (
        <form onSubmit={handleSubmit}>
            <Label htmlFor="title" label="Title" required>
                <InputWithDisplay
                    type="text"
                    id="title"
                    {...getFieldProps("title")}
                    error={!!(touched.title && errors.title)}
                    placeholder="Enter title"
                    inputsize="small"
                />
            </Label>

            <Label htmlFor="description" label="Description">
                <TextArea
                    minHeight="auto"
                    placeholder="Enter description"
                    {...getFieldProps("description")}
                />
            </Label>

            <Label htmlFor="repository" label="Repository">
                <SingleSelect
                    showInternalSearch
                    id="repository"
                    value={values.repository}
                    options={repoOptions}
                    error={!!(touched.repository && errors.repository)}
                    onChange={(value: OptionRepository) => setFieldValue("repository", value)}
                />
            </Label>

            <Label htmlFor="milestone" label="Milestone">
                <SingleSelect
                    id="milestone"
                    value={values.milestone}
                    options={(Array.isArray(milestones) && milestones.length > 0)
                        ? milestones?.map(({ title, number }) => ({
                            key: number,
                            value: number,
                            label: title,
                            type: "value",
                        }))
                        : [getDisabledOption()]
                    }
                    error={!!(touched.milestone && errors.milestone)}
                    onChange={(value: OptionRepository) => setFieldValue("milestone", value)}
                />
            </Label>

            <Dropdown
                fetchMoreText="Fetch more"
                autoscrollText="Autoscroll"
                selectedIcon={faCheck}
                externalLinkIcon={faExternalLinkAlt}
                placement="bottom-start"
                searchPlaceholder="Select value"
                options={(Array.isArray(members) && members.length > 0)
                    ? members?.map(({ login, avatar_url }) => ({
                        key: login,
                        value: login,
                        label: (
                            <Stack gap={6} key={login}>
                                <Avatar
                                    size={18}
                                    name={login}
                                    backupIcon={faUser}
                                    {...(avatar_url ? { imageUrl: avatar_url } : {})}
                                />
                                <P5>{login}</P5>
                            </Stack>
                        ),
                        type: "value",
                        selected: values.assignees.includes(login),
                    }))
                    : [getDisabledOption()]
                }
                onSelectOption={(option) => {
                    if (option.value) {
                        const newValue = values.assignees.includes(option.value as string)
                            ? values.assignees.filter((login) => login !== option.value)
                            : [...values.assignees, option.value]

                        setFieldValue("assignees", newValue);
                    }
                }}
                closeOnSelect={false}
            >
                {({targetProps, targetRef}: DropdownTargetProps<HTMLDivElement>) => (
                    <TextBlockWithLabel
                        label="Assignees"
                        text={(
                            <DivAsInputWithDisplay
                                ref={targetRef}
                                {...targetProps}
                                value={!values.assignees.length
                                    ? (
                                        <TSpan overflow="ellipsis" type="p1" style={{color: theme.colors.grey40}}>
                                            Select value
                                        </TSpan>
                                    )
                                    : (
                                        <Stack gap={6} wrap="wrap">
                                            {members
                                                .filter(({ login }) => values.assignees.includes(login))
                                                .map(({ login, avatar_url }) => (
                                                    <Stack gap={6} key={login}>
                                                        <Avatar
                                                            size={18}
                                                            name={login}
                                                            backupIcon={faUser}
                                                            {...(avatar_url ? { imageUrl: avatar_url } : {})}
                                                        />
                                                        <P5>{login}</P5>
                                                    </Stack>
                                                ))
                                            }
                                        </Stack>
                                    )}
                                placeholder="Select value"
                                variant="inline"
                            />
                        )}
                    />
                )}
            </Dropdown>

            <Label htmlFor="projects" label="Projects">
                <SingleSelect
                    id="projects"
                    value={values.projects}
                    options={(Array.isArray(projects) && projects.length > 0)
                        ? projects?.map(({ id, name }) => ({
                            key: id,
                            value: id,
                            label: name,
                            type: "value",
                        }))
                        : [getDisabledOption()]
                    }
                    error={!!(touched.projects && errors.projects)}
                    onChange={(value: OptionRepository) => setFieldValue("projects", value)}
                />
            </Label>

            {/*<Dropdown
                fetchMoreText="Fetch more"
                autoscrollText="Autoscroll"
                selectedIcon={faCheck}
                externalLinkIcon={faExternalLinkAlt}
                placement="bottom-start"
                searchPlaceholder="Select value"
                options={labels?.map(({ id, url, name, color }) => ({
                    key: url,
                    value: url,
                    type: "value",
                    selected: values.labels.includes(url),
                    label: (
                        <Tag
                            closeIcon={faTimes}
                            key={id}
                            color={{
                                borderColor: `#${color}`,
                                backgroundColor: `#${color}33`,
                                textColor: theme.colors.grey100,
                            }}
                            label={name}
                            withClose={false}
                        />
                    ),
                }))}
                onSelectOption={(option) => {
                    if (option.value) {
                        const newValue = values.labels.includes(option.value)
                            ? values.labels.filter((projectUrl) => projectUrl !== option.value)
                            : [...values.labels, option.value]

                        setFieldValue("labels", newValue);
                    }
                }}
                closeOnSelect={false}
            >
                {({targetProps, targetRef}: DropdownTargetProps<HTMLDivElement>) => (
                    <TextBlockWithLabel
                        label="Labels"
                        text={(
                            <DivAsInputWithDisplay
                                ref={targetRef}
                                {...targetProps}
                                value={!values.labels.length
                                    ? (
                                        <TSpan overflow="ellipsis" type="p1" style={{color: theme.colors.grey40}}>
                                            Select value
                                        </TSpan>
                                    )
                                    : (
                                        <Stack gap={6} wrap="wrap">
                                            {labels
                                                .filter(({ url }) => values.labels.includes(url))
                                                .map(({ id, color, name }) => (
                                                    <Tag
                                                        closeIcon={faTimes}
                                                        key={id}
                                                        color={{
                                                            borderColor: `#${color}`,
                                                            backgroundColor: `#${color}33`,
                                                            textColor: theme.colors.grey100,
                                                        }}
                                                        label={name}
                                                        withClose={false}
                                                    />
                                                ))
                                            }
                                        </Stack>
                                    )}
                                placeholder="Select value"
                                variant="inline"
                            />
                        )}
                    />
                )}
            </Dropdown>*/}

            <Stack justify="space-between">
                <Button
                    type="submit"
                    text="Create"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                />
                <Button
                    text="Cancel"
                    intent="tertiary"
                    onClick={onCancel}
                />
            </Stack>
        </form>
    );
};

export { IssueForm };
