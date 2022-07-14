import { FC } from "react";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
    Label,
    Input,
    IconButton,
} from "@deskpro/app-sdk";
import { Props } from "./types";

const InputSearch: FC<Props> = ({ value, label, onChange, onClear, required = false }) => {
    return (
        <Label
            required={required}
            label={label}
            htmlFor="inputSearch"
            style={{ marginBottom: 11 }}
        >
            <Input
                id="inputSearch"
                value={value}
                onChange={onChange}
                leftIcon={faSearch}
                rightIcon={<IconButton icon={faTimes} minimal onClick={onClear} />}
            />
        </Label>
    );
}

export { InputSearch };
