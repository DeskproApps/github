import React from "react";
import { Checkbox } from "@deskpro/deskpro-ui";
import { Label } from "../../../common";
import type { FC } from "react";
import type { FieldInputProps } from "formik";
import type { FilterValues } from "../../types";

type Props = FieldInputProps<FilterValues["involveMe"]> & {
    //...
};

const InvolveMe: FC<Props> = ({ value, onChange, ...props }) => (
    <Label>
        <Checkbox
            {...props}
            checked={value}
            onChange={onChange}
            label="Only show issues involving me"
            labelStyle={{ cursor: "pointer" }}
        />
    </Label>
);

export { InvolveMe };
