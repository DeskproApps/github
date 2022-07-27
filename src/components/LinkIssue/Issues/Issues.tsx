import { FC } from "react";
import { Issue } from "./Issue";
import { NoFound  } from "../../common";
import { Issue as IssueType } from "../../../services/github/types";

type Props = {
    issues: IssueType[],
    selectedIssues: Array<IssueType["id"]>
    onChange: (id: IssueType["id"]) => void,
};

const Issues: FC<Props> = ({ onChange, issues, selectedIssues }) => {
    if (!Array.isArray(issues)) {
        return (<NoFound/>);
    }

    if (issues.length === 0) {
        return (<NoFound text="No GitHub issues found" />);
    }

    return (
        <>
            {issues.map((issue) => (
                <Issue
                    key={issue.id}
                    checked={selectedIssues.includes(issue.id)}
                    onChange={() => onChange(issue.id)}
                    onClick={() => onChange(issue.id)}
                    {...issue}
                />
            ))}
        </>
    )
};

export { Issues };
