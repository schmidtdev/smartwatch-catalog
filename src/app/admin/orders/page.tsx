'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Input from '@/components/Input';

type Order = {
  id: string;
  customerName: string;
  email: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  trackingCode?: string;
  notes?: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Erro ao buscar pedidos');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar pedidos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setTrackingCode(order.trackingCode || '');
    setNotes(order.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedOrder) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          trackingCode,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar pedido');
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pedido');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Erro"
        message={error}
      />
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pedidos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os pedidos realizados na loja.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Table
          headers={[
            { key: 'customerName', label: 'Cliente' },
            { key: 'email', label: 'Email' },
            { key: 'totalAmount', label: 'Total' },
            { key: 'status', label: 'Status' },
            { key: 'paymentStatus', label: 'Status Pagamento' },
            { key: 'paymentMethod', label: 'Método de Pagamento' },
            { key: 'createdAt', label: 'Data' },
            { key: 'actions', label: 'Ações' },
          ]}
          data={orders.map(order => ({
            ...order,
            totalAmount: `R$ ${order.totalAmount.toFixed(2)}`,
            createdAt: new Date(order.createdAt).toLocaleDateString('pt-BR'),
            status: (
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                order.status === 'PREPARING' ? 'bg-purple-100 text-purple-800' :
                order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {{
                  PENDING: 'Pendente',
                  CONFIRMED: 'Confirmado',
                  PREPARING: 'Em preparação',
                  SHIPPED: 'Enviado',
                  DELIVERED: 'Entregue',
                  CANCELLED: 'Cancelado',
                }[order.status] || order.status}
              </span>
            ),
            paymentStatus: (
              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {{
                  PENDING: 'Pendente',
                  PAID: 'Pago',
                  FAILED: 'Falhou',
                  REFUNDED: 'Reembolsado',
                }[order.paymentStatus] || order.paymentStatus}
              </span>
            ),
            paymentMethod: {
              CREDIT_CARD: 'Cartão de crédito',
              DEBIT_CARD: 'Cartão de débito',
              PIX: 'PIX',
              BANK_SLIP: 'Boleto',
            }[order.paymentMethod] || order.paymentMethod,
            actions: (
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => handleEdit(order)}
                >
                  <PencilIcon className="h-5 w-5" />
                </Button>
              </div>
            ),
          }))}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Editar Pedido"
      >
        <div className="space-y-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'PENDING', label: 'Pendente' },
              { value: 'CONFIRMED', label: 'Confirmado' },
              { value: 'PREPARING', label: 'Em preparação' },
              { value: 'SHIPPED', label: 'Enviado' },
              { value: 'DELIVERED', label: 'Entregue' },
              { value: 'CANCELLED', label: 'Cancelado' },
            ]}
          />

          <Select
            label="Status do pagamento"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            options={[
              { value: 'PENDING', label: 'Pendente' },
              { value: 'PAID', label: 'Pago' },
              { value: 'FAILED', label: 'Falhou' },
              { value: 'REFUNDED', label: 'Reembolsado' },
            ]}
          />

          <Input
            label="Código de rastreamento"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />

          <Textarea
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
} 