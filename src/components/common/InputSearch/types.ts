import { InputProps } from "@deskpro/app-sdk";

export type Props = {
    value: string,
    label?: string,
    required?: boolean,
    onClear: () => void,
    onChange: InputProps['onChange'],
};
