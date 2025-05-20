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
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header.key}
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
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
            data.map((item, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td
                    key={header.key}
                    className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                  >
                    {item[header.key as keyof T] as ReactNode}
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