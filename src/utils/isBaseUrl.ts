import { BASE_URL } from "../services/github/constants";

const isBaseUrl = (url = ""): boolean => {
    return url.toLowerCase().startsWith(BASE_URL);
};

export { isBaseUrl };
