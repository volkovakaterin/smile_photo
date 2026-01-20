import styles from './FolderPreview.module.scss';
import Image from 'next/image';
import Front from '@/assets/icons/folder_front.png';
import Back from '@/assets/icons/folder_back.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchImages } from '@/requests/fetchImages';

interface FolderPreviewProps {
    name: string;
    onClick: () => void;
    order?: string;
    hasImage?: boolean;
    path: string;
    directory: string;
}

type ThumbItem = { path: string; mtimeMs: number };

const normalizePath = (p: unknown) => String(p ?? '').replace(/\\/g, '/');

function joinUrlPath(a: string, b: string) {
    const A = normalizePath(a).replace(/\/+$/g, '');
    const B = normalizePath(b).replace(/^\/+/g, '');
    return A ? `${A}/${B}` : B;
}

export function FolderPreview({ name, onClick, hasImage, path, directory }: FolderPreviewProps) {
    const [thumbnails, setThumbnails] = useState<ThumbItem[]>([]);

    const folderPath = useMemo(() => joinUrlPath(path, name), [path, name]);

    useEffect(() => {
        let cancelled = false;

        if (!hasImage) {
            setThumbnails([]);
            return;
        }

        (async () => {
            try {
                const imgs = await fetchImages({
                    folderPath,
                    limit: 2,
                    directory,
                });

                const normalized: ThumbItem[] = (Array.isArray(imgs) ? imgs : []).map((it: any) => {
                    if (typeof it === 'string') {
                        return { path: it, mtimeMs: 0 };
                    }
                    return {
                        path: normalizePath(it?.path),
                        mtimeMs: Number(it?.mtimeMs) || 0,
                    };
                });

                if (!cancelled) setThumbnails(normalized);
            } catch (err) {
                console.error('Ошибка при загрузке превью:', err);
                if (!cancelled) setThumbnails([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [hasImage, folderPath, directory]);

    // размеры превью 
    const w = 200;
    const h = 200;

    return (
        <div className={styles.folderWrapper} onClick={onClick}>
            <div className={styles.folder}>
                <div className={styles.backWrapper}>
                    <Image className={styles.backImage} src={Back} alt="" />
                </div>

                {hasImage && thumbnails.length > 0 && (
                    <div className={styles.thumbs}>
                        {thumbnails.map((t, i) => {
                            const imgPath = normalizePath(t.path);
                            const ver = t.mtimeMs ? `&ver=${t.mtimeMs}` : '';

                            const src =
                                `/api/dynamic-thumbnail?img=${encodeURIComponent(imgPath)}&width=${w}&height=${h}` + ver;

                            return (
                                <Image
                                    key={`${imgPath}-${t.mtimeMs}-${i}`}
                                    unoptimized
                                    src={src}
                                    alt=""
                                    fill
                                    className={`${styles.thumb} ${styles[`thumb-${i}`]}`}
                                />
                            );
                        })}
                    </div>
                )}

                <div className={styles.frontWrapper}>
                    <Image className={styles.frontImage} src={Front} alt="" />
                </div>
            </div>

            <div className={styles.label}>{name}</div>
        </div>
    );
}
