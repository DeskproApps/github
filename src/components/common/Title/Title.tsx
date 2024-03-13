import { FC, ReactNode } from "react";
import { H1 } from "@deskpro/deskpro-ui";

type Props = {
    children: ReactNode,
    marginBottom?: number,
};

const Title: FC<Props> = ({ children, marginBottom = 14 }) => (
    <H1 style={{ marginBottom }}>{children}</H1>
);

export { Title };
