import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;
        
        if (!showEllipsis) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(0);
            
            // Show ellipsis or pages around current
            if (currentPage <= 3) {
                for (let i = 1; i <= Math.min(5, totalPages - 2); i++) {
                    pages.push(i);
                }
                if (totalPages > 6) pages.push('...');
            } else if (currentPage >= totalPages - 4) {
                if (totalPages > 6) pages.push('...');
                for (let i = Math.max(totalPages - 5, 1); i < totalPages - 1; i++) {
                    pages.push(i);
                }
            } else {
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
            }
            
            // Always show last page
            if (totalPages > 1) pages.push(totalPages - 1);
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
                <ChevronLeft className="w-4 h-4" />
                Prev
            </Button>
            
            {pageNumbers.map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={`min-w-[2.5rem] ${
                            currentPage === page 
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {page + 1}
                    </Button>
                )
            ))}
            
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}