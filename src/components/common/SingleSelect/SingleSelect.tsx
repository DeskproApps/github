import { FC, useEffect, useState, useMemo } from "react";
import {
    faCheck,
    faCaretDown,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DivAsInputWithDisplay, DropdownTargetProps } from "@deskpro/deskpro-ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SingleSelect: FC<any> = ({
    label,
    error,
    value,
    options,
    onChange,
    required,
    placeholder,
    ...props
}) => {
    const [input, setInput] = useState<string>("");
    const [dirtyInput, setDirtyInput] = useState<boolean>(false);

    const selectedValue = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return options.filter((o) => o.value === value?.value)[0]?.label ?? "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.value]);

    useEffect(() => {
        setInput(value?.label || "Select Value");
    }, [value]);

    return (
        <Dropdown
            showInternalSearch
            fetchMoreText={"Fetch more"}
            autoscrollText={"Autoscroll"}
            selectedIcon={faCheck}
            externalLinkIcon={faExternalLinkAlt}
            placement="bottom-start"
            hideIcons
            inputValue={!dirtyInput ? "" : input}
            onSelectOption={(selectedOption) => {
                !dirtyInput && setDirtyInput(true);
                onChange(selectedOption);
            }}
            onInputChange={(value) => {
                !dirtyInput && setDirtyInput(true);
                setInput(value);
            }}
            options={options.filter((option: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                return !dirtyInput
                    ? true
                    : option.label.toLowerCase().includes(input.toLowerCase());
            })}
            {...props}
        >
            {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
                <DivAsInputWithDisplay
                    id={`${Math.random()}`}
                    placeholder={placeholder || "Select Value"}
                    value={selectedValue}
                    variant="inline"
                    rightIcon={faCaretDown}
                    ref={targetRef}
                    {...targetProps}
                    isVisibleRightIcon
                    style={{ marginBottom: 10 }}
                />
            )}
        </Dropdown>
    );
};

export { SingleSelect };
