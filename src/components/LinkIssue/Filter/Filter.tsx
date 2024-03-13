import React from "react";
import { Formik,  useFormikContext } from "formik";
import { getInitValues } from "./utils";
import { InvolveMe } from "./InvolveMe";
import { SearchInMultiSelect } from "./SearchInMultiSelect";
import { RepoSelect } from "./RepoSelect";
import type { FC } from "react";
import type { DropdownValueType } from "@deskpro/deskpro-ui";
import type { OptionRepository, FilterValues, SearchInValue } from "../types";

type Props = {
    onChange: (values: FilterValues) => void,
    repoOptions: OptionRepository[],
    selectedRepo: OptionRepository|null,
    onChangeSelectedRepo: (o: OptionRepository) => void,
};

const OnChangeField = () => {
    // Grab values and submitForm from context
    const { values, submitForm } = useFormikContext();
    const stringifyValues = JSON.stringify(values);

    React.useEffect(() => {
        submitForm();
    }, [stringifyValues, submitForm]);
    return null;
};

const Filter: FC<Props> = ({
    onChange,
    repoOptions,
    selectedRepo,
    onChangeSelectedRepo,
}) => (
    <Formik initialValues={getInitValues()} onSubmit={onChange}>
        {({ values, handleSubmit, getFieldProps, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
                <InvolveMe {...getFieldProps("involveMe")} />
                <SearchInMultiSelect
                    value={values.searchIn}
                    options={[
                        { key: "all", value: "all", label: "All", type: "value" },
                        { key: "title", value: "title", label: "Title", type: "value" },
                        { key: "body", value: "body", label: "Body", type: "value" },
                        { key: "comments", value: "comments", label: "Comments", type: "value" },
                    ] as Array<DropdownValueType<SearchInValue>>}
                    onChange={(value: FilterValues["searchIn"]) => setFieldValue("searchIn", value)}
                />
                <RepoSelect
                    value={selectedRepo}
                    options={repoOptions}
                    onChange={onChangeSelectedRepo}
                />
                <OnChangeField/>
            </form>
        )}
    </Formik>
);

export { Filter };
