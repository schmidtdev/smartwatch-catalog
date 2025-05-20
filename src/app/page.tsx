'use client';

import React, { useEffect, useState } from "react";
import SmartwatchList from "@/components/SmartwatchList";
import SmartwatchFilters from "@/components/SmartwatchFilters";
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Tipos
interface Feature {
  id: string;
  name: string;
}
interface Smartwatch {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  features: Feature[];
  stock: number;
}

export default function Home() {
  const [smartwatches, setSmartwatches] = useState<Smartwatch[]>([]);
  const [filteredSmartwatches, setFilteredSmartwatches] = useState<Smartwatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const { addToCart, totalItems: totalItemsInCart, totalPrice: cartTotalPrice, updateItemQuantity, items: cartItems } = useCartStore();

  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleUpdateQuantity = async (item: Smartwatch, quantity: number) => {
    const success = await updateItemQuantity(item.id, quantity);
    if (!success) {
      toast.warn(`Não foi possível atualizar a quantidade para ${quantity}. Estoque máximo atingido.`);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    useCartStore.getState().removeItem(itemId);
  };

  const fetchSmartwatches = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch smartwatches');
      }
      const data = await response.json();
      setSmartwatches(data);
      setFilteredSmartwatches(data);
      
      // Extract unique brands and features
      const uniqueBrands = [...new Set(data.map((sw: Smartwatch) => sw.brand))] as string[];
      const uniqueFeatures = [...new Set(data.flatMap((sw: Smartwatch) => sw.features.map(f => f.name)))] as string[];
      
      setBrands(uniqueBrands);
      setFeatures(uniqueFeatures);
    } catch (error) {
      console.error('Error fetching smartwatches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    feature: string;
    searchTerm: string;
  }) => {
    let filtered = [...smartwatches];

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        sw =>
          sw.name.toLowerCase().includes(searchTerm) ||
          sw.description.toLowerCase().includes(searchTerm) ||
          sw.brand.toLowerCase().includes(searchTerm)
      );
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(sw => sw.brand === filters.brand);
    }

    // Apply price filters
    if (filters.minPrice) {
      filtered = filtered.filter(sw => sw.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(sw => sw.price <= parseFloat(filters.maxPrice));
    }

    // Apply feature filter
    if (filters.feature) {
      filtered = filtered.filter(sw =>
        sw.features.some(f => f.name === filters.feature)
      );
    }

    setFilteredSmartwatches(filtered);
  };

  const handleAddToCart = (smartwatch: Smartwatch) => {
    addToCart(smartwatch);
  };

  useEffect(() => {
    fetchSmartwatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo de Smartwatches</h1>
        {totalItemsInCart > 0 && (
          <Link
            href="/checkout"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Finalizar Pedido (R$ {cartTotalPrice.toFixed(2)})
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
            <SmartwatchFilters brands={brands} features={features} onFilter={handleFilter} />
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <SmartwatchList smartwatches={filteredSmartwatches} onAddToCart={handleAddToCart} />
          )}
        </div>
      </div>

      {totalItemsInCart > 0 && (
        <button
          onClick={toggleCart}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-50 transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ display: isCartOpen ? 'none' : 'flex', alignItems: 'center' }}
        >
           <ShoppingCartIcon className="h-6 w-6" />
           <span className="ml-2 text-sm font-medium">{totalItemsInCart}</span>
        </button>
      )}

      {totalItemsInCart > 0 && isCartOpen && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50 border border-gray-200 transform transition-transform ease-in-out duration-300 translate-x-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Carrinho de Compras</h2>
            <button onClick={toggleCart} className="text-gray-500 hover:text-gray-700">
               <XMarkIcon className="h-5 w-5" />
             </button>
          </div>
          <div className="max-h-48 overflow-y-auto mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <div className="flex items-center mt-1">
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      className="text-gray-500 hover:text-gray-700 text-sm px-1 border rounded"
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-700 mx-2">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className={`text-sm px-1 border rounded ${
                        item.quantity >= item.stock
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Estoque disponível: {item.stock} unidades
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-900">Total:</span>
            <span className="font-bold text-lg text-gray-900">R$ {cartTotalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors">
              Finalizar Pedido
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
