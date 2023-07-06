import{ FC } from "react"
import styled from "styled-components";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { P5, Icon, Stack } from "@deskpro/app-sdk";
import { OverflowText } from "./OverflowText";
import { Link } from "../Link";
import {nbsp} from "../../../constants";

const TextTile = styled(OverflowText)`
    width: calc(100% - 35px);
`;

const OverflowTextWithLink: FC<{
    url: string,
    title: string,
}> = ({ url, title }) => (
    <Stack>
        <TextTile>{title}</TextTile>
        {nbsp}
        <P5>
            <Link href={url} target="_blank">
                <Icon icon={faArrowUpRightFromSquare}/>
            </Link>
        </P5>
    </Stack>
);

export { OverflowTextWithLink };
