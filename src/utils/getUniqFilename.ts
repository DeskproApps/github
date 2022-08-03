import { nanoid } from "nanoid";
import isString from "lodash/isString";
import isEmpty from "lodash/isEmpty";
import { getFileExtension } from "./getFileExtension";

const getUniqFilename = (filename?: string) => {
    const randomString = nanoid();
    const file = [randomString];
    const ext = getFileExtension(filename || "");

    if (isString(ext) && !isEmpty(ext)) {
        file.push(ext);
    }

    return file.join(".");
};

export { getUniqFilename };
