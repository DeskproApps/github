import { FC, useState, useCallback, useMemo } from "react";
import get from "lodash/get";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import * as yup from "yup";
import { useFormik } from "formik";
import {
    IDeskproClient,
    Stack,
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    baseRequest,
    uploadFileService,
} from "../services/github";
import { useSetAppTitle } from "../hooks";
import { fileToBase64, isImage } from "../utils";
import {
    Label,
    Button,
    Attach,
    TextArea,
    ErrorBlock,
} from "../components/common";

const validationSchema = yup.object().shape({
    comment: yup.string(),
});

const initValues = {
    comment: "",
    files: [],
};

const AddCommentPage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [error, setError] = useState<string|null>(null);

    const issueUrl = state.pageParams?.issueUrl;
    const commentUrl = state.pageParams?.commentUrl;
    const repoFullName = state.pageParams?.repoFullName;

    const uploadFiles = (client: IDeskproClient, {
        repoFullName,
        file,
        fileName,
    }: { repoFullName: string, file: File, fileName: string }) => {
        return fileToBase64(file)
            .then((base64File) => uploadFileService(client, {
                fileName,
                repoFullName,
                file: base64File,
            }))
    };

    const {
        values,
        handleSubmit,
        isSubmitting,
        getFieldProps,
        setFieldValue,
    } = useFormik({
        validationSchema,
        initialValues: initValues,
        onSubmit: async (values) => {
            if (!client || !commentUrl || !repoFullName) {
                return;
            }

            setError(null);

            return ((isArray(values.files) && !isEmpty(values.files))
                ? Promise.all(values.files.map(({ file, name }) => uploadFiles(client, {
                        file,
                        repoFullName,
                        fileName: name,
                    })))
                : Promise.resolve([])
            )
                .then((uploadedFiles) => {
                    const files: string[] = [];

                    if (isArray(uploadedFiles) && !isEmpty(uploadedFiles)) {
                        uploadedFiles.forEach(({ content, commit }) => {
                            if (isImage(content.name)) {
                                files.push(`![${commit.message}](${content.html_url}?raw=true)`)
                            } else {
                                files.push(`[${commit.message}](${content.html_url}?raw=true)`)
                            }
                        })
                    }

                    const body = [
                        ...(values.comment ? [values.comment] : []),
                        ...files,
                    ];
                    return baseRequest(client, {
                        rawUrl: commentUrl,
                        method: "POST",
                        data: {
                            body: body.join("\n"),
                        },
                    })
                })
                .then(() => {
                    dispatch({
                        type: "changePage",
                        page: "view_issue",
                        params: { issueUrl },
                    });
                })
                .catch((error) => {
                    setError(get(error, ["message"], "An error occurred"));
                });
        },
    });

    const isDisabled: boolean = useMemo(() => {
        const isEmptyComment = isEmpty(values.comment);
        const isEmptyFiles = (!isArray(values.files) || isEmpty(values.files));

        return isSubmitting || (isEmptyComment && isEmptyFiles);
    }, [isSubmitting, values.comment, values.files]);

    useSetAppTitle("Add Comment");

    useInitialisedDeskproAppClient((client) => {
        client.deregisterElement("githubHomeButton");
        client.deregisterElement("githubEditButton");
        client.deregisterElement("githubPlusButton");
        client.deregisterElement("githubMenu");

        client.registerElement("githubHomeButton", {
            type: "home_button",
            payload: { type: "changePage", page: "home" }
        });
    });

    const onCancel = useCallback(() => dispatch({
        type: "changePage",
        page: "view_issue",
        params: { issueUrl },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [issueUrl]);

    if (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }

    return (
        <>
            {error && <ErrorBlock text={`Upload file error: ${error}`} />}
            <form onSubmit={handleSubmit}>
                <Label htmlFor="comment" label="New comment">
                    <TextArea
                        minHeight="auto"
                        placeholder="Enter comment"
                        {...getFieldProps("comment")}
                    />
                </Label>

                <Label label="Attachments">
                    <Attach
                        onFiles={(files) => { setFieldValue("files", files); }}
                    />
                </Label>

                <Stack justify="space-between">
                    <Button
                        type="submit"
                        text="Add"
                        disabled={isDisabled}
                        loading={isSubmitting}
                    />
                    <Button
                        type="button"
                        text="Cancel"
                        intent="tertiary"
                        onClick={onCancel}
                    />
                </Stack>
            </form>
        </>
    );
};

export { AddCommentPage };
