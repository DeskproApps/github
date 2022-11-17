import { match } from "ts-pattern";
import { DeskproAppTheme } from "@deskpro/app-sdk";
import { PullRequest } from "../services/github/types";

const getPRStateColor = (
    theme: DeskproAppTheme["theme"],
    state: PullRequest["state"],
): string => match(state)
    .with("OPEN", () => theme.colors.green100)
    .with("CLOSED", () => theme.colors.scarlett80)
    .with("MERGED", () => theme.colors.amethyst80)
    .otherwise(() => theme.colors.grey40);

export { getPRStateColor };
