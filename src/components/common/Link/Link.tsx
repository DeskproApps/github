import { DeskproAppTheme } from "@deskpro/app-sdk";
import styled from "styled-components";

const Link = styled.a<DeskproAppTheme>`
    color: ${({ theme, color = theme.colors.grey40 }) => color};
`;

export { Link };
