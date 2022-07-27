import styled from "styled-components";

type Props = {
    width?: number
};

const EmptyInlineBlock = styled.span<Props>`
    display: inline-block;
    min-width: ${({ width = 20 }) => width}px;
    content: " ";
`;

export { EmptyInlineBlock };
