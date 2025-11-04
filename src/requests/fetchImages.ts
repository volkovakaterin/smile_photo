import axios from 'axios';

export async function fetchImages({ pageParam = 0, folderPath, limit, directory }: {
    pageParam?: number;
    folderPath: string;
    limit?: number;
    directory: string;
}) {
    const params: Record<string, any> = {
        folderPath,
        photosDirectory: directory,
        offset: pageParam * (limit ?? 0),
    };

    if (limit !== undefined) {
        params.limit = limit;
    }
    const response = await axios.get('/api/check-images', { params });
    return response.data.images || [];
}