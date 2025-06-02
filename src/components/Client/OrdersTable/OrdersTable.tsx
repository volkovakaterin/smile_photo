'use client'

import React, { useState, memo, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Collapse, IconButton, Select, MenuItem, Button, Checkbox } from "@mui/material";
import { ExpandLess, ExpandMore, Delete, BorderColor, Save, CloudDownload, DoneAll, ContentCopy } from "@mui/icons-material";
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
    print: boolean;
    products: Product[];
};

type Order = {
    id: string;
    status: string;
    tel_number: string;
    createdAt: string;
    updatedAt: string;
    images: Image[];
};

type OrdersTableProps = {
    orders: Order[];
    ordersTotal: number;
};

const OrdersTable: React.FC<OrdersTableProps> = memo(({ orders, ordersTotal }) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const { mutate: deleteOrder } = useDeleteOrder();
    const { handleDeletePhoto, handleDeleteProduct, handleEditQuantityProduct,
        handleCompletedProducts, handleCompletedAllProducts, handleElectronicFrame, addFormatOnePhoto,
        applyFormatAllPhotos, handleTogglePrintOrder } = useEditOrder();
    const [editingProduct, setEditingProduct] = useState<{ id: string; quantity: number | string, label: string } | null>(null);
    const { directories } = useOrder();
    const { products } = useProducts();

    const handleDownloadProduct = (order) => {
        downloadArchive(order, directories);
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

    const togglePrint = (orderId, order, image) => {
        handleTogglePrintOrder(orderId, image, order)
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
                        <TableCell>Номер телефона</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Кол-во фото</TableCell>
                        <TableCell>Создан</TableCell>
                        <TableCell>Редактирован</TableCell>
                        <TableCell>Детали</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => {
                        // 1. Сортируем картинки по полю `print`
                        const sortedImages = [...order.images].sort((a, b) => {
                            if (a.print && !b.print) return -1;
                            if (!a.print && b.print) return 1;
                            return a.image.localeCompare(b.image, 'ru', { sensitivity: 'base' });
                        });
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
                                    <TableCell>{order.tel_number}</TableCell>
                                    <TableCell>
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
                                    <TableCell>{order.images.length}</TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
                                    <TableCell>
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
                                                        {sortedImages.map((image) => (
                                                            <React.Fragment key={image.id}>
                                                                <TableRow className={styles.row}>
                                                                    <TableCell>
                                                                        <div className={styles.wrapperPhotoCard}>
                                                                            <Typography>
                                                                                <strong>Фото:</strong>
                                                                                <Image
                                                                                    quality={30}
                                                                                    src={`/api/dynamic-thumbnail?img=${ensureLeadingSlash(image.image)}`}
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
                                                                    <TableCell>
                                                                        <div className={styles.wrapperPrint}>
                                                                            <Typography>
                                                                                <strong>Печать:</strong>
                                                                            </Typography>
                                                                            <Checkbox
                                                                                checked={image.print}
                                                                                onChange={() => togglePrint(order.id, order, image.image)}
                                                                                color="secondary"
                                                                                sx={{
                                                                                    padding: "0px",
                                                                                }} />
                                                                        </div>
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
                                                                                                    onClick={() => applyFormatAllPhotos({ id: product.product, format: product.label }, order.id, order, image.image)}
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
