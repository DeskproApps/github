import React from "react";
import {faCaretDown, faCheck, faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";
import {
    Dropdown,
    DivAsInputWithDisplay,
} from "@deskpro/app-sdk";
import { Label } from "../../../common";
import type { FC } from "react";
import type {
    DropdownValueType,
    DropdownTargetProps,
} from "@deskpro/app-sdk";
import type { FilterValues, SearchInValue } from "../../types";

type Props = {
    value: FilterValues["searchIn"],
    options: Array<DropdownValueType<SearchInValue>>,
    onChange: (option: FilterValues["searchIn"]) => void,
};

const SearchInMultiSelect: FC<Props> = ({
    value,
    options,
    onChange,
}) => {
    const multiSelectOptions = options.map((option) => ({
        ...option,
        selected: !!option.value && value.includes(option.value),
    }));

    const visibleInput = multiSelectOptions.reduce((acc, o) => {
        if (o.selected && o.label) {
            acc.push(o.label as never);
        }

        return acc;
    }, []);

    return (
        <Dropdown
            hideIcons
            selectedIcon={faCheck}
            placement="bottom-start"
            fetchMoreText={"Fetch more"}
            autoscrollText={"Autoscroll"}
            externalLinkIcon={faExternalLinkAlt}
            options={multiSelectOptions}
            onSelectOption={(option) => {
                if (option.value) {
                    value.includes(option.value)
                        ? onChange(value.filter((s) => s !== option.value))
                        : onChange([...value, option.value]);
                }
            }}
            closeOnSelect={false}
        >
            {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
                <Label label="Search in">
                    <DivAsInputWithDisplay
                        id="searchIn"
                        variant="inline"
                        isVisibleRightIcon
                        placeholder="Select Value"
                        value={visibleInput.join(", ")}
                        rightIcon={faCaretDown}
                        ref={targetRef}
                        {...targetProps}
                    />
                </Label>
            )}
        </Dropdown>
    );
};

export { SearchInMultiSelect };
