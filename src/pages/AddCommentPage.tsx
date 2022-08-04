import { FC, useState, useCallback } from "react";
import get from "lodash/get";
import * as yup from "yup";
import { useFormik } from "formik";
import {
    Stack,
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { baseRequest } from "../services/github";
import { useSetAppTitle } from "../hooks";
import {
    Label,
    Button,
    TextArea,
    ErrorBlock,
} from "../components/common";

const validationSchema = yup.object().shape({
    comment: yup.string(),
});

const initValues = {
    comment: "",
};

const AddCommentPage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [error, setError] = useState<string|null>(null);

    const issueUrl = state.pageParams?.issueUrl;
    const commentUrl = state.pageParams?.commentUrl;

    const {
        handleSubmit,
        isSubmitting,
        getFieldProps,
    } = useFormik({
        validationSchema,
        initialValues: initValues,
        onSubmit: async (values) => {
            if (!client || !commentUrl || !values.comment) {
                return;
            }

            setError(null);

            return baseRequest(client, {
                rawUrl: commentUrl,
                method: "POST",
                data: {
                    body: values.comment,
                },
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

                <Stack justify="space-between">
                    <Button
                        type="submit"
                        text="Add"
                        disabled={isSubmitting}
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
