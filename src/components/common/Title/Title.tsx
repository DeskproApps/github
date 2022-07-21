import { FC } from "react";
import { H1 } from "@deskpro/app-sdk";

const Title: FC = ({ children }) => (
    <H1 style={{ marginBottom: 14 }}>{children}</H1>
);

export { Title };
