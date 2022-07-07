import { useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";

const useSetAppTitle = (title: string): void => {
    const { client } = useDeskproAppClient();

    useEffect(() => client?.setTitle(title), [client, title]);
};

export { useSetAppTitle };
