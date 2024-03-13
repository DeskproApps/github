import { FC } from "react"
import styled from "styled-components";
import { P5 } from "@deskpro/deskpro-ui";

const OverflowText: FC = styled(P5)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export { OverflowText };
