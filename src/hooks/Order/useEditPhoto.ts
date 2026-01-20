
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

const normalizePath = (p) => p.replace(/\\/g, '/');

export interface FolderStats {
    folder_name: string;
    number_photos: number;
}

export interface PhotoOrder {
    image: string;
    mtimeMs?: number;
    products?: { product: string; quantity: number; label: string; done?: boolean; electronic_frame?: boolean }[];
}

export interface EditPhotoPayload {
    id: string;
    photoOrder: PhotoOrder[];
    number_photos_in_folders?: FolderStats[];
}

// 2) В сервисе подготавливаем тело запроса динамически
export const editPhotoOrder = async (data: EditPhotoPayload): Promise<Response> => {
    const { id, photoOrder, number_photos_in_folders } = data;
    // всегда отправляем images…
    const body: Record<string, any> = { images: photoOrder };
    // …а number_photos_in_folders — только если он есть
    if (number_photos_in_folders) {
        body.number_photos_in_folders = number_photos_in_folders;
    }
    const response = await axios.patch<Response>(`/api/orders/${id}`, body);
    return response.data;
};

// 3) Хук тоже принимает тот же тип
export function useEditPhotoToOrder() {
    const qc = useQueryClient();
    return useMutation<Response, Error, EditPhotoPayload>({
        mutationKey: ['edit-order'],
        mutationFn: editPhotoOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['order'] });
            qc.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}



