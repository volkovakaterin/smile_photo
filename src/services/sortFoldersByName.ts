import { Folder } from "@/app/(frontend)/search-photo/page";

export function sortFoldersByName(folders: Folder[]): Folder[] {
    const numeric: (Folder & { _sortValue: number })[] = [];
    const nonNumeric: Folder[] = [];

    folders.forEach(folder => {
        const name = folder.name.trim();
        if (/^\d+$/.test(name)) {
            numeric.push({ ...folder, _sortValue: Number(name) });
        } else {
            nonNumeric.push(folder);
        }
    });

    // Сортировка числовых по значению
    const sortedNumeric = numeric
        .sort((a, b) => a._sortValue - b._sortValue)
        .map(({ _sortValue, ...rest }) => rest);

    // Сортировка нечисловых по имени (алфавитно)
    const sortedNonNumeric = nonNumeric.sort((a, b) =>
        a.name.localeCompare(b.name, 'ru', { numeric: true })
    );

    return [...sortedNumeric, ...sortedNonNumeric];
}