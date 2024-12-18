'use client'

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Collapse,
    IconButton,
    Select,
    MenuItem,
    Button,
    Checkbox,
} from "@mui/material";
import { ExpandLess, ExpandMore, Delete, BorderColor, Save, CloudDownload, DoneAll } from "@mui/icons-material";
import { useStatusChangeOrder } from "@/hooks/Order/useChangeStatusOrder";
import { useDeleteOrder } from "@/hooks/Order/useDeleteOrder";
import Image from 'next/image';
import styles from './OrdersTable.module.scss';
import { useEditOrder } from "@/hooks/Order/useEditPhoto";
import path from 'path';
import axios from 'axios';
import { useOrder } from "@/providers/OrderProvider";

type Product = {
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
};

type OrdersTableProps = {
    orders: Order[];
};

const downloadArchive = async (orderId, order, dir) => {
    console.log(orderId)
    try {
        const response = await axios.post('/api/create-archive', null, {
            params: { order: order, dir: dir },
        });

        if (response.status == 200) {
            alert('Архив успешно создан')
        } else {
            alert('Ошибка при создании архива');
        }
    } catch (error) {
        console.error('Ошибка при запросе:', error);
        alert('Не удалось создать архив');
    }
};

async function savePhoto(imagePath, imageName) {
    try {
        console.log(imagePath, imageName);

        const response = await axios.post(
            '/api/save-photo',
            { params: { imagePath, imageName } },
            { responseType: 'blob' }
        );
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'output.jpeg';

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                fileName = match[1];
            }
        }
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Имя загружаемого файла
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error saving photo:', error.message);
    }
}



const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const { mutate: deleteOrder } = useDeleteOrder();
    const { handleDeletePhoto, handleDeleteProduct, handleEditQuantityProduct,
        handleCompletedProducts, handleCompletedAllProducts, handleElectronicFrame } = useEditOrder();
    const [editingProduct, setEditingProduct] = useState<{ id: string; quantity: number, label: string } | null>(null);
    const { directories } = useOrder();

    const handleDownloadProduct = (orderId: string, order) => {
        downloadArchive(orderId, order, directories);
    }

    const allCheckboxTrue = (orderId: string, order) => {
        handleCompletedAllProducts(orderId, order)
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
            console.log(orderId, order, { image: image, product }, editingProduct.quantity)
            handleEditQuantityProduct(orderId, order, { image: image, label: product.label, quantity: product.quantity }, editingProduct.quantity);
            setEditingProduct(null);
        }
    };

    const toggleCompleted = (orderId, order, product: Product, image) => {
        handleCompletedProducts(orderId, order, { product, image })
    };

    const toggleFrame = (orderId, order, product: Product, image) => {
        handleElectronicFrame(orderId, order, { product, image })
    };

    const changeStatus = (value, order) => {
        let completed = true;
        if (value === 'closed') {
            for (const image of order.images) {
                for (const product of image.products) {
                    if (!product.done) {
                        completed = false;
                        break;
                    }
                }
                if (!completed) {
                    break;
                }
            }
        }
        if (completed) {
            handleChangeStatusOrder(value, order.id);
        } else {
            alert('Статус не изменён,есть неготовые товары');
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Статус</TableCell>
                        <TableCell>Номер телефона</TableCell>
                        <TableCell>Создан</TableCell>
                        <TableCell>Редактирован</TableCell>
                        <TableCell>Детали</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <React.Fragment key={order.id}>
                            <TableRow>
                                <TableCell>{order.id}</TableCell>
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
                                <TableCell>{order.tel_number}</TableCell>
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
                                {/* <TableCell>
                                    <IconButton
                                        color="info"
                                        onClick={() => handleDownloadProduct(order.id, order)}
                                    >
                                        <CloudDownload />

                                    </IconButton>
                                </TableCell> */}
                                <TableCell>
                                    <IconButton
                                        color="success"
                                        onClick={() => allCheckboxTrue(order.id, order)}
                                    >
                                        <DoneAll />
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
                                                                                src={`/images${directories.photos}/${image.image}`}
                                                                                onClick={() => savePhoto(`${directories.photos}/${image.image}`, path.parse(image.image).name)}
                                                                                alt={'photo'} width={212}
                                                                                height={114}
                                                                                className={styles.image} />
                                                                            <div className={styles.photoName}>{path.parse(image.image).name}</div>
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

                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className={styles.wrapperProducts}>
                                                                        <Typography>
                                                                            <strong>Товары:</strong>
                                                                        </Typography>
                                                                        <ul className={styles.product}>
                                                                            {image.products.map((product) => (
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
                                                                            <strong>Эл.р:</strong>
                                                                        </Typography>
                                                                        <ul className={styles.electronicFrame}>
                                                                            {image.products.map((product) => (
                                                                                <li key={product.id} className={styles.itemList}>
                                                                                    <Checkbox
                                                                                        checked={product.electronic_frame || false}
                                                                                        onChange={() => toggleFrame(order.id, order, product, image.image)}
                                                                                        color="secondary"
                                                                                        sx={{
                                                                                            padding: "0px",
                                                                                        }}
                                                                                    />
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
                                                                            {image.products.map((product) => (
                                                                                <li key={product.id} className={styles.itemList}>
                                                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                        {editingProduct?.id === product.id ? (
                                                                                            <>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    value={editingProduct.quantity}
                                                                                                    onChange={(e) =>
                                                                                                        setEditingProduct({
                                                                                                            id: product.id,
                                                                                                            label: product.label,
                                                                                                            quantity: Number(e.target.value),
                                                                                                        })
                                                                                                    }
                                                                                                    style={{ width: "60px", border: "1px solid gray" }}
                                                                                                />
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
                                                                            <strong>Управление:</strong>
                                                                        </Typography>
                                                                        <ul className={styles.productQuantity}>
                                                                            {image.products.map((product) => (
                                                                                <li key={product.id} className={styles.itemList}>
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        color="error"
                                                                                        size="small"
                                                                                        startIcon={<Delete />}
                                                                                        onClick={() => handleDeleteProduct(image.image, order.id, order, { product: product.label })}
                                                                                        sx={{
                                                                                            minWidth: "auto",
                                                                                            fontSize: '12px',
                                                                                            padding: "2px 6px",
                                                                                            "& .MuiButton-startIcon": { margin: 0 },
                                                                                        }}
                                                                                    >
                                                                                    </Button>

                                                                                    <Checkbox
                                                                                        checked={product.done || false}
                                                                                        onChange={() => toggleCompleted(order.id, order, product, image.image)}
                                                                                        color="primary"
                                                                                        sx={{
                                                                                            padding: "0px",
                                                                                        }}
                                                                                    />
                                                                                </li>
                                                                            ))}
                                                                        </ul>


                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
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
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        //  {showTypeProduct && createPortal(
        //     <TheModal open={showTypeProduct} handleClose={closeTypeProduct}>
        //         <FormTypeProduct onClose={() => setShowTypeProduct(false)}
        //             confirmFn={addPhotoOrder} error={false} products={products.docs} />
        //     </TheModal>,
        //     document.body
        // )}
    );
};

export default OrdersTable;
