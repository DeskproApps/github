import styled, { css } from "styled-components";

type Props = {
  isAdmin: boolean;
};

const AppContainer = styled.div<Props>`
  margin-bottom: ${({ isAdmin }) => isAdmin ? 0 : "3rem"};

  ${({ isAdmin }) => isAdmin ? css`
    p {
      margin-bottom: 0;
    }
  ` : "" }
`;

export { AppContainer };
