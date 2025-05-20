'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';

const schema = yup.object({
  customerName: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  address: yup.string().required('Endereço é obrigatório'),
  paymentMethod: yup.string().required('Método de pagamento é obrigatório'),
  notes: yup.string().optional(),
}).required();

interface CheckoutFormData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  notes?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingCost, setShippingCost] = useState(0.0);

  // Lógica para calcular o frete
  useEffect(() => {
    const orderTotal = getTotalPrice();
    // Regra placeholder: frete grátis acima de R$ 500,00
    if (orderTotal >= 500.00) {
      setShippingCost(0.00);
    } else if (items.length > 0) {
      setShippingCost(20.00); // Custo fixo de R$ 20.00 se houver itens e total abaixo de R$ 500
    } else {
      setShippingCost(0.00); // Frete 0 se o carrinho estiver vazio
    }
  }, [items, getTotalPrice]); // Recalcula quando os itens do carrinho ou o total mudam

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: yupResolver(schema) as any, // Added 'as any' temporarily for testing
  });

  const onSubmit: SubmitHandler<CheckoutFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            smartwatchId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: getTotalPrice(),
          shippingCost: shippingCost,
          // grandTotal will be calculated by the backend
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pedido');
      }

      const order = await response.json();
      clearCart();
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert
          type="warning"
          title="Carrinho vazio"
          message="Adicione itens ao carrinho antes de prosseguir para o checkout."
        />
        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push('/')}
          >
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  const orderTotal = getTotalPrice();
  const grandTotal = orderTotal + shippingCost;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Finalizar Compra
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Nome completo"
                error={errors.customerName?.message}
                {...register('customerName')}
              />

              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Telefone"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Endereço"
                error={errors.address?.message}
                {...register('address')}
              />

              <div className="sm:col-span-2">
                <Select
                  label="Método de pagamento"
                  error={errors.paymentMethod?.message}
                  {...register('paymentMethod')}
                  options={[
                    { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
                    { value: 'DEBIT_CARD', label: 'Cartão de débito' },
                    { value: 'PIX', label: 'PIX' },
                    { value: 'BANK_SLIP', label: 'Boleto bancário' },
                  ]}
                />
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label="Observações"
                  error={errors.notes?.message}
                  {...register('notes')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Resumo do Pedido
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.brand} • Quantidade: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4">
                <p className="text-base font-medium text-gray-900">Subtotal</p>
                <p className="text-base font-medium text-gray-900">
                  R$ {orderTotal.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-base font-medium text-gray-900">Frete</p>
                <p className="text-base font-medium text-gray-900">
                  R$ {shippingCost.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <p className="text-lg font-semibold text-gray-900">Total Geral</p>
                <p className="text-lg font-semibold text-gray-900">
                  R$ {grandTotal.toFixed(2)}
                </p>
              </div>

            </div>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            title="Erro"
            message={error}
          />
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Processando...
              </>
            ) : (
              'Finalizar Compra'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 