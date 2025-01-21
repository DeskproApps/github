import { FC, useState, useMemo } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { P1, Input, IconButton } from "@deskpro/deskpro-ui";
import {
  LoadingSpinner,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { createSearchParams } from "react-router-dom";

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
  const { context } = useDeskproLatestAppContext<unknown, { client_id: string, use_deskpro_sass: boolean }>();

  const onClickCopy = () => {
    setIsCopy(true);
    setTimeout(() => setIsCopy(false), 2000);
  };

  useInitialisedDeskproAppClient(
    (client) => {
      const clientId = context?.settings.client_id;
      client.startOauth2Local(
        ({ state, callbackUrl }) => {
          setCallbackUrl(callbackUrl);
          return `https://github.com/login/oauth/authorize?${createSearchParams([
            ["state", state],
            ["client_id", clientId ?? ''],
            ["redirect_uri", callbackUrl],
            ["scope", ["repo", "read:project"].join(",")],
          ])}`;
        },
        /\?code=(?<code>.+?)&/,
        async function convertResponseToToken() {
          return { data: { access_token: 'unused' } }
        },
        {
          // Reduce the polling times as we don't really care about the response.
          pollInterval: 10000,
          timeout: 600,
        }
      )
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
        The callback URL will be required during GitHub app setup.
      </Description>
    </div>
  );
};

export { AdminPage };
