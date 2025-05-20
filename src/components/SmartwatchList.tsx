import { ShoppingCartIcon } from '@heroicons/react/24/outline';

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

interface SmartwatchListProps {
  smartwatches: Smartwatch[];
  onAddToCart: (smartwatch: Smartwatch) => void;
}

export default function SmartwatchList({ smartwatches, onAddToCart }: SmartwatchListProps) {
  if (!smartwatches.length) {
    return <div className="text-center text-gray-500">Nenhum smartwatch encontrado.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {smartwatches.map((smartwatch) => (
        <div
          key={smartwatch.id}
          className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
            <img
              src={smartwatch.imageUrl}
              alt={smartwatch.name}
              className="h-48 w-48 object-cover object-center group-hover:opacity-75 mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {smartwatch.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{smartwatch.brand}</p>
              </div>
              <p className="text-lg font-medium text-gray-900">
                R$ {smartwatch.price.toFixed(2)}
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {smartwatch.description}
            </p>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Características:</h4>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {smartwatch.features.map((feature) => (
                  <li
                    key={feature.id}
                    className="text-sm text-gray-500 flex items-center"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-2"></span>
                    {feature.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Estoque: {smartwatch.stock} unidades
                </span>
              </div>
              <button
                onClick={() => onAddToCart(smartwatch)}
                disabled={smartwatch.stock <= 0}
                className={`w-full flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  smartwatch.stock <= 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {smartwatch.stock <= 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 