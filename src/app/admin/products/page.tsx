'use client';

import { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Select from '@/components/Select';
import { toast } from 'react-toastify';
import Button from '@/components/Button';

interface Feature {
  id?: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
  features: Feature[];
  stock: number;
  criticalStock?: number | null;
}

interface ProductFormData {
  name: string;
  brand: string;
  price: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  features: Feature[];
  stock: number;
  criticalStock: number | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    price: '',
    description: '',
    isPublished: true,
    imageUrl: '',
    features: [],
    stock: 0,
    criticalStock: null,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(`Erro ao carregar produtos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isPublished: !product.isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle product status');
      }

      toast.success('Status do produto atualizado com sucesso!');
      fetchProducts(); // Refresh the list
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      toast.error(`Erro ao atualizar status do produto: ${error.message}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        toast.success('Produto excluído com sucesso!');
        fetchProducts(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting product:', error);
        toast.error(`Erro ao excluir produto: ${error.message}`);
      }
    }
  };

  const handleOpenModal = (product?: Product) => {
    setErrors({});
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        description: product.description,
        isPublished: product.isPublished,
        imageUrl: product.imageUrl,
        features: product.features.map(f => ({ id: f.id, name: f.name })),
        stock: product.stock,
        criticalStock: product.criticalStock as number | null ?? null,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        price: '',
        description: '',
        isPublished: true,
        imageUrl: '',
        features: [],
        stock: 0,
        criticalStock: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prevData => {
      switch (name) {
        case 'price':
          // Price is stored as string in state, parsed on submit
          return { ...prevData, [name]: value };
        case 'stock':
          return { ...prevData, [name]: value === '' ? 0 : parseInt(value) };
        case 'criticalStock':
          return { ...prevData, [name]: value === '' ? null : parseInt(value) };
        case 'isPublished':
          return { ...prevData, [name]: (e.target as HTMLInputElement).checked };
        default:
          // For other text/textarea inputs
          return { ...prevData, [name]: value };
      }
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index].name = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { name: '' }] });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) newErrors.price = 'Preço inválido';
    if (!formData.description) newErrors.description = 'Descrição é obrigatória';
    if (!formData.imageUrl) newErrors.imageUrl = 'URL da Imagem é obrigatória';
    if (formData.stock === undefined || formData.stock < 0) newErrors.stock = 'Estoque inválido';
    if (formData.criticalStock !== null && formData.criticalStock !== undefined && (isNaN(parseInt(formData.criticalStock as any)) || parseInt(formData.criticalStock as any) < 0)) newErrors.criticalStock = 'Estoque Crítico inválido';
    
    formData.features.forEach((feature, index) => {
      if (!feature.name) newErrors[`feature-${index}`] = `Feature ${index + 1} é obrigatória`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    setLoading(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock as any),
          criticalStock: formData.criticalStock !== null && formData.criticalStock !== 0 ? parseInt(formData.criticalStock as any) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (editingProduct ? 'Failed to update product' : 'Failed to create product'));
      }

      toast.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Erro ao salvar produto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os produtos disponíveis no catálogo.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Marca
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Preço
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Data de Criação
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Estoque Crítico
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => {
                    const isLowStock = product.criticalStock !== null && product.criticalStock !== undefined && product.stock <= product.criticalStock;
                    return (
                      <tr 
                        key={product.id}
                        className={isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <div className="flex items-center">
                            {isLowStock && (
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            {product.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product.brand}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          R$ {product.price.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              product.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {product.isPublished ? 'Publicado' : 'Oculto'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className={isLowStock ? 'text-red-600 font-medium' : ''}>
                              {product.stock}
                            </span>
                            {product.criticalStock !== null && (
                              <span className="text-gray-400 ml-1">
                                / {product.criticalStock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleTogglePublish(product.id)}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              {product.isPublished ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="text-blue-400 hover:text-blue-500"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
          />
          <Input
            label="Marca"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            error={errors.brand}
          />
          <Input
            label="Preço"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            type="number"
            step="0.01"
            error={errors.price}
          />
          <Input
            label="URL da Imagem"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            error={errors.imageUrl}
          />
          <Textarea
            label="Descrição"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
          />
          <div className="mt-4">
            <Input
              label="Estoque"
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              error={errors.stock}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Estoque Crítico (Opcional)"
              id="criticalStock"
              name="criticalStock"
              type="number"
              value={formData.criticalStock ?? ''}
              onChange={handleInputChange}
              error={errors.criticalStock}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center mt-2 space-x-2">
                <Input
                  name={`feature-${index}`}
                  value={feature.name}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                  error={errors[`feature-${index}`]}
                  className="flex-grow"
                />
                <Button
                  variant="secondary"
                  onClick={() => handleRemoveFeature(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={handleAddFeature} className="mt-2">
              Adicionar Feature
            </Button>
          </div>

          <div className="flex items-center">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
              Publicado
            </label>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 