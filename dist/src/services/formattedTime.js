export const formattedTime = (dateOrder) => {
    const date = new Date(dateOrder);
    const formattedTime = date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return formattedTime;
};
//# sourceMappingURL=formattedTime.js.map