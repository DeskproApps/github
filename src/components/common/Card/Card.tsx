import styled from "styled-components";

const Card = styled.div`
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
`;

const CardMedia = styled.div``;

const CardBody = styled.div`
    width: calc(100% - 12px - 8px);
`;

export { Card, CardMedia, CardBody };
