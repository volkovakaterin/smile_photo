export const formattedDate = (dateOrder) => {
    const date = new Date(dateOrder);

    const formattedDate = date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    return formattedDate
}

