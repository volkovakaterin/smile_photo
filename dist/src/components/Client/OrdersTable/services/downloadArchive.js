import axios from 'axios';
export const downloadArchive = async (orderId, order, dir) => {
    try {
        const response = await axios.post('/api/create-archive', null, {
            params: { order: order, dir: dir },
            responseType: 'arraybuffer',
        });
        if (response.status === 200) {
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${orderId}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
        }
        else {
            alert('Ошибка при создании архива');
        }
    }
    catch (error) {
        console.error('Ошибка при запросе:', error);
        alert('Не удалось создать архив');
    }
};
//# sourceMappingURL=downloadArchive.js.map