import { FC } from "react";
import styled from "styled-components";
import {
    faCheck,
    faCaretDown,
    faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown, Input } from "@deskpro/deskpro-ui";
import { Label } from "../Label";

const InputStyled = styled(Input)`
    width: calc(100% - 22px);
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SingleSelect: FC<any> = ({
    label,
    error,
    value,
    onChange,
    required,
    ...props
}) => {
    return (
        <Dropdown
            fetchMoreText={"Fetch more"}
            autoscrollText={"Autoscroll"}
            selectedIcon={faCheck}
            externalLinkIcon={faExternalLinkAlt}
            placement="bottom-start"
            inputValue={value?.label || "Select Value"}
            onSelectOption={onChange}
            hideIcons
            {...props}
        >
            {({ inputProps, inputRef }) => (
                <Label label={label} required={required}>
                    <InputStyled
                        ref={inputRef}
                        variant="inline"
                        rightIcon={faCaretDown}
                        placeholder="Select Value"
                        error={error}
                        {...inputProps}
                    />
                </Label>
            )}
        </Dropdown>
    );
};

export { SingleSelect };
