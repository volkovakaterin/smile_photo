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
import { useShowModalGlobal } from '@/providers/ShowModal';

interface Folder {
    name: string;
    path: string;
    id?: string;
    with_photo?: boolean;
}

const SearchPhoto = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [breadcrumbs, setBreadcrumb] = useState<Folder[]>([{
        name: 'Все папки',
        path: '',
    }]);
    const [hasImages, setHasImages] = useState(false);
    const [isLoadingFolder, setIsLoadingFolder] = useState(false);
    const { orderId, quantityProducts, mode, lastFolder, setLastFolder, resetOrder, currentPath, setCurrentPath } = useOrder();
    const { showModalGlobal, setShowModalGlobal } = useShowModalGlobal();
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
            setFolders(response.data.docs);
            setIsLoadingFolder(false);
        } catch (error) {
            console.error('Ошибка загрузки папок:', error);
            setIsLoadingFolder(false);
        }
    };

    // 2) Обработчик кнопки «Select All»
    const handleSelectAllClick = () => {
        if (galleryRef.current) {
            galleryRef.current.addAllPhotos();
        }
    };

    useEffect(() => {
        // последний элемент в lastFolder — это текущая папка
        console.log(lastFolder)
        const folder = lastFolder[lastFolder.length - 1];

        // собираем путь из всех имён, кроме первого ("Все папки")
        const pathSegments = lastFolder.slice(1).map(f => f.name);
        const newPath = pathSegments.join('/');

        setCurrentPath(newPath);
        setHasImages(Boolean(folder.with_photo));
        setBreadcrumb(lastFolder);
    }, [lastFolder]);

    useEffect(() => {
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

    return (
        <div>
            <NavigationBar basket={!!orderId} totalQuantity={quantityProducts} navigationBack={navigationBack}
                btnSelectAll={(mode !== 'with_formats' && hasImages) ? true : false}
                handleClick={(mode !== 'with_formats' && hasImages) ? handleSelectAllClick : undefined} btnExit={true}
                navigationExit={navigationExit} btnBack={breadcrumbs.length > 1 ? true : false} />
            <div className={styles.SearchPhoto}>
                <Breadcrumbs breadcrumbs={breadcrumbs} onClick={handleBreadcrumbClick} />
                {!hasImages ? (
                    <><h2 className={styles.title}>Выберите папку</h2><ul className={styles.wrapperFolders}>
                        {isLoadingFolder ? <div>Загрузка</div> : (folders.map((folder: Folder, index) => (
                            <Folder key={`${folder.name}-${index}`} onClick={() => handleFolderClick(folder)} name={folder.name}>
                            </Folder>
                        )))}
                    </ul></>
                ) : (<PhotoGallery folderPath={currentPath} ref={galleryRef} />)}
                {orderId && mode == TYPE_MODE.CREAT && (<Link href={'/basket'} className={styles.linkBasket}><ButtonSecondary text='Перейти в корзину' width={444} /></Link>)}
                {orderId && mode == TYPE_MODE.EDIT && (<Link href={'/edit-order'} className={styles.linkBasket}><ButtonSecondary text='Перейти к заказу' width={444} /></Link>)}
            </div>
        </div>
    );
};

export default SearchPhoto;
