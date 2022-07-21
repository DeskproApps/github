import showdown from "showdown";

const converter = new showdown.Converter();

const mdToHtml = (value: string): string => {
    return converter.makeHtml(value);
};

export { mdToHtml };
