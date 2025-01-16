'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { stringify } from 'qs-esm';
import { ButtonSecondary } from '@/components/Client/UI/ButtonSecondary/ButtonSecondary';
import styles from './style.module.scss';
import { Breadcrumbs } from '@/components/Client/BreadCrumbs/BreadCrumbs';
import { Folder } from '@/components/Client/Folder/Folder';
import { PhotoGallery } from '@/components/Client/PhotoGallery/PhotoGallery';
import Link from 'next/link';
import { NavigationBar } from '@/components/Client/NavigationBar/NavigationBar';
import { TYPE_MODE, useOrder } from '@/providers/OrderProvider';
const SearchPhoto = () => {
    const [folders, setFolders] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [currentFolder, setCurrentFolder] = useState(undefined);
    const [breadcrumbs, setBreadcrumb] = useState([{
            name: 'Все папки',
            path: '',
        }]);
    const [hasImages, setHasImages] = useState(false);
    const [isLoadingFolder, setIsLoadingFolder] = useState(false);
    const { orderId, quantityProducts, mode, directories } = useOrder();
    useEffect(() => {
        // Загружаем папки для текущего пути
        const fetchFolders = async () => {
            const limit = 1000000;
            setIsLoadingFolder(true);
            try {
                const query = {
                    path: {
                        equals: currentPath,
                    },
                };
                const stringifiedQuery = stringify({
                    where: query,
                    limit,
                }, { addQueryPrefix: true });
                const response = await axios.get(`/api/folders${stringifiedQuery}`);
                setFolders(response.data.docs);
                setIsLoadingFolder(false);
            }
            catch (error) {
                console.error('Ошибка загрузки папок:', error);
                setIsLoadingFolder(false);
            }
        };
        fetchFolders();
    }, [currentPath]);
    const checkImagesInFolder = async (folderPath) => {
        const photosDirectory = directories.photos;
        try {
            const response = await axios.get('/api/check-images', {
                params: {
                    folderPath,
                    photosDirectory,
                }
            });
            if (response.data.hasImages) {
                setHasImages(true);
            }
            else {
                setHasImages(false);
            }
        }
        catch (error) {
            console.error('Ошибка при проверке изображений:', error);
        }
    };
    const handleFolderClick = (folder) => {
        // Обновляем текущий путь и хлебные крошки
        const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
        setCurrentFolder(folder.id);
        setCurrentPath((prev) => (prev ? `${prev}/${folder.name}` : folder.name));
        setBreadcrumb((prev) => [...prev, folder]);
        checkImagesInFolder(newPath);
    };
    const handleBreadcrumbClick = (breadcrumb, index) => {
        // Обновляем текущий путь на выбранную папку
        if (breadcrumb.id !== currentFolder) {
            setHasImages(false);
            setCurrentFolder(breadcrumb.id);
            setCurrentPath(index > 1 ? `${breadcrumb.path}/${breadcrumb.name}` : (index === 1 ? breadcrumb.name : ''));
            setBreadcrumb((prev) => prev.slice(0, index + 1));
        }
    };
    return (<div>
            <NavigationBar basket={!!orderId} totalQuantity={quantityProducts}/>
            <div className={styles.SearchPhoto}>
                <Breadcrumbs breadcrumbs={breadcrumbs} onClick={handleBreadcrumbClick}/>
                {!hasImages && (<><h2 className={styles.title}>Выберите папку</h2><ul className={styles.wrapperFolders}>
                        {isLoadingFolder ? <div>Загрузка</div> : (folders.map((folder, index) => (<Folder key={`${folder.name}-${index}`} onClick={() => handleFolderClick(folder)} name={folder.name}>
                            </Folder>)))}
                    </ul></>)}
                {hasImages && (<PhotoGallery folderPath={currentPath}/>)}
                {orderId && mode == TYPE_MODE.CREAT && (<Link href={'/basket'} className={styles.linkBasket}><ButtonSecondary text='Перейти в корзину' width={444}/></Link>)}
                {orderId && mode == TYPE_MODE.EDIT && (<Link href={'/edit-order'} className={styles.linkBasket}><ButtonSecondary text='Перейти к заказу' width={444}/></Link>)}
            </div>
        </div>);
};
export default SearchPhoto;
//# sourceMappingURL=page.jsx.map