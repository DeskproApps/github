import { FC } from "react";
import { Checkbox, HorizontalDivider } from "@deskpro/app-sdk";
import { Issue as IssueType } from "../../../services/github/types";
import { Card, CardMedia, CardBody, IssueInfo } from "../../common";

const Issue: FC<IssueType & {
    checked: boolean,
    onChange: () => void,
    onClick: () => void,
}> = ({ checked, onChange, ...props }) => {
    return (
        <>
            <Card>
                <CardMedia>
                    <Checkbox
                        size={12}
                        checked={checked}
                        onChange={onChange}
                    />
                </CardMedia>
                <CardBody>
                    <IssueInfo {...props}/>
                </CardBody>
            </Card>
            <HorizontalDivider style={{ marginBottom: 9 }} />
        </>
    );
};

export { Issue };
