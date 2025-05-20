'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';

type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    smartwatch: {
      name: string;
      brand: string;
    };
  }>;
  createdAt: string;
  trackingCode?: string;
  notes?: string;
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('id');
    if (!orderId) {
      setError('ID do pedido não encontrado');
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar pedido');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar pedido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Alert
        type="error"
        title="Erro"
        message={error || 'Pedido não encontrado'}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Pedido confirmado!
        </h1>
        <p className="mt-2 text-gray-600">
          Obrigado por comprar conosco. Seu pedido foi recebido e está sendo processado.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Informações do Pedido
              </h2>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Número do pedido</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{order.id}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Data</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.status === 'PENDING' && 'Pendente'}
                    {order.status === 'PROCESSING' && 'Em processamento'}
                    {order.status === 'SHIPPED' && 'Enviado'}
                    {order.status === 'DELIVERED' && 'Entregue'}
                    {order.status === 'CANCELLED' && 'Cancelado'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Método de pagamento</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {order.paymentMethod === 'CREDIT_CARD' && 'Cartão de crédito'}
                    {order.paymentMethod === 'DEBIT_CARD' && 'Cartão de débito'}
                    {order.paymentMethod === 'PIX' && 'PIX'}
                    {order.paymentMethod === 'BANK_SLIP' && 'Boleto bancário'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Endereço de Entrega
              </h2>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nome</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.customerName}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.email}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.phone}</dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Endereço</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.address}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Itens do Pedido
            </h2>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Produto
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Quantidade
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Preço Unitário
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {item.smartwatch.name}
                        <p className="text-gray-500">{item.smartwatch.brand}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                        R$ {item.price.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={3} className="hidden pl-4 pr-3 pt-4 text-right text-sm font-semibold text-gray-900 sm:table-cell sm:pl-6">
                      Total
                    </th>
                    <th scope="row" className="pl-4 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 sm:hidden">
                      Total
                    </th>
                    <td className="pl-3 pr-4 pt-4 text-right text-sm font-semibold text-gray-900">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={() => window.location.href = '/'}
            >
              Voltar para a loja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 