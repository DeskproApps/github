import { DateTime } from "../../services/github/types";

const getDate = (date?: DateTime): string => {
    if (!date) {
        return "-";
    }

    return (new Date(date)).toLocaleDateString()
};

export { getDate };
