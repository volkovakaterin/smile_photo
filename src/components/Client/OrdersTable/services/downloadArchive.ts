
export const downloadArchive = async (order, dir) => {
    try {
        const response = await fetch('/api/create-archive', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // (по желанию) сообщить серверу, что ждём zip:
                'Accept': 'application/zip',
            },
            body: JSON.stringify({ order, dir }),
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Ошибка при загрузке архива: ${errText}`);
        }

        // 3. Считываем тело ответа как ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // 4. Создаем Blob и «свежий» URL для скачивания
        const blob = new Blob([arrayBuffer], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);

        // 5. Создаём <a> с нужными атрибутами и кликаем по нему
        const a = document.createElement('a');
        a.href = url;
        a.download = `${order.tel_number}.zip`;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Ошибка при запросе:', error);
        alert('Не удалось создать архив');
    }
};