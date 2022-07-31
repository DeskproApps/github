import { FC } from "react";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Avatar } from "@deskpro/deskpro-ui";
import { P5, Stack } from "@deskpro/app-sdk";
import { Props } from "./types";

const Member: FC<Props> = ({ name, icon, avatarUrl }) => {
    return (
        <Stack gap={6}>
            <Avatar
                size={18}
                name={name}
                backupIcon={icon || faUser}
                {...(avatarUrl ? { imageUrl: avatarUrl } : {})}
            />
            <P5>{name}</P5>
        </Stack>
    );
};

export { Member };
