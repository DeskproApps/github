import { FC, useState, useCallback } from "react";
import get from "lodash/get";
import * as yup from "yup";
import { useFormik } from "formik";
import { useNavigate, createSearchParams, useSearchParams } from "react-router-dom";
import {
    Stack,
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { baseRequest } from "../services/github";
import { useSetAppTitle } from "../hooks";
import {
    Label,
    Button,
    TextArea,
    ErrorBlock,
} from "../components/common";

const validationSchema = yup.object().shape({
    comment: yup.string().required(),
});

const initValues = {
    comment: "",
};

const AddCommentPage: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [error, setError] = useState<string|null>(null);

    const issueUrl = searchParams.get("issueUrl");
    const commentUrl = searchParams.get("commentUrl");

    const {
        errors,
        touched,
        handleSubmit,
        isSubmitting,
        getFieldProps,
    } = useFormik({
        validationSchema,
        initialValues: initValues,
        onSubmit: async (values) => {
            if (!client || !commentUrl || !values.comment || !issueUrl) {
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
                    navigate({
                        pathname: "/view_issue",
                        search: `?${createSearchParams([
                            ["issueUrl", issueUrl],
                        ])}`,
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
            payload: { type: "changePage", params: "/home" }
        });
    });

    const onCancel = useCallback(() => {
        if (issueUrl) {
            navigate({
                pathname: "/view_issue",
                search: `?${createSearchParams([ ["issueUrl", issueUrl]])}`,
            })
        }
    }, [issueUrl, navigate]);

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
                        error={!!(touched.comment && errors.comment)}
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
