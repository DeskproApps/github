import { FC } from "react";
import styled from "styled-components";
import { TextBlockWithLabel } from "../TextBlockWithLabel";
import { Props as TextBlockWithLabelProps } from "../TextBlockWithLabel/types";
import { DeskproAppTheme } from "@deskpro/app-sdk";

export type Props = {
    leftLabel?: TextBlockWithLabelProps["label"],
    leftText: TextBlockWithLabelProps["text"],
    rightLabel?: TextBlockWithLabelProps["label"],
    rightText: TextBlockWithLabelProps["text"],
};

const Container = styled.div`
    display: flex;
    align-items: stretch;
    margin-bottom: 10px;
`;

const Side = styled.div`
    width: calc(49% - 6px);
`;

const Divider = styled.div<DeskproAppTheme>`
    width: 1px;
    margin: 0 6px;
    background-color: ${({ theme }) => theme.colors.grey20};
`;


const TwoSider: FC<Props> = ({ leftLabel, leftText, rightLabel, rightText }) => (
    <Container>
        <Side>
            <TextBlockWithLabel
                marginBottom={0}
                label={leftLabel}
                text={leftText}
            />
        </Side>
        <Divider />
        <Side>
            <TextBlockWithLabel
                marginBottom={0}
                label={rightLabel}
                text={rightText}
            />
        </Side>
    </Container>
);

export { TwoSider };
