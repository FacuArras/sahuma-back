import { getOrders, getProductos } from './actions';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
    const [orders, productos] = await Promise.all([getOrders(), getProductos()]);
    return <OrdersClient initialOrders={orders} productos={productos} />;
}

