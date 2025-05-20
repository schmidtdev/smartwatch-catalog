import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface Header {
  key: string;
  label: string;
}

interface TableProps<T> {
  headers: Header[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export default function Table<T>({
  headers,
  data,
  className = '',
  emptyMessage = 'Nenhum item encontrado',
}: TableProps<T>) {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6 text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => (
                  <td
                    key={`${rowIndex}-${header.key}`}
                    className="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[header.key as keyof T] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 