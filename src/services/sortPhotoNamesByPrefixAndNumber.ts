export function sortPhotoNamesByPrefixAndNumber(images: string[]): string[] {
    const grouped: Record<string, string[]> = {};

    images.forEach((image) => {
        const match = image.match(/^([^\d_]+)[^\d]*?(\d+)/); // например: kis_1456 → ["kis_1456", "kis", "1456"]
        if (match) {
            const prefix = match[1];
            if (!grouped[prefix]) grouped[prefix] = [];
            grouped[prefix].push(image);
        } else {
            // если не нашли цифру — положим в группу без префикса
            if (!grouped['']) grouped[''] = [];
            grouped[''].push(image);
        }
    });

    const sorted: string[] = [];

    // Сортируем группы по имени префикса
    Object.keys(grouped)
        .sort()
        .forEach((prefix) => {
            const group = grouped[prefix];

            // Сортируем внутри группы по числовой части
            group.sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
                const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
                return numA - numB;
            });

            sorted.push(...group);
        });

    return sorted;
}
