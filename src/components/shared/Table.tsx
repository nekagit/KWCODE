import React from 'react';

interface TableColumn {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode; // Custom render function for cell content
}

interface TableProps {
  data: any[];
  columns: TableColumn[];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ data, columns, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, rowIndex) => (
            <tr key={item.id || rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
