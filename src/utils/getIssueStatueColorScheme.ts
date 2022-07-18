import { match } from "ts-pattern";
import { DeskproAppTheme } from "@deskpro/app-sdk";
import { Issue } from "../services/github/types";

const getIssueStatueColorScheme = (
    theme: DeskproAppTheme["theme"],
    status: Issue["state"],
) => {
    return match(status.toLowerCase())
        .with("open", () => theme.colors.green100)
        .with("closed", () => theme.colors.amethyst100)
        .otherwise(() => theme.colors.green40)
}

export { getIssueStatueColorScheme };
