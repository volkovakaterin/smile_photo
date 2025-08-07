'use client'

import React, { useState, memo, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Collapse, IconButton, Select, MenuItem, Button, Checkbox, TextField } from "@mui/material";
import { ExpandLess, ExpandMore, Delete, BorderColor, Save, CloudDownload, ContentCopy } from "@mui/icons-material";
import { useStatusChangeOrder } from "@/hooks/Order/useChangeStatusOrder";
import { useDeleteOrder } from "@/hooks/Order/useDeleteOrder";
import Image from 'next/image';
import styles from './OrdersTable.module.scss';
import { useEditOrder } from "@/hooks/Order/useEditPhoto";
import path from 'path';
import { useOrder } from "@/providers/OrderProvider";
import { downloadArchive } from "./services/downloadArchive";
import { SelectProducts } from "../SelectProducts/SelectProducts";
import { useProducts } from "@/hooks/Products/useGetProducts";
import { useEditCommentOrder } from "@/hooks/Order/useEditCommentOrder";


const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`);
const normalizedPath = (p: string) => (p.replace(/\\/g, '/'));

export type Product = {
    id: string;
    product: string;
    quantity: number;
    label: string;
    done: boolean;
    electronic_frame: boolean;
};

type Image = {
    id: string;
    image: string;
    products: Product[];
};

type Order = {
    id: string;
    status: string;
    tel_number: string;
    createdAt: string;
    updatedAt: string;
    images: Image[];
    comment: string;
    folder_name: string;
    number_photos_in_folders: { folder_name: string, number_photos: number }[],
};

type OrdersTableProps = {
    orders: Order[];
    ordersTotal: number;
};

const OrdersTable: React.FC<OrdersTableProps> = memo(({ orders }) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const { mutate: deleteOrder } = useDeleteOrder();
    const { mutate: editComment } = useEditCommentOrder();
    const { handleDeletePhoto, handleDeleteProduct, handleEditQuantityProduct,
        handleElectronicFrame, addFormatOnePhoto,
        applyFormatAllPhotos, removeFormatAllPhotos } = useEditOrder();
    const [editingProduct, setEditingProduct] = useState<{ id: string; quantity: number | string, label: string } | null>(null);
    const { directories } = useOrder();
    const { products } = useProducts();
    const [comments, setComments] = useState<Record<string, string>>(() =>
        Object.fromEntries(orders.map(o => [o.id, o.comment || ""]))
    );
    const [expandedComments, setExpandedComments] = useState<string[]>([]);

    const toggleComment = (orderId: string) => {
        setExpandedComments(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleCommentChange = (orderId: string, text: string) => {
        setComments(prev => ({ ...prev, [orderId]: text }));
    };

    const handleCommentSave = (orderId: string) => {
        const text = comments[orderId];
        editComment({ id: orderId, comment: text }, {
            onError: err => console.error(err),
        });
        setExpandedComments(prev => prev.filter(id => id !== orderId));
    };

    const handleDownloadProduct = (order) => {
        downloadArchive(order, directories, products.docs);
    }

    const toggleRow = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const startEditing = (product: Product) => {
        setEditingProduct({ label: product.label, quantity: product.quantity, id: product.id });
    };

    const saveQuantity = (image: string, orderId: string, order, product: Product) => {
        if (editingProduct) {
            if (typeof editingProduct.quantity == 'number' && editingProduct.quantity > 0) {
                handleEditQuantityProduct(orderId, order, { image: image, label: product.label, quantity: product.quantity }, editingProduct.quantity);
            }
            setEditingProduct(null);
        }
    };

    const toggleFrame = (orderId, order, product: Product, image) => {
        handleElectronicFrame(orderId, order, { product, image })
    };

    const changeStatus = (value, order) => {
        handleChangeStatusOrder(value, order.id);
    };

    const handleSelectionChange = (selectedProducts: { name: string; id: string | undefined }, orderId, order, selectPhoto) => {
        addFormatOnePhoto(selectedProducts, orderId, order, selectPhoto)
    };

    return (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{ width: '150px' }}>Номер телефона/<br />
                            Имя папки</TableCell>
                        <TableCell style={{ width: '160px' }}>Статус</TableCell>
                        <TableCell style={{ width: '90px' }}>Кол-во фото</TableCell>
                        <TableCell style={{ width: '300px' }}>Комментарий</TableCell>
                        <TableCell >Создан</TableCell>
                        <TableCell >Редактирован</TableCell>
                        <TableCell >Детали</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => {
                        const isExpanded = expandedComments.includes(order.id);
                        const raw = comments[order.id] || "";
                        let photosInFolder = 0;
                        {
                            if (order.number_photos_in_folders) {
                                photosInFolder = order.number_photos_in_folders.reduce(
                                    (sum, item) => sum + item.number_photos,
                                    0
                                );
                            }
                        }

                        return (
                            <React.Fragment key={order.id}>
                                <TableRow style={{
                                    backgroundColor: order.status === 'open'
                                        ? '#FADEE6'
                                        : order.status === 'created'
                                            ? '#e3f1da'
                                            : order.status === 'paid'
                                                ? '#fff1cd'
                                                : order.status === 'closed'
                                                    ? '#d9e0ed'
                                                    : undefined
                                }}>
                                    <TableCell style={{ width: '150px' }}>{order.tel_number}{order.folder_name}</TableCell>
                                    <TableCell style={{ width: '160px' }}>
                                        <Select
                                            value={order.status}
                                            onChange={(e) => changeStatus(e.target.value, order)}
                                            size="small"
                                        >
                                            <MenuItem value="open">Открыт</MenuItem>
                                            <MenuItem value="created">Подтвержден</MenuItem>
                                            <MenuItem value="closed">Закрыт</MenuItem>
                                            <MenuItem value="paid">Оплачен</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell style={{ width: '90px' }}> {photosInFolder !== 0
                                        ? `${photosInFolder}/${order.images.length}`
                                        : order.images.length
                                    }</TableCell>

                                    {/* === Ячейка «Комментарий» === */}
                                    <TableCell style={{ width: '300px' }}>
                                        {isExpanded ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                                <TextField
                                                    multiline
                                                    autoFocus
                                                    fullWidth
                                                    minRows={2}
                                                    variant="outlined"
                                                    size="small"
                                                    value={raw}
                                                    onChange={e => handleCommentChange(order.id, e.target.value)}
                                                    onBlur={() => handleCommentSave(order.id)}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            padding: 0,

                                                        },
                                                        '& .MuiOutlinedInput-input': {
                                                            fontSize: '0.875rem !important',
                                                            lineHeight: '1.43 !important',
                                                            color: 'black',
                                                        },
                                                    }}
                                                />
                                                <IconButton size="small" onClick={() => handleCommentSave(order.id)}>
                                                    <Save fontSize="small" />
                                                </IconButton>
                                            </div>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                onClick={() => toggleComment(order.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: raw ? 'inherit' : '#999',
                                                    whiteSpace: 'pre-line',
                                                    overflowWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    width: '300px',
                                                    maxWidth: '300px',
                                                    display: 'block',
                                                }}
                                            >
                                                {raw || "Добавить…"}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                    <TableCell >{new Date(order.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell >
                                        <IconButton onClick={() => toggleRow(order.id)}>
                                            {expandedRows.includes(order.id) ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => deleteOrder(order.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="info"
                                            onClick={() => {
                                                handleDownloadProduct(order)
                                            }}
                                        >
                                            <CloudDownload />

                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={6} style={{ padding: 0 }}>
                                        <Collapse in={expandedRows.includes(order.id)} timeout="auto" unmountOnExit
                                            className={styles.wrapperPhotos}>
                                            <Typography variant="h6" sx={{ margin: 2, fontWeight: 600 }}>
                                                Состав заказа
                                            </Typography>
                                            <TableContainer component={Paper} className={styles.tableOrder}>
                                                <Table>
                                                    <TableBody>
                                                        {order.images.map((image) => (
                                                            <React.Fragment key={image.id}>
                                                                <TableRow className={styles.row}>
                                                                    <TableCell>
                                                                        <div className={styles.wrapperPhotoCard}>
                                                                            <Typography>
                                                                                <strong>Фото:</strong>
                                                                                <Image
                                                                                    quality={30}
                                                                                    src={`/api/dynamic-thumbnail?img=${image.image}`}
                                                                                    alt={'photo'} width={212}
                                                                                    height={114}
                                                                                    className={styles.image} />
                                                                                <span className={styles.photoName}>{path.basename(normalizedPath(decodeURIComponent(image.image)))}</span>
                                                                            </Typography>
                                                                            <Button
                                                                                variant="outlined"
                                                                                color="error"
                                                                                size="small"
                                                                                startIcon={<Delete className={styles.icon} />}
                                                                                onClick={() => handleDeletePhoto(image.image, order.id, order)}
                                                                                style={{ marginTop: "10px", fontSize: '12px', padding: "1px 5px", width: '212px' }}
                                                                            >Удалить фото
                                                                            </Button>
                                                                        </div>
                                                                        {products && <SelectProducts products={products.docs} selectProducts={image.products}
                                                                            onSelectionChange={(format) => handleSelectionChange(format, order.id, order, image.image)} />}
                                                                    </TableCell>
                                                                    {image.products.length ?
                                                                        <>
                                                                            <TableCell>
                                                                                <div className={styles.wrapperProducts}>
                                                                                    <Typography>
                                                                                        <strong>Товары:</strong>
                                                                                    </Typography>
                                                                                    <ul className={styles.product}>
                                                                                        {image.products.filter((product) => product.id).map((product) => (
                                                                                            <li key={product.id} className={styles.itemList}>
                                                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                                    <span>{product.label}</span>
                                                                                                </div>

                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className={styles.wrapperProducts}>
                                                                                    <Typography>
                                                                                        <strong>Применить ко всем:</strong>
                                                                                    </Typography>
                                                                                    <ul className={styles.forAll}>
                                                                                        {image.products.filter((product) => product.id).map((product) => (
                                                                                            <li key={product.id} className={styles.itemList}>
                                                                                                <Button
                                                                                                    variant="outlined"
                                                                                                    color="primary"
                                                                                                    size="small"
                                                                                                    startIcon={<ContentCopy />}
                                                                                                    onClick={() => applyFormatAllPhotos({ id: product.product, format: product.label },
                                                                                                        order.id, order, image.image)}
                                                                                                    sx={{
                                                                                                        minWidth: "auto",
                                                                                                        fontSize: '12px',
                                                                                                        padding: "2px 6px",
                                                                                                        "& .MuiButton-startIcon": { margin: 0 },
                                                                                                    }}
                                                                                                >
                                                                                                </Button>
                                                                                                <Button
                                                                                                    variant="outlined"
                                                                                                    color="error"
                                                                                                    size="small"
                                                                                                    startIcon={<Delete />}
                                                                                                    onClick={() => removeFormatAllPhotos({ id: product.product, format: product.label },
                                                                                                        order.id, order)}
                                                                                                    sx={{
                                                                                                        minWidth: "auto",
                                                                                                        fontSize: '12px',
                                                                                                        padding: "2px 6px",
                                                                                                        "& .MuiButton-startIcon": { margin: 0 },
                                                                                                    }}
                                                                                                >
                                                                                                </Button>

                                                                                            </li>

                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className={styles.wrapperProducts}>
                                                                                    <Typography>
                                                                                        <strong>Эл.р:</strong>
                                                                                    </Typography>
                                                                                    <ul className={styles.electronicFrame}>
                                                                                        {image.products.filter((product) => product.id).map((product) => (
                                                                                            <li key={product.id} className={styles.itemList}>
                                                                                                <Checkbox
                                                                                                    checked={product.electronic_frame || false}
                                                                                                    onChange={() => toggleFrame(order.id, order, product, image.image)}
                                                                                                    color="secondary"
                                                                                                    sx={{
                                                                                                        padding: "0px",
                                                                                                    }} />
                                                                                            </li>

                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className={styles.productDetail}>
                                                                                    <Typography>
                                                                                        <strong>Кол-во:</strong>
                                                                                    </Typography>
                                                                                    <ul className={styles.productQuantity}>
                                                                                        {image.products.filter((product) => product.id).map((product) => (
                                                                                            <li key={product.id} className={styles.itemList}>
                                                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                                    {(editingProduct && editingProduct?.id === product.id) ? (
                                                                                                        <>
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                value={editingProduct.quantity}
                                                                                                                onChange={(e) => {
                                                                                                                    const value = e.target.value;
                                                                                                                    setEditingProduct({
                                                                                                                        id: product.id,
                                                                                                                        label: product.label,
                                                                                                                        quantity: value === '' ? '' : Number(value),
                                                                                                                    })
                                                                                                                }}
                                                                                                                style={{ width: "60px", border: "1px solid gray" }} />
                                                                                                            <Button
                                                                                                                variant="contained"
                                                                                                                color="primary"
                                                                                                                size="small"
                                                                                                                startIcon={<Save />}
                                                                                                                onClick={() => saveQuantity(image.image, order.id, order, product)}
                                                                                                                sx={{
                                                                                                                    minWidth: "auto",
                                                                                                                    fontSize: '12px',
                                                                                                                    padding: "2px 6px",
                                                                                                                    "& .MuiButton-startIcon": { margin: 0 },
                                                                                                                }}
                                                                                                            >
                                                                                                            </Button>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <span>{product.quantity}</span>
                                                                                                            <Button
                                                                                                                variant="outlined"
                                                                                                                color="secondary"
                                                                                                                size="small"
                                                                                                                startIcon={<BorderColor />}
                                                                                                                onClick={() => startEditing(product)}
                                                                                                                sx={{
                                                                                                                    minWidth: "auto",
                                                                                                                    fontSize: '12px',
                                                                                                                    padding: "2px 6px",
                                                                                                                    "& .MuiButton-startIcon": { margin: 0 },
                                                                                                                }}
                                                                                                            >
                                                                                                            </Button>
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>

                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className={styles.productDetail}>
                                                                                    <Typography>
                                                                                        <strong>Удалить товар:</strong>
                                                                                    </Typography>
                                                                                    <ul className={styles.productQuantity}>
                                                                                        {image.products.filter((product) => product.id).map((product) => (
                                                                                            <li key={product.id} className={styles.itemList}>
                                                                                                <Button
                                                                                                    variant="outlined"
                                                                                                    color="error"
                                                                                                    size="small"
                                                                                                    startIcon={<Delete />}
                                                                                                    onClick={() => {

                                                                                                        handleDeleteProduct(image.image, order.id, order, { product: product.label })

                                                                                                    }
                                                                                                    }
                                                                                                    sx={{
                                                                                                        minWidth: "auto",
                                                                                                        fontSize: '12px',
                                                                                                        padding: "2px 6px",
                                                                                                        "& .MuiButton-startIcon": { margin: 0 },
                                                                                                    }}
                                                                                                >
                                                                                                </Button>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>


                                                                                </div>
                                                                            </TableCell>
                                                                        </>
                                                                        :
                                                                        <TableCell>
                                                                            <div className={styles.wrapperNoProducts}><span>Нет выбранных товаров</span>
                                                                            </div>
                                                                        </TableCell>
                                                                    }
                                                                </TableRow>
                                                            </React.Fragment>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );

});

export default OrdersTable;
