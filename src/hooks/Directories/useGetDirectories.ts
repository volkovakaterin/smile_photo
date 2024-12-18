
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


export const getDirectories = async (): Promise<Response> => {
    const response = await axios.get<Response>(`http://localhost:3000/api/directories`);
    console.log(response.data);
    return response.data;
};

export function useDirectories() {
    const { data, isLoading, error, isSuccess, isFetching } = useQuery({
        queryKey: ['directories'],
        queryFn: getDirectories,
        select: (data: any) => data,
    });

    return { dir: data }
}