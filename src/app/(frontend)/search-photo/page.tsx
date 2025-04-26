'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { stringify } from 'qs-esm'
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import styles from './style.module.scss';
import { Breadcrumbs } from '@/components/Client/BreadCrumbs/BreadCrumbs';
import { Folder } from '@/components/Client/Folder/Folder';
import { PhotoGallery } from '@/components/Client/PhotoGallery/PhotoGallery';
import Link from 'next/link';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import { TYPE_MODE, useOrder } from '@/providers/OrderProvider';
import { useRouter } from 'next/navigation';
import { TheModal } from '@/components/Client/TheModal/TheModal';

interface Folder {
    name: string;
    path: string;
    id?: string;
    with_photo?: boolean;
}

const SearchPhoto = () => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [currentFolder, setCurrentFolder] = useState<string | undefined>(undefined);
    const [breadcrumbs, setBreadcrumb] = useState<Folder[]>([{
        name: 'Все папки',
        path: '',
    }]);
    const [hasImages, setHasImages] = useState(false);
    const [isLoadingFolder, setIsLoadingFolder] = useState(false);
    const { orderId, quantityProducts, mode, lastFolder, setLastFolder, resetOrder } = useOrder();
    const [showModal, setShowModal] = useState(false);

    const router = useRouter();

    const fetchFolders = async (currentPath) => {
        console.log("currentPath from fetch", currentPath)
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
            console.log("response.data.docs", response.data.docs)
            setFolders(response.data.docs);
            setIsLoadingFolder(false);
        } catch (error) {
            console.error('Ошибка загрузки папок:', error);
            setIsLoadingFolder(false);
        }
    };

    // useEffect(() => {
    //     let folder;
    //     let index = 0;
    //     if (lastFolder.length > 1) {
    //         index = lastFolder.length - 1;
    //         folder = lastFolder[index];
    //     } else {
    //         folder = lastFolder[0];
    //     }
    //     setHasImages(Boolean(folder.with_photo))
    //     setCurrentFolder(folder.id);
    //     setCurrentPath(index > 1 ? `${folder.path}/${folder.name}` : (index === 1 ? folder.name : ''));
    //     setBreadcrumb(lastFolder)
    // }, []);
    useEffect(() => {
        // последний элемент в lastFolder — это текущая папка
        const folder = lastFolder[lastFolder.length - 1];

        // собираем путь из всех имён, кроме первого ("Все папки")
        const pathSegments = lastFolder.slice(1).map(f => f.name);
        const newPath = pathSegments.join('/');

        setCurrentPath(newPath);
        setHasImages(Boolean(folder.with_photo));
        setCurrentFolder(folder.id);
        setBreadcrumb(lastFolder);
    }, [lastFolder]);

    useEffect(() => {
        console.log("currentPath", currentPath)
        fetchFolders(currentPath);
    }, [currentPath]);

    const handleFolderClick = (folder) => {
        // Обновляем текущий путь и хлебные крошки
        setLastFolder(prev => [...prev, folder]);
        // setHasImages(folder.with_photo)
        // setCurrentFolder(folder.id);
        // const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
        // setCurrentPath(newPath);
        // setBreadcrumb((prev) => [...prev, folder]);
        // setLastFolder((prev) => [...prev, folder]);
    };

    const handleBreadcrumbClick = (breadcrumb: Folder, index: number) => {
        // Обновляем текущий путь на выбранную папку
        setLastFolder(prev => prev.slice(0, index + 1));
        // if (breadcrumb.id !== currentFolder) {
        //     setHasImages(Boolean(breadcrumb.with_photo))
        //     setCurrentFolder(breadcrumb.id);
        //     setCurrentPath(index > 1 ? `${breadcrumb.path}/${breadcrumb.name}` : (index === 1 ? breadcrumb.name : ''));
        //     setBreadcrumb((prev) => prev.slice(0, index + 1));
        //     setLastFolder((prev) => prev.slice(0, index + 1));
        // }
    };

    const navigationBack = () => {
        // if (breadcrumbs.length > 1) {
        //     const newFolder = breadcrumbs[breadcrumbs.length - 2]
        //     setHasImages(Boolean(newFolder.with_photo));
        //     setCurrentFolder(newFolder.id);
        //     setCurrentPath((prev) => breadcrumbs.length > 2 ? prev.replace(/\/[^/]*$/, '') : '');
        //     setBreadcrumb((prev) => prev.slice(0, breadcrumbs.length - 1));
        //     setLastFolder((prev) => prev.slice(0, breadcrumbs.length - 1));
        // }
        if (lastFolder.length > 1) {
            setLastFolder(prev => prev.slice(0, prev.length - 1));
        }
    }

    const navigationExit = () => {
        if (orderId) {
            setShowModal(true);
        } else {
            router.push('/');
        }
    }

    return (
        <div>
            <NavigationBar basket={!!orderId} totalQuantity={quantityProducts} navigationBack={navigationBack}
                btnExit={true} navigationExit={navigationExit} btnBack={breadcrumbs.length > 1 ? true : false} />
            <div className={styles.SearchPhoto}>
                <Breadcrumbs breadcrumbs={breadcrumbs} onClick={handleBreadcrumbClick} />
                {!hasImages ? (
                    <><h2 className={styles.title}>Выберите папку</h2><ul className={styles.wrapperFolders}>
                        {isLoadingFolder ? <div>Загрузка</div> : (folders.map((folder: Folder, index) => (
                            <Folder key={`${folder.name}-${index}`} onClick={() => handleFolderClick(folder)} name={folder.name}>
                            </Folder>
                        )))}
                    </ul></>
                ) : (<PhotoGallery folderPath={currentPath} />)}
                {orderId && mode == TYPE_MODE.CREAT && (<Link href={'/basket'} className={styles.linkBasket}><ButtonSecondary text='Перейти в корзину' width={444} /></Link>)}
                {orderId && mode == TYPE_MODE.EDIT && (<Link href={'/edit-order'} className={styles.linkBasket}><ButtonSecondary text='Перейти к заказу' width={444} /></Link>)}
            </div>
            {showModal && (
                <TheModal open={showModal} handleClose={() => setShowModal(false)} width={800}>
                    <h3 style={{ marginTop: '50px', textAlign: 'center' }}>
                        {mode == TYPE_MODE.CREAT ? `Хотите продолжить оформление заказа?` : `Хотите продолжить редактирование заказа?`}
                    </h3>
                    <div
                        style={{
                            display: 'flex',
                            gap: '50px',
                            alignItems: 'center',
                            marginTop: '50px',
                            justifyContent: 'center',
                        }}
                    >
                        <ButtonSecondary text="Продолжить" onClick={() => setShowModal(false)} />
                        <ButtonSecondary
                            text="Вернуться в главное меню"
                            onClick={() => {
                                resetOrder();
                                setShowModal(false);
                                router.push(`/`)
                            }}
                        />
                    </div>
                </TheModal>
            )}
        </div>
    );
};

export default SearchPhoto;
