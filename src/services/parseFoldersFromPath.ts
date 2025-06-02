import path from 'path';

export interface FolderFromDB {
    id: string;
    name: string;
    path: string;
    with_photo: boolean;
    createdAt: string;
}

export function parseFoldersFromPath(
    fullPath: string,
    rootFolderAbsolutePath: string,
) {
    // 1) Убедимся, что fullPath действительно начинается с указанного префикса:
    if (!fullPath.startsWith(rootFolderAbsolutePath)) {
        throw new Error(
            `Корневая папка "${rootFolderAbsolutePath}" не найдена в пути "${fullPath}"`
        );
    }

    // 2) Получаем «относительную часть» пути, отбросив сам префикс.
    let relativePath = fullPath.slice(rootFolderAbsolutePath.length);
    if (relativePath.startsWith(path.sep) || relativePath.startsWith("/")) {
        relativePath = relativePath.slice(1);
    }

    // 3) Разбиваем по разделителю "/" (или path.sep) на сегменты:
    const allSegments = relativePath.split(/[\\/]+/);

    // 4) Отбрасываем последний сегмент, если это файл (если есть точка расширения).
    const withoutFile = allSegments.filter((seg, idx) => {
        return !(idx === allSegments.length - 1 && /\.[^/.]+$/.test(seg));
    });

    // 5) На основе безименного массива withoutFile строим список { name, path }:
    const folderPaths: { name: string; path: string, with_photo: boolean }[] = withoutFile.map((name, i) => {
        const parentPath = withoutFile.slice(0, i).join("/");
        return {
            name,
            path: parentPath,
            with_photo: false
        };
    });
    folderPaths[folderPaths.length - 1].with_photo = true
    return folderPaths
}