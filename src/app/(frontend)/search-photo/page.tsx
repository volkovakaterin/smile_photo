'use client'
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { stringify } from 'qs-esm'
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import styles from './style.module.scss';
import { Breadcrumbs } from '@/components/Client/BreadCrumbs/BreadCrumbs';
import { Folder } from '@/components/Client/Folder/Folder';
import { PhotoGallery, PhotoGalleryHandle } from '@/components/Client/PhotoGallery/PhotoGallery';
import Link from 'next/link';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import { TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';
import { TheModal } from '@/components/Client/TheModal/TheModal';
import { useOrderId } from '@/hooks/Order/useOrderId';
import { useShowModalGlobal } from '@/providers/ShowModal';
import { FolderPreview } from '@/components/Client/FolderPreview/FolderPreview';

interface Folder {
    name: string;
    path: string;
    id?: string;
    with_photo?: boolean;
    createdAt: Date;
}

interface Breadcrumb {
    name: string;
    path: string;
    id?: string;
    with_photo?: boolean;
}

const SearchPhoto = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [breadcrumbs, setBreadcrumb] = useState<Breadcrumb[]>([{
        name: 'Все папки',
        path: '',
    }]);
    const [hasImages, setHasImages] = useState(false);
    const [isLoadingFolder, setIsLoadingFolder] = useState(false);
    const { orderId, quantityProducts, mode, lastFolder, setLastFolder, directories, currentPath, setCurrentPath } = useOrder();
    const { order } = useOrderId(orderId);
    const { showModalGlobal, setShowModalGlobal } = useShowModalGlobal();
    const [photoInFolder, setPhotoInFolder] = useState(0);
    const [photoFromFolder, setPhotoFromFolder] = useState(0);
    const galleryRef = useRef<PhotoGalleryHandle>(null);
    const router = useRouter();

    const fetchFolders = async (currentPath) => {
        const limit = 1000000;
        setIsLoadingFolder(true);
        try {
            const query = {
                path: {
                    equals: currentPath,
                },
            }
            const stringifiedQuery = stringify(
                {
                    where: query,
                    limit,
                },
                { addQueryPrefix: true },
            )
            const response = await axios.get(`/api/folders${stringifiedQuery}`
            );

            //Сортировка папок      
            const docs = response.data.docs;
            docs.sort((a, b) => {
                // 1) по времени создания (число ms) — более новые первыми
                const delta = (b.fs_created_at ?? 0) - (a.fs_created_at ?? 0);
                if (delta !== 0) return delta;

                // 2) при совпадении дат — натурально по имени
                return a.name.localeCompare(b.name, 'ru', {
                    numeric: true,
                    sensitivity: 'base',
                });
            });

            setFolders(docs);
            setIsLoadingFolder(false);
        } catch (error) {
            console.error('Ошибка загрузки папок:', error);
            setIsLoadingFolder(false);
        }
    };

    const handleCountChange = (count: number) => {
        setPhotoInFolder(count)
    };

    // 2) Обработчик кнопки «Select All»
    const handleSelectAllClick = () => {
        if (galleryRef.current) {
            galleryRef.current.addAllPhotos();
        }
    };

    useEffect(() => {
        // последний элемент в lastFolder — это текущая папка
        const folder = lastFolder[lastFolder.length - 1];

        // собираем путь из всех имён, кроме первого ("Все папки")
        const pathSegments = lastFolder.slice(1).map(f => f.name);
        const newPath = pathSegments.join('/');

        setCurrentPath(newPath);
        setHasImages(Boolean(folder.with_photo));
        setBreadcrumb(lastFolder);
    }, [lastFolder]);

    useEffect(() => {
        if (!hasImages) {
            setPhotoInFolder(0)
        }
        fetchFolders(currentPath);
    }, [currentPath]);

    const handleFolderClick = (folder) => {
        // Обновляем текущий путь и хлебные крошки
        setLastFolder(prev => [...prev, folder]);
    };

    const handleBreadcrumbClick = (breadcrumb: Folder, index: number) => {
        // Обновляем текущий путь на выбранную папку
        setLastFolder(prev => prev.slice(0, index + 1));
    };

    const navigationBack = () => {
        if (lastFolder.length > 1) {
            setLastFolder(prev => prev.slice(0, prev.length - 1));
        }
    }

    const navigationExit = () => {
        if (orderId) {
            setShowModalGlobal(true);
        } else {
            router.push('/');
        }
    }

    useEffect(() => {
        if (!order) {
            setPhotoFromFolder(0);
            return;
        }
        const prefix = `${directories.photos}/${currentPath}`.replace(/\\/g, '/');
        const count = order.images.filter(({ image }) =>
            image.replace(/\\/g, '/').startsWith(prefix)
        ).length;
        setPhotoFromFolder(count);
    }, [order, directories.photos, currentPath]);


    return (
        <div>
            <NavigationBar basket={!!orderId} totalQuantity={quantityProducts} navigationBack={navigationBack}
                btnSelectAll={(mode !== 'with_formats' && hasImages) ? true : false}
                handleClick={(mode !== 'with_formats' && hasImages) ? handleSelectAllClick : undefined} btnExit={true}
                navigationExit={navigationExit} btnBack={breadcrumbs.length > 1 ? true : false} />
            <div className={styles.SearchPhoto}>
                <div className={styles.infoWrapper}>
                    <Breadcrumbs breadcrumbs={breadcrumbs} onClick={handleBreadcrumbClick} />
                    {photoInFolder > 0 && <div>Фото в папке {photoInFolder}/Выбрано {photoFromFolder}</div>}

                </div>

                {!hasImages ? (
                    <><h2 className={styles.title}>Выберите папку</h2><ul className={styles.wrapperFolders}>
                        {isLoadingFolder ? <div>Загрузка</div> : (folders.map((folder: Folder, index) => (
                            <FolderPreview key={`${folder.name}-${index}`}
                                hasImage={folder.with_photo} onClick={() => handleFolderClick(folder)}
                                name={folder.name} path={folder.path} directory={directories.photos} />
                        )))}
                    </ul></>
                ) : (<PhotoGallery folderPath={currentPath} ref={galleryRef} onImagesCountChange={handleCountChange} />)}
                {orderId && mode == TYPE_MODE.CREAT && (<Link href={'/basket'} className={styles.linkBasket}><ButtonSecondary text='Перейти в корзину' width={444} /></Link>)}
                {orderId && mode == TYPE_MODE.EDIT && (<Link href={'/edit-order'} className={styles.linkBasket}><ButtonSecondary text='Перейти к заказу' width={444} /></Link>)}
            </div>
        </div>
    );
};

export default SearchPhoto;
