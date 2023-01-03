import { FC, useState, useMemo } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
    P1,
    Input,
    IconButton,
    LoadingSpinner,
    useDeskproAppTheme,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";

const Container = styled.div`
    margin: -8px;
`;

const Description = styled(P1)`
    margin-top: 8px;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colors.grey80};
`;

const AdminPage: FC = () => {
    const { theme } = useDeskproAppTheme();
    const [callbackUrl, setCallbackUrl] = useState<string|null>(null);
    const [isCopy, setIsCopy] = useState<boolean>(false);
    const key = useMemo(() => uuidv4(), []);

    const onClickCopy = () => {
        setIsCopy(true);
        setTimeout(() => setIsCopy(false), 2000);
    };

    useInitialisedDeskproAppClient((client) => {
        client.oauth2()
            .getAdminGenericCallbackUrl(key, /code=(?<token>[0-9a-f]+)/, /state=(?<key>.+)/)
            .then(({ callbackUrl }) => setCallbackUrl(callbackUrl));
    }, [key]);

    if (!callbackUrl) {
        return (<LoadingSpinner/>);
    }

    return (
        <Container>
            <Input
                disabled={true}
                value={callbackUrl}
                rightIcon={(
                    <CopyToClipboard text={callbackUrl}>
                        <IconButton
                            minimal
                            onClick={onClickCopy}
                            icon={isCopy ? faCheck : faCopy}
                            title="Copy"
                            {...(isCopy ? { style: { color: theme.colors.green100 }} : {})}
                        />
                    </CopyToClipboard>
                )}
            />
            <Description>The callback URL will be required during GitHub app setup</Description>
        </Container>
    );
};

export { AdminPage };