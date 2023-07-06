// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isLast = (array: Array<any>, index: number): boolean => {
    if (!Array.isArray(array)) {
        return false;
    }

    return ((array.length - 1) !== index);
};

export { isLast };
