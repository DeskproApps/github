import styled from "styled-components";

const Link = styled.a`
    color: ${({ theme, color = theme.colors.grey40 }) => color};
`;

export { Link };
