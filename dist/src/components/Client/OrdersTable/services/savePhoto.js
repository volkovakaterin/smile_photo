import axios from 'axios';
export async function savePhoto(imagePath, imageName) {
    try {
        const response = await axios.post('/api/save-photo', { params: { imagePath, imageName } }, { responseType: 'blob' });
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'output.jpeg';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                fileName = match[1];
            }
        }
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error('Error saving photo:', error.message);
    }
}
//# sourceMappingURL=savePhoto.js.map