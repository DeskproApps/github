import { FC } from "react";
import styled from "styled-components";
import { Stack } from "@deskpro/app-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { Props } from "./types";

const StyledErrorBlock = styled(Stack)`
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.red100};
  margin-bottom: 8px !important;
  padding: 4px 6px !important;
  border-radius: 4px;
  font-size: 12px;
  width: 100%;
`;

export const ErrorBlock: FC<Props> = ({ text }) => (
    <StyledErrorBlock className="error-block">
        <FontAwesomeIcon icon={faExclamation} style={{marginRight: "6px"}}/>
        <div className="error-block-messages">
            {Array.isArray(text) ? text.map((msg, idx) => (
                <div className="error-block-message" key={idx}>{msg}</div>
            )) : text}
        </div>
    </StyledErrorBlock>
);
