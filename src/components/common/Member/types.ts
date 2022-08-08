import { AvatarProps, ImageAvatarProps } from "@deskpro/deskpro-ui";

export type Props = {
    name: AvatarProps["name"],
    icon?: AvatarProps["backupIcon"],
    avatarUrl?: ImageAvatarProps["imageUrl"],
};