export const useEditOrder = () => {
    const { mutate: editPhoto } = useEditPhotoToOrder();
    const queryClient = useQueryClient();

    type ImageMeta = { image: string; mtimeMs?: number };
    type ImageInput = string | ImageMeta;

    const normalizeImageInput = (input: ImageInput): ImageMeta => {
        if (typeof input === 'string') return { image: input, mtimeMs: undefined };
        return { image: input.image, mtimeMs: input.mtimeMs };
    };


    //Добавить только фото без форматов
    const handleAddPhotoOrder = (orderId, selectPhoto: ImageInput, order, fromFolder) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно добавить фото.');
            return;
        }

        if (!selectPhoto) {
            console.error('Фото не выбрано. Невозможно добавить фото.');
            return;
        }

        const { image, mtimeMs } = normalizeImageInput(selectPhoto);
        const normalizedPath = normalizePath(image);

        // ✅ защита от дублей (раньше могло добавлять одинаковые)
        const exists = order?.images?.some((item) => normalizePath(item.image) === normalizedPath);
        if (exists) {
            console.log('Фото уже есть в заказе, пропускаю:', normalizedPath);
            return;
        }


        const newImage: PhotoOrder = { image: normalizedPath, mtimeMs, products: [] };


        const updatedImages: PhotoOrder[] = order
            ? [...order.images, newImage]
            : [newImage];

        // 2) Обновляем number_photos_in_folders
        const existingFolders = order?.number_photos_in_folders ?? [];
        const folderAlreadyExists = existingFolders.some(
            (f) => f.folder_name === fromFolder.folderName
        );

        const updatedFolders = folderAlreadyExists
            ? existingFolders
            : [
                ...existingFolders,
                {
                    folder_name: fromFolder.folderName,
                    number_photos: fromFolder.photoNumber,
                },
            ];

        editPhoto(
            {
                id: orderId,
                photoOrder: updatedImages,
                number_photos_in_folders: updatedFolders,
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении фото в заказ:', error);
                },
            }
        );
    };

    //Добавить все фото из папки (без форматов)
    const handleAddAllPhotoOrder = (orderId, images: ImageInput[], order, fromFolder) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно добавить фото.');
            return;
        }

        if (!images?.length) {
            console.error('Фото не выбраны. Невозможно добавить фото.');
            return;
        }

        // 1) Set уже добавленных фото
        const existingSet = new Set((order?.images ?? []).map((item) => normalizePath(item.image)));

        // 2) Нормализуем вход и выкидываем то, что уже есть
        const toAddMeta: ImageMeta[] = images
            .map(normalizeImageInput)
            .map(({ image, mtimeMs }) => ({ image: normalizePath(image), mtimeMs }))
            .filter(({ image }) => !!image)
            .filter(({ image }) => !existingSet.has(image));

        if (!toAddMeta.length) {
            console.log('Нет новых фото для добавления — все уже в заказе.');
            return;
        }

        // 3) Формируем PhotoOrder
        const newImages: PhotoOrder[] = toAddMeta.map(({ image, mtimeMs }) => ({
            image,
            mtimeMs,
            products: [],
        }));


        const updatedImages: PhotoOrder[] =
            order && order.images ? [...order.images, ...newImages] : newImages;

        // 4) Обновляем number_photos_in_folders
        const existingFolders = order?.number_photos_in_folders ?? [];
        const folderAlreadyExists = existingFolders.some(
            (f) => f.folder_name === fromFolder.folderName
        );

        const updatedFolders = folderAlreadyExists
            ? existingFolders
            : [
                ...existingFolders,
                {
                    folder_name: fromFolder.folderName,
                    number_photos: fromFolder.photoNumber,
                },
            ];

        editPhoto(
            {
                id: orderId,
                photoOrder: updatedImages,
                number_photos_in_folders: updatedFolders,
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении фото в заказ:', error);
                },
            }
        );
    };

    //Редактировать заказ из формы выбора формата
    const editOrder = (productsWithPhoto: FormData, orderId, selectPhoto, order) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }

        const result = Object.entries(productsWithPhoto)
            .filter(([_, value]) => value?.quantity > 0)
            .map(([key, value]) => ({ product: key, quantity: value.quantity, label: value.name }));

        let images = [...order.images];

        if (!result.length) {
            images = images.filter(item => normalizePath(item.image) !== selectPhoto);

            const body: PhotoOrder[] = images;
            editPhoto(
                { photoOrder: body, id: orderId },
                {
                    onSuccess: (data: any) => {
                        queryClient.invalidateQueries({ queryKey: ['order'] });
                    },
                    onError: (error) => {
                        console.error('Ошибка при удалении фото из заказа:', error);
                    },
                }
            );
            return;
        }

        const existingIndex = images.findIndex(item => normalizePath(item.image) === selectPhoto);

        if (existingIndex !== -1) {
            images[existingIndex] = { ...images[existingIndex], products: result };
        } else {
            const newImage = { image: selectPhoto, products: result };
            images.push(newImage);
        }
        const body: PhotoOrder[] = images;

        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при изменении заказа:', error);
                },
            }
        );
    };

    //Применить формат ко всем фото в корзине 
    const applyFormatAllPhotos = (format, orderId, order, selectPhoto) => {

        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }

        let images = [...order.images];

        const updatedArray: PhotoOrder[] = images.map((item) => {
            const products = [...(item.products ?? [])]; // ✅ всегда массив
            const labelExists = products.some((p) => p.label === format.format);

            if (!labelExists) {
                products.push({
                    product: format.id,
                    label: format.format,
                    quantity: 1,
                });
            }

            return { ...item, products };
        });

        const selectedPath = normalizePath(selectPhoto);

        if (!updatedArray.some((item) => normalizePath(item.image) === selectedPath)) {
            updatedArray.push({
                image: selectedPath,
                products: [
                    {
                        product: format.id,
                        label: format.format,
                        quantity: 1,
                    },
                ],
            });
        }

        const body: PhotoOrder[] = updatedArray;

        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при удалении фото из заказа:', error);
                },
            }
        );
    }



    //Удаляет товар у всех фото в заказе
    const removeFormatAllPhotos = (format: { id: string; format: string }, orderId: string, order) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }

        // Клонируем массив картинок и фильтруем продукты внутри каждой
        const updatedArray = order.images.map(item => {
            const filteredProducts = (item.products ?? []).filter(p => p.label !== format.format);
            return { ...item, products: filteredProducts };
        });


        // Отправляем запрос на бэкенд
        editPhoto(
            { photoOrder: updatedArray, id: orderId },
            {
                onSuccess: () => {
                    // Обновляем закешированные запросы
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (err) => {
                    console.error('Ошибка при удалении формата у всех фото:', err);
                },
            }
        );
    };

    //Добавить фото в корзину, если есть отмеченые форматы для всех выбранных фото
    const addPhotoByMarkedFormatsForAll = (formatForAll, orderId, order, selectPhoto) => {

        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }

        let images = [...order.images];

        const newProducts = formatForAll.map((format) => {
            return {
                product: format.id,
                label: format.label,
                quantity: 1,
            }
        })

        images.push({
            image: selectPhoto,
            products: newProducts,
        });

        editPhoto(
            { photoOrder: images, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении фото в заказ с отмеченными форматами:', error);
                },
            }
        );
    }


    //Удалить одно фото
    const handleDeletePhoto = (photo: string, orderId: string, order: {
        images: PhotoOrder[],





        number_photos_in_folders?: FolderStats[]
    }) => {
        const newImages = [...order.images];
        const index = newImages.findIndex(item => normalizePath(item.image) === photo);

        if (index !== -1) {
            newImages.splice(index, 1);

            // 2) Фильтруем папки по вхождению имени в любой оставшийся путь
            const existingFolders = order.number_photos_in_folders ?? [];
            const updatedFolders = existingFolders.filter(folderStat =>
                newImages.some(img =>
                    decodeURIComponent(img.image).includes(folderStat.folder_name)
                )
            );

            editPhoto(
                { photoOrder: newImages, id: orderId, number_photos_in_folders: updatedFolders },
                {
                    onSuccess: (data: any) => {
                        queryClient.invalidateQueries({ queryKey: ['order'] });
                        queryClient.invalidateQueries({ queryKey: ['orders'] });
                    },
                    onError: (error) => {
                        console.error('Ошибка при удалении фото:', error);
                    },
                }
            );
        }
    };

    //Добавить формат для одного фото 
    const addFormatOnePhoto = (format, orderId, order, selectPhoto) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно изменить заказ.');
            return;
        }
        let images = [...order.images];


        const updatedArray: PhotoOrder[] = images.map((item) => {
            const products = [...(item.products ?? [])];

            if (normalizePath(item.image) === selectPhoto) {
                products.push({
                    product: format.id,
                    label: format.name,
                    quantity: 1,
                });
            }

            return { ...item, products };
        });

        const body: PhotoOrder[] = updatedArray;

        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при удалении фото из заказа:', error);
                },
            }
        );
    }

    //Удалить продукт для одного фото
    const handleDeleteProduct = (targetPhoto: string, orderId: string, order: { images: PhotoOrder[] }, targetProduct: { product: string }) => {
        const images = [...order.images];
        const newImages = images.map(item => {
            if (normalizePath(item.image) === targetPhoto) {
                const filteredProducts = (item.products ?? []).filter(p => p.label !== targetProduct.product);
                return { ...item, products: filteredProducts };
            }
            return item;
        });

        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при удалении продукта:', error);
                },
            }
        );
    };

    //Изменить кол-во продукта для одного фото
    const handleEditQuantityProduct = (orderId: string, order, targetProduct, newQuantity) => {
        const images = [...order.images];

        const newImages = images.map(item => {
            if (normalizePath(item.image) === targetProduct.image) {
                return {
                    ...item,
                    products: (item.products ?? []).map(product => {
                        if (product.label === targetProduct.label) {
                            return { ...product, quantity: newQuantity };
                        }
                        return product;
                    })
                };
            }
            return item;
        });

        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при изменении кол-ва товара:', error);
                },
            }
        );
    };

    //Отметить товар в заказе как сделаный
    const handleCompletedProducts = (orderId: string, order, targetProduct) => {
        const images = [...order.images];

        const newImages = images.map(item => {
            if (normalizePath(item.image) === targetProduct.image) {
                return {
                    ...item,
                    products: (item.products ?? []).map(product => {
                        if (product.id === targetProduct.product.id) {
                            return { ...product, done: !targetProduct.product.done };
                        }
                        return product;
                    }),
                };
            }
            return item;
        });


        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при изменении кол-ва товара:', error);
                },
            }
        );
    };

    //Отметить все товары в заказе как сделаные
    const handleCompletedAllProducts = (orderId: string, order) => {
        const images = [...order.images];

        const newImages = images.map(item => {
            return {
                ...item,
                products: (item.products ?? []).map(product => {
                    return { ...product, done: true };
                }),
            };
        });


        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка. Все чекбоксы не отмечены:', error);
                },
            }
        );
    };

    //Добавить или убрать электронную рамку для фото
    const handleElectronicFrame = (orderId: string, order, targetProduct) => {
        const images = [...order.images];

        const newImages = images.map(item => {
            if (normalizePath(item.image) === targetProduct.image) {
                return {
                    ...item,
                    products: (item.products ?? []).map(product => {
                        if (product.id === targetProduct.product.id) {

                            return { ...product, electronic_frame: !targetProduct.product.electronic_frame };
                        }
                        return product;
                    }),
                };
            }
            return item;
        });


        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                },
                onError: (error) => {
                    console.error('Ошибка при изменении рамки товара товара:', error);
                },
            }
        );
    };

    return {
        handleDeletePhoto, editOrder, handleAddPhotoOrder, handleDeleteProduct,
        handleEditQuantityProduct, handleCompletedProducts, handleCompletedAllProducts,
        handleElectronicFrame, applyFormatAllPhotos, addPhotoByMarkedFormatsForAll,
        addFormatOnePhoto, handleAddAllPhotoOrder, removeFormatAllPhotos
    };

};