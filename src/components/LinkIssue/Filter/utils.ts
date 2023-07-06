import * as yup from "yup";
import type { FilterValues } from "../types";

const validationSchema = yup.object().shape({
    involveMe: yup.boolean(),
    searchIn: yup.string().oneOf(["all", "title", "body", "comments"]),
});

const getInitValues = (): FilterValues => {
    return {
        involveMe: true,
        searchIn: ["all"],
    };
};

const getFilterValues = (values: FilterValues) => {
    return values;
};

export {
    getInitValues,
    getFilterValues,
    validationSchema,
};
