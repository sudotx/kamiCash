export function getPaginationData(page: string, limit: string, totalItems: number) {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
        currentPage,
        itemsPerPage,
        skip,
        totalPages,
    };
}