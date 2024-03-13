import { InputProps } from "@deskpro/deskpro-ui";

export type Props = {
    value: string,
    label?: string,
    disabled?: boolean,
    required?: boolean,
    onClear: () => void,
    onChange: InputProps['onChange'],
};
