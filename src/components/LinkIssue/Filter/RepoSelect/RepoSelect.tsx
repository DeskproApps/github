import { useState, useMemo } from "react";
import {
    faCheck,
    faCaretDown,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
    Dropdown,
    DropdownTargetProps,
    DivAsInputWithDisplay,
} from "@deskpro/deskpro-ui";
import { Label } from "../../../common";
import type { FC } from "react";
import type { OptionRepository } from "../../types";

type Props = {
    value: OptionRepository|null,
    options: OptionRepository[],
    onChange: (option: OptionRepository) => void,
};

const RepoSelect: FC<Props> = ({ value, onChange, options }) => {
    const [input, setInput] = useState<string>("");
    const selectedValue = useMemo(() => {
        return options.filter((o) => o.value === value?.value)[0]?.label ?? "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <Label htmlFor="repository" label="Repository">
            <Dropdown
                showInternalSearch
                fetchMoreText={"Fetch more"}
                autoscrollText={"Autoscroll"}
                selectedIcon={faCheck}
                externalLinkIcon={faExternalLinkAlt}
                placement="bottom-start"
                hideIcons
                inputValue={input}
                onSelectOption={(selectedOption) => {
                    setInput("");
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onChange(selectedOption);
                }}
                onInputChange={(value) => {
                    setInput(value);
                }}
                options={options.filter((option: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    return option.label.toLowerCase().includes(input.toLowerCase());
                })}
            >
                {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => {
                    return (
                        <DivAsInputWithDisplay
                            id="repository"
                            placeholder="Select Value"
                            value={selectedValue}
                            variant="inline"
                            rightIcon={faCaretDown}
                            ref={targetRef}
                            {...targetProps}
                            isVisibleRightIcon
                            style={{ marginBottom: 10 }}
                        />
                    )
                }}
            </Dropdown>
        </Label>
    );
};

export { RepoSelect };