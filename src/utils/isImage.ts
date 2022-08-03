import { getFileExtension } from "./getFileExtension";

const isImage = (fileName: string): boolean => {
    const ext = getFileExtension(fileName);

    if (!ext) {
        return false;
    }

    return ["png", "jpg", "jpeg", "gif"].includes(ext);
};

export { isImage };
