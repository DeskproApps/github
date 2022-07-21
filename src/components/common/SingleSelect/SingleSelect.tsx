import {FC, useEffect, useState} from "react";
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const selectedValue = options.filter((o) => o.value === value?.value)[0]?.label ?? "";

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
            onSelectOption={onChange}
            hideIcons
            inputValue={input}
            onInputChange={setInput}
            options={options.filter((option: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                return option.label.toLowerCase().includes(input.toLowerCase());
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
