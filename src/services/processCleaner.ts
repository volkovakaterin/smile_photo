import { promises as fs } from 'fs';
import path from 'path';

/**
 * Удаляет из dirPath **только папки**, у которых mtime старше days дней.
 * Рекурсивно спускается в «свежие» папки, чтобы проверить вложенные.
 *
 * @param {string} dirPath — путь к директории для сканирования
 * @param {number} days — возраст папок (в днях), старше которого их нужно удалить
 */
export async function processCleaner(dirPath: string, days: number) {

    // Читаем содержимое dirPath
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue; // пропускаем файлы

        const fullPath = path.join(dirPath, entry.name);
        let stat;
        try {
            stat = await fs.stat(fullPath);
        } catch (err) {
            console.error(`Не удалось получить статус для ${fullPath}:`, err);
            continue;
        }

        if (stat.birthtimeMs < days) {
            // Папка датой изменения старше порога — удаляем её целиком
            try {
                await fs.rm(fullPath, { recursive: true, force: true });
            } catch (err) {
                console.error(`Ошибка удаления папки ${fullPath}:`, err);
            }
        } else {
            // Если папка «свежая», спускаемся внутрь и проверяем вложенные папки
            await processCleaner(fullPath, days);
        }
    }
}
