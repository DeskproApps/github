// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProjectsClassic = (node: { edges: any[] }) => {
    if (!Array.isArray(node?.edges)) {
        return [];
    }

    return node.edges.map(({ node }) => ({
        ...node.project,
        title: node.project.name,
    }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProjectsV2 = (node: { edges: any[] }) => {
    if (!Array.isArray(node?.edges)) {
        return [];
    }

    return node.edges.map(({ node }) => node);
};
