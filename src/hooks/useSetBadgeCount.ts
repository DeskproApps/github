import { useEffect } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSetBadgeCount = (items: any[]) => {
    const { client } = useDeskproAppClient();

    useEffect(() => {
        if (!Array.isArray(items)) {
            return;
        }

        client?.setBadgeCount(items.length);
    }, [client, items]);
};

export { useSetBadgeCount };
