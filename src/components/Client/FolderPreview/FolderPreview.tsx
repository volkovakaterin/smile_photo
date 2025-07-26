import styles from './FolderPreview.module.scss';
import Image from 'next/image';
import Front from '@/assets/icons/folder_front.png';
import Back from '@/assets/icons/folder_back.png';
import { useEffect, useState } from 'react';
import { fetchImages } from '@/requests/fetchImages';

interface FolderPreviewProps {
    name: string;
    onClick: () => void;
    order?: string;
    hasImage?: boolean;
    path: string,
    directory: string
}

const normalizePath = (p) => p.replace(/\\/g, '/');

export function FolderPreview({ name, onClick, hasImage, path, directory }: FolderPreviewProps) {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    useEffect(() => {
        if (!hasImage) {
            setThumbnails([]);
            return;
        }
        (async () => {
            try {
                const imgs: string[] = await fetchImages({
                    folderPath: `${path}/${name}`,
                    limit: 2,
                    directory,
                });
                setThumbnails(imgs);
            } catch (err) {
                console.error('Ошибка при загрузке превьюшек:', err);
            }
        })();
    }, [hasImage, name, path])

    return (
        <div className={styles.folderWrapper} onClick={onClick}>
            <div className={styles.folder}>
                <div className={styles.backWrapper} >
                    <Image className={styles.backImage} src={Back} alt={''}></Image>
                </div>
                {hasImage && thumbnails.length > 0 &&
                    (<div className={styles.thumbs}>
                        {thumbnails.map((src, i) => (
                            // <div key={i} className={`${styles.thumb} ${styles[`thumb-${i}`]}`}></div>

                            <Image key={i} src={`/api/dynamic-thumbnail?img=${normalizePath(src)}`} alt={''} fill className={`${styles.thumb} ${styles[`thumb-${i}`]}`}></Image>
                        ))}
                    </div>)}
                <div className={styles.frontWrapper} >
                    <Image className={styles.frontImage} src={Front} alt={''}></Image>
                </div>
            </div>
            <div className={styles.label}>{name}</div>
        </div>
    );
}