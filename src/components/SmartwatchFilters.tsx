'use client';

import React, { useState } from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface SmartwatchFiltersProps {
  brands: string[];
  features: string[];
  onFilter: (filters: {
    brand: string;
    minPrice: string;
    maxPrice: string;
    feature: string;
  }) => void;
}

export default function SmartwatchFilters({
  brands,
  features,
  onFilter,
}: SmartwatchFiltersProps) {
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    feature: '',
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FunnelIcon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
      </div>

      <div>
        <label
          htmlFor="brand"
          className="block text-sm font-medium text-gray-800"
        >
          Marca
        </label>
        <select
          id="brand"
          name="brand"
          value={filters.brand}
          onChange={handleFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900"
        >
          <option value="">Todas as marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="feature"
          className="block text-sm font-medium text-gray-800"
        >
          Característica
        </label>
        <select
          id="feature"
          name="feature"
          value={filters.feature}
          onChange={handleFilterChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900"
        >
          <option value="">Todas as características</option>
          {features.map((feature) => (
            <option key={feature} value={feature}>
              {feature}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="minPrice"
            className="block text-sm font-medium text-gray-800"
          >
            Preço Mínimo
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              type="number"
              name="minPrice"
              id="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
              className="block w-full rounded-md border-gray-300 shadow-sm pl-10 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-500 text-gray-900 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="maxPrice"
            className="block text-sm font-medium text-gray-800"
          >
            Preço Máximo
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
            <input
              type="number"
              name="maxPrice"
              id="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              required
              step="0.01"
              min="0"
              placeholder="9999.99"
              className="block w-full rounded-md border-gray-300 shadow-sm pl-10 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-500 text-gray-900 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          setFilters({
            brand: '',
            minPrice: '',
            maxPrice: '',
            feature: '',
          });
          onFilter({
            brand: '',
            minPrice: '',
            maxPrice: '',
            feature: '',
          });
        }}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Limpar Filtros
      </button>
    </div>
  );
} 