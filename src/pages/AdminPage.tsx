import { FC, useState, useMemo } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { P1, Input, IconButton } from "@deskpro/deskpro-ui";
import {
  LoadingSpinner,
  useDeskproAppTheme,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";

const Description = styled(P1)`
  margin-top: 8px;
  /* margin-bottom: 16px; */
  color: ${({ theme }) => theme.colors.grey80};
`;

const AdminPage: FC = () => {
  const { theme } = useDeskproAppTheme();
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const key = useMemo(() => uuidv4(), []);

  const onClickCopy = () => {
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 2000);
  };

  useInitialisedDeskproAppClient(
    (client) => {
      client
        .startOauth2Local(
          ({ state, callbackUrl, codeChallenge }) => {
            setCallbackUrl(callbackUrl)
            return `https://idp.example.com/authorize?client_id=xxx&state=${state}&code_challenge=${codeChallenge}&redirect_uri=${callbackUrl}`
          },
          /\?code=(?<code>.+?)&/,
          async function convertResponseToToken(code: string) {
            return undefined as any; // This is never called, we are only interested in getting the URL, not actually authing.
          },
        );
    },
    [key]
  );

  if (!callbackUrl) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Input
        disabled={true}
        value={callbackUrl}
        rightIcon={
          <CopyToClipboard text={callbackUrl}>
            <IconButton
              minimal
              onClick={onClickCopy}
              icon={isCopy ? faCheck : faCopy}
              title="Copy"
              {...(isCopy ? { style: { color: theme.colors.green100 } } : {})}
            />
          </CopyToClipboard>
        }
      />
      <Description>
        The callback URL will be required during GitHub app setup
      </Description>
    </div>
  );
};

export { AdminPage };
