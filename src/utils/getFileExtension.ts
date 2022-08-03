const getFileExtension = (filename: string): string|undefined => filename.split(".").pop();

export { getFileExtension };
