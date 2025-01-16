'use client';
import React, { useState, memo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Collapse, IconButton, Select, MenuItem, Button, Checkbox } from "@mui/material";
import { ExpandLess, ExpandMore, Delete, BorderColor, Save, CloudDownload, DoneAll } from "@mui/icons-material";
import { useStatusChangeOrder } from "@/hooks/Order/useChangeStatusOrder";
import { useDeleteOrder } from "@/hooks/Order/useDeleteOrder";
import Image from 'next/image';
import styles from './OrdersTable.module.scss';
import { useEditOrder } from "@/hooks/Order/useEditPhoto";
import path from 'path';
import { useOrder } from "@/providers/OrderProvider";
import { downloadArchive } from "./services/downloadArchive";
import { savePhoto } from "./services/savePhoto";
import { SelectProducts } from "../SelectProducts/SelectProducts";
import { useProducts } from "@/hooks/Products/useGetProducts";
const ensureLeadingSlash = (p) => (p.startsWith('/') ? p : `/${p}`);
const OrdersTable = memo(({ orders }) => {
    const [expandedRows, setExpandedRows] = useState([]);
    const { handleChangeStatusOrder } = useStatusChangeOrder();
    const { mutate: deleteOrder } = useDeleteOrder();
    const { handleDeletePhoto, handleDeleteProduct, handleEditQuantityProduct, handleCompletedProducts, handleCompletedAllProducts, handleElectronicFrame, addFormatOnePhoto } = useEditOrder();
    const [editingProduct, setEditingProduct] = useState(null);
    const { directories } = useOrder();
    const { products } = useProducts();
    const handleDownloadProduct = (orderId, order) => {
        downloadArchive(orderId, order, directories);
    };
    const allCheckboxTrue = (orderId, order) => {
        handleCompletedAllProducts(orderId, order);
    };
    const toggleRow = (id) => {
        setExpandedRows((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
    };
    const startEditing = (product) => {
        setEditingProduct({ label: product.label, quantity: product.quantity, id: product.id });
    };
    const saveQuantity = (image, orderId, order, product) => {
        if (editingProduct) {
            if (typeof editingProduct.quantity == 'number' && editingProduct.quantity > 0) {
                handleEditQuantityProduct(orderId, order, { image: image, label: product.label, quantity: product.quantity }, editingProduct.quantity);
            }
            setEditingProduct(null);
        }
    };
    const toggleCompleted = (orderId, order, product, image) => {
        handleCompletedProducts(orderId, order, { product, image });
    };
    const toggleFrame = (orderId, order, product, image) => {
        handleElectronicFrame(orderId, order, { product, image });
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
        }
        else {
            alert('Статус не изменён,есть неготовые товары');
        }
    };
    const handleSelectionChange = (selectedProducts, orderId, order, selectPhoto) => {
        addFormatOnePhoto(selectedProducts, orderId, order, selectPhoto);
    };
    return (<TableContainer component={Paper}>
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
                    {orders.map((order) => (<React.Fragment key={order.id}>
                            <TableRow>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>
                                    <Select value={order.status} onChange={(e) => changeStatus(e.target.value, order)} size="small">
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
                                    <IconButton color="error" onClick={() => deleteOrder(order.id)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <IconButton color="info" onClick={() => handleDownloadProduct(order.id, order)}>
                                        <CloudDownload />

                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <IconButton color="success" onClick={() => allCheckboxTrue(order.id, order)}>
                                        <DoneAll />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={6} style={{ padding: 0 }}>
                                    <Collapse in={expandedRows.includes(order.id)} timeout="auto" unmountOnExit className={styles.wrapperPhotos}>
                                        <Typography variant="h6" sx={{ margin: 2, fontWeight: 600 }}>
                                            Состав заказа
                                        </Typography>
                                        <TableContainer component={Paper} className={styles.tableOrder}>
                                            <Table>
                                                <TableBody>
                                                    {order.images.map((image) => (<React.Fragment key={image.id}>
                                                            <TableRow className={styles.row}>
                                                                <TableCell>
                                                                    <div className={styles.wrapperPhotoCard}>
                                                                        <Typography>
                                                                            <strong>Фото:</strong>
                                                                            <Image src={`/images${ensureLeadingSlash(directories.photos)}/${image.image}`} onClick={() => savePhoto(`${directories.photos}/${image.image}`, path.parse(image.image).name)} alt={'photo'} width={212} height={114} className={styles.image}/>
                                                                            <span className={styles.photoName}>{path.parse(image.image).name}</span>
                                                                        </Typography>
                                                                        <Button variant="outlined" color="error" size="small" startIcon={<Delete className={styles.icon}/>} onClick={() => handleDeletePhoto(image.image, order.id, order)} style={{ marginTop: "10px", fontSize: '12px', padding: "1px 5px", width: '212px' }}>Удалить фото
                                                                        </Button>
                                                                    </div>
                                                                    {products && <SelectProducts products={products.docs} selectProducts={image.products} onSelectionChange={(format) => handleSelectionChange(format, order.id, order, image.image)}/>}
                                                                </TableCell>
                                                                {image.products.length ?
                    <>
                                                                        <TableCell>
                                                                            <div className={styles.wrapperProducts}>
                                                                                <Typography>
                                                                                    <strong>Товары:</strong>
                                                                                </Typography>
                                                                                <ul className={styles.product}>
                                                                                    {image.products.filter((product) => product.id).map((product) => (<li key={product.id} className={styles.itemList}>
                                                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                                <span>{product.label}</span>
                                                                                            </div>

                                                                                        </li>))}
                                                                                </ul>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className={styles.wrapperProducts}>
                                                                                <Typography>
                                                                                    <strong>Эл.р:</strong>
                                                                                </Typography>
                                                                                <ul className={styles.electronicFrame}>
                                                                                    {image.products.filter((product) => product.id).map((product) => (<li key={product.id} className={styles.itemList}>
                                                                                            <Checkbox checked={product.electronic_frame || false} onChange={() => toggleFrame(order.id, order, product, image.image)} color="secondary" sx={{
                                padding: "0px",
                            }}/>
                                                                                        </li>))}
                                                                                </ul>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className={styles.productDetail}>
                                                                                <Typography>
                                                                                    <strong>Кол-во:</strong>
                                                                                </Typography>
                                                                                <ul className={styles.productQuantity}>
                                                                                    {image.products.filter((product) => product.id).map((product) => (<li key={product.id} className={styles.itemList}>
                                                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                                {(editingProduct && editingProduct?.id === product.id) ? (<>
                                                                                                        <input type="number" value={editingProduct.quantity} onChange={(e) => {
                                    const value = e.target.value;
                                    setEditingProduct({
                                        id: product.id,
                                        label: product.label,
                                        quantity: value === '' ? '' : Number(value),
                                    });
                                }} style={{ width: "60px", border: "1px solid gray" }}/>
                                                                                                        <Button variant="contained" color="primary" size="small" startIcon={<Save />} onClick={() => saveQuantity(image.image, order.id, order, product)} sx={{
                                    minWidth: "auto",
                                    fontSize: '12px',
                                    padding: "2px 6px",
                                    "& .MuiButton-startIcon": { margin: 0 },
                                }}>
                                                                                                        </Button>
                                                                                                    </>) : (<>
                                                                                                        <span>{product.quantity}</span>
                                                                                                        <Button variant="outlined" color="secondary" size="small" startIcon={<BorderColor />} onClick={() => startEditing(product)} sx={{
                                    minWidth: "auto",
                                    fontSize: '12px',
                                    padding: "2px 6px",
                                    "& .MuiButton-startIcon": { margin: 0 },
                                }}>
                                                                                                        </Button>
                                                                                                    </>)}
                                                                                            </div>

                                                                                        </li>))}
                                                                                </ul>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className={styles.productDetail}>
                                                                                <Typography>
                                                                                    <strong>Управление:</strong>
                                                                                </Typography>
                                                                                <ul className={styles.productQuantity}>
                                                                                    {image.products.filter((product) => product.id).map((product) => (<li key={product.id} className={styles.itemList}>
                                                                                            <Button variant="outlined" color="error" size="small" startIcon={<Delete />} onClick={() => handleDeleteProduct(image.image, order.id, order, { product: product.label })} sx={{
                                minWidth: "auto",
                                fontSize: '12px',
                                padding: "2px 6px",
                                "& .MuiButton-startIcon": { margin: 0 },
                            }}>
                                                                                            </Button>

                                                                                            <Checkbox checked={product.done || false} onChange={() => toggleCompleted(order.id, order, product, image.image)} color="primary" sx={{
                                padding: "0px",
                            }}/>
                                                                                        </li>))}
                                                                                </ul>


                                                                            </div>
                                                                        </TableCell>
                                                                    </>
                    :
                        <TableCell>
                                                                        <div className={styles.wrapperNoProducts}><span>Нет выбранных товаров</span>
                                                                        </div>
                                                                    </TableCell>}
                                                            </TableRow>
                                                        </React.Fragment>))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>))}
                </TableBody>
            </Table>
        </TableContainer>);
});
export default OrdersTable;
//# sourceMappingURL=OrdersTable.jsx.map