import { getSales, getProductosParaVenta } from './actions';
import SalesClient from './SalesClient';

export const dynamic = 'force-dynamic';

export default async function VentasPage() {
    const [sales, productos] = await Promise.all([getSales(), getProductosParaVenta()]);
    return <SalesClient initialSales={sales} productos={productos} />;
}
