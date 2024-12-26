
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

export interface PhotoOrder {
    image: string,
    products: { product: string, quantity: number, label: string }[],
}

const url = process.env.NEXT_PUBLIC_SERVER_URL;

export const editPhotoOrder = async (data: { photoOrder: PhotoOrder[], id: string }): Promise<Response> => {
    const response = await axios.patch<Response>(`${url}/api/orders/${data.id}`, { images: data.photoOrder });
    return response.data;
};

export function useEditPhotoToOrder() {
    const { mutate, isPending, isError, isSuccess } = useMutation<Response, Error, { photoOrder: PhotoOrder[]; id: string }>({
        mutationKey: ['add photo to order'],
        mutationFn: editPhotoOrder,
    });

    return { mutate, isPending, isError, isSuccess }
}

export const useEditOrder = () => {
    const { mutate: editPhoto } = useEditPhotoToOrder();
    const queryClient = useQueryClient();


    //Добавить только фото без форматов
    const handleAddPhotoOrder = (orderId, selectPhoto, order?) => {
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно добавить фото.');
            return;
        }

        if (!selectPhoto) {
            console.error('Фото не выбрано. Невозможно добавить фото.');
            return;
        }

        const newImage = { image: selectPhoto };

        const body: PhotoOrder[] = order
            ? [...order.images, newImage]
            : [newImage];

        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении фото в заказ:', error);
                },
            }
        );

    }

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
            images = images.filter(item => item.image !== selectPhoto);

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

        const existingIndex = images.findIndex(item => item.image === selectPhoto);

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

        const updatedArray = images.map((item) => {
            const labelExists = item.products.some((product) => product.label === format.format);
            if (!labelExists) {
                item.products.push({
                    product: format.id,
                    label: format.format,
                    quantity: 1,
                });
            }

            return item;
        });

        if (!images.some(item => item.image == selectPhoto)) {
            updatedArray.push({
                image: selectPhoto,
                products: [{
                    product: format.id,
                    label: format.format,
                    quantity: 1,
                }]
            });
        }

        const body: PhotoOrder[] = updatedArray;

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
    }

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
    const handleDeletePhoto = (photo: string, orderId: string, order: { images: PhotoOrder[] }) => {
        const newImages = [...order.images];
        const index = newImages.findIndex(item => item.image === photo);

        if (index !== -1) {
            newImages.splice(index, 1);
            editPhoto(
                { photoOrder: newImages, id: orderId },
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

        const updatedArray = images.map((item) => {
            const imageExists = item.image == selectPhoto;
            if (imageExists) {
                item.products.push({
                    product: format.id,
                    label: format.name,
                    quantity: 1,
                });
            }

            return item;
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
        const newImages = images
            .map(item => {
                if (item.image === targetPhoto) {
                    const filteredProducts = item.products.filter(product => product.label !== targetProduct.product);
                    return {
                        ...item,
                        products: filteredProducts,
                    };
                }
                return item;
            })

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
            if (item.image === targetProduct.image) {
                return {
                    ...item,
                    products: item.products.map(product => {
                        if (product.label === targetProduct.label) {
                            return { ...product, quantity: newQuantity };
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
            if (item.image === targetProduct.image) {
                return {
                    ...item,
                    products: item.products.map(product => {
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
                products: item.products.map(product => {
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
            if (item.image === targetProduct.image) {
                return {
                    ...item,
                    products: item.products.map(product => {
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
        handleElectronicFrame, applyFormatAllPhotos, addPhotoByMarkedFormatsForAll, addFormatOnePhoto
    };

};