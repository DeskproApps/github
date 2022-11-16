import { default as fnsFormat } from "date-fns/format";
import { FORMAT } from "./constants";

const format = (date?: string, pattern = FORMAT): string => {
    if (!date) {
        return "-";
    }

    return fnsFormat(new Date(date), pattern);
};

export { format };
