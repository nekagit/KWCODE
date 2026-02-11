import React from 'react';
import sharedClasses from './shared-classes';

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
    <div data-shared-ui className={sharedClasses.Table.wrapper}>
      <table className={`${sharedClasses.Table.table} ${className || ''}`}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} className={sharedClasses.Table.th}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={sharedClasses.Table.tbody}>
          {data.map((item, rowIndex) => (
            <tr key={item.id || rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={column.key} className={sharedClasses.Table.td}>
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
