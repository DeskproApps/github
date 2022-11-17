import isBefore from "date-fns/isBefore";
import { DateTime } from "../../services/github/types";

const sortDate = (a: DateTime, b: DateTime) => {
    return isBefore(new Date(a), new Date(b)) ? 1 : -1;
}

export { sortDate };
