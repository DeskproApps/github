import { FC } from "react";
import styled from "styled-components";
import { TextBlockWithLabel } from "../TextBlockWithLabel";
import { Props as TextBlockWithLabelProps } from "../TextBlockWithLabel/types";

export type Props = {
    leftLabel: TextBlockWithLabelProps["label"],
    leftText: TextBlockWithLabelProps["text"],
    rightLabel: TextBlockWithLabelProps["label"],
    rightText: TextBlockWithLabelProps["text"],
};

const Container = styled.div`
   margin-bottom: -1px;
`;

const Side = styled.div`
    display: inline-block;
    width: calc(49% - 6px);
`;

const Divider = styled.div`
    display: inline-block;
    width: 1px;
    height: 2em;
    background-color: ${({ theme }) => theme.colors.grey20};
    margin: 0 6px;
`;


const TwoSider: FC<Props> = ({ leftLabel, leftText, rightLabel, rightText }) => (
    <Container>
        <Side>
            <TextBlockWithLabel
                label={leftLabel}
                text={leftText}
            />
        </Side>
        <Divider />
        <Side>
            <TextBlockWithLabel
                label={rightLabel}
                text={rightText}
            />
        </Side>
    </Container>
);

export { TwoSider };
