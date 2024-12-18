
import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from "@tanstack/react-query";
import axios from 'axios';

export interface PhotoOrder {
    image: string,
    products: { product: string, quantity: number, label: string }[],
}

export const editPhotoOrder = async (data: { photoOrder: PhotoOrder[], id: string }): Promise<Response> => {
    const response = await axios.patch<Response>(`http://localhost:3000/api/orders/${data.id}`, { images: data.photoOrder });
    console.log(response.data);
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


    //Добавить новое фото 
    const handleAddPhotoOrder = (productsWithPhoto: FormData, orderId, selectPhoto, order) => {
        console.log(productsWithPhoto, orderId, selectPhoto, order)
        if (!orderId) {
            console.error('Заказ не открыт. Невозможно добавить фото.');
            return;
        }

        if (!selectPhoto) {
            console.error('Фото не выбрано. Невозможно добавить фото.');
            return;
        }
        console.log(productsWithPhoto)
        const result = Object.entries(productsWithPhoto)
            .filter(([_, value]) => value?.select)
            .map(([key, value]) => ({ product: key, quantity: value.quantity, label: value.name }));
        console.log(order)

        if (!result.length) {
            console.error('Товар не выбран. Невозможно добавить фото.');
            return
        }

        const newImage = { image: selectPhoto, products: result };

        const body: PhotoOrder[] = order
            ? [...order.images, newImage]
            : [newImage];


        console.log(body)

        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    console.log('Фото успешно добавлено в заказ:', data);
                    console.log(orderId)
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
        console.log(productsWithPhoto, orderId, selectPhoto, order);

        if (!orderId) {
            console.error('Заказ не открыт. Невозможно добавить фото.');
            return;
        }

        // Формируем массив товаров, которые были выбраны
        const result = Object.entries(productsWithPhoto)
            .filter(([_, value]) => value?.select)
            .map(([key, value]) => ({ product: key, quantity: value.quantity, label: value.name }));

        // Копируем текущие изображения заказа
        let images = [...order.images];

        if (!result.length) {
            // Удаляем selectPhoto из images, если result пустой
            images = images.filter(item => item.image !== selectPhoto);

            // Формируем итоговый массив
            const body: PhotoOrder[] = images;

            console.log('Фото удалено из заказа:', body);

            // Отправляем обновленный заказ
            editPhoto(
                { photoOrder: body, id: orderId },
                {
                    onSuccess: (data: any) => {
                        console.log('Фото успешно удалено из заказа:', data);
                        queryClient.invalidateQueries({ queryKey: ['order'] });
                    },
                    onError: (error) => {
                        console.error('Ошибка при удалении фото из заказа:', error);
                    },
                }
            );
            return;
        }

        // Проверяем наличие selectPhoto в массиве images
        const existingIndex = images.findIndex(item => item.image === selectPhoto);

        if (existingIndex !== -1) {
            // Если selectPhoto уже есть, заменяем products
            images[existingIndex] = { ...images[existingIndex], products: result };
        } else {
            // Если selectPhoto не найдено, добавляем новый объект
            const newImage = { image: selectPhoto, products: result };
            images.push(newImage);
        }

        // Формируем итоговый массив
        const body: PhotoOrder[] = images;

        console.log(body);

        // Отправляем обновленный заказ
        editPhoto(
            { photoOrder: body, id: orderId },
            {
                onSuccess: (data: any) => {
                    console.log('Фото успешно добавлено в заказ:', data);
                    console.log(orderId);
                    queryClient.invalidateQueries({ queryKey: ['order'] });
                },
                onError: (error) => {
                    console.error('Ошибка при добавлении фото в заказ:', error);
                },
            }
        );
    };


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
                        console.log('Фото успешно удалено:', data);
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

    //Удалить продукт для одного фото
    const handleDeleteProduct = (targetPhoto: string, orderId: string, order: { images: PhotoOrder[] }, targetProduct: { product: string }) => {
        const images = [...order.images];
        console.log(targetProduct,)
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
            .filter(item => item.products.length > 0);



        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    console.log('продукт успешно удален:', data);
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

        console.log(newQuantity, targetProduct);

        const newImages = images.map(item => {
            if (item.image === targetProduct.image) {
                console.log('фото найдено')
                return {
                    ...item,
                    products: item.products.map(product => {
                        console.log(product.label, targetProduct.label)
                        if (product.label === targetProduct.label) {
                            //console.log(product.label, targetProduct.product.label)
                            console.log('продукт найдено')
                            return { ...product, quantity: newQuantity };
                        }
                        return product;
                    }),
                };
            }
            return item;
        });

        console.log(newImages)


        editPhoto(
            { photoOrder: newImages, id: orderId },
            {
                onSuccess: (data: any) => {
                    console.log('Кол-во изменено успешно:', data);
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
        console.log(targetProduct)

        const newImages = images.map(item => {
            if (item.image === targetProduct.image) {
                return {
                    ...item,
                    products: item.products.map(product => {
                        if (product.id === targetProduct.product.id) {
                            console.log('cjdgfkj')
                            return { ...product, done: !targetProduct.product.done };
                        }
                        return product;
                    }),
                };
            }
            return item;
        });

        console.log(newImages)


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

        console.log(newImages)


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
        console.log(targetProduct)

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

        console.log(newImages)


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
        handleElectronicFrame
    };

};