import React, { ReactNode } from 'react';

interface Column<T> {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (value: any, record: T, index: number) => ReactNode;
    sorter?: (a: T, b: T) => number;
    filters?: Array<{ text: string; value: string }>;
    onFilter?: (value: string, record: T) => boolean;
    filteredValue?: string[] | null;
}

interface TableProps<T> {
    dataSource: T[];
    columns: Column<T>[];
    rowKey: string | ((record: T) => string);
    pagination?: { pageSize: number } | false;
    className?: string;
}

export default function Table<T extends Record<string, any>>({ dataSource, columns, rowKey, pagination = false, className = '' }: TableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = pagination ? pagination.pageSize : dataSource.length;
    const totalPages = Math.ceil(dataSource.length / pageSize);
    const paginatedData = pagination ? dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize) : dataSource;

    const getRowKey = (record: T, index: number): string => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return record[rowKey] || index.toString();
    };

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((record, index) => (
                        <tr key={getRowKey(record, index)} className="hover:bg-gray-50">
                            {columns.map((column) => {
                                const value = column.dataIndex ? record[column.dataIndex] : undefined;
                                const rendered = column.render ? column.render(value, record, index) : value;

                                return (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {rendered}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, dataSource.length)} of {dataSource.length} results
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                            Previous
                        </button>
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
