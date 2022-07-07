import { FC, useState } from "react";
import styled from "styled-components";
import { P5, H3 } from "@deskpro/app-sdk";
import { Loading, AnchorButton } from "../components/common";

const LogInError = styled(P5)`
    margin-bottom: 8px;
    color: ${({
        // @ts-ignore
        theme
    }) => theme.colors.scarlett100};
`;

const LogInPage: FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [authUrl, setAuthUrl] = useState("");

    const onSignIn = () => {};

    return loading
        ? (<Loading/>)
        : (
            <>
                <H3 style={{ marginBottom: !error ? 14 : 2 }}>Log into your Trello Account</H3>
                {error && (<LogInError>An error occurred, please try again.</LogInError>)}
                <AnchorButton text="Sign In" href={authUrl} target="_blank" onClick={onSignIn}/>
            </>
        );
};

export { LogInPage };
