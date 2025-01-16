import { buttonVariants } from '@/components/ui/button';
import { cn } from 'src/utilities/cn';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';
const Pagination = ({ className, ...props }) => (<nav aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} role="navigation" {...props}/>);
Pagination.displayName = 'Pagination';
const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (<ul className={cn('flex flex-row items-center gap-1', className)} ref={ref} {...props}/>));
PaginationContent.displayName = 'PaginationContent';
const PaginationItem = React.forwardRef(({ className, ...props }, ref) => <li className={cn('', className)} ref={ref} {...props}/>);
PaginationItem.displayName = 'PaginationItem';
const PaginationLink = ({ className, isActive, size = 'icon', ...props }) => (<button aria-current={isActive ? 'page' : undefined} className={cn(buttonVariants({
        size,
        variant: isActive ? 'outline' : 'ghost',
    }), className)} {...props}/>);
PaginationLink.displayName = 'PaginationLink';
const PaginationPrevious = ({ className, ...props }) => (<PaginationLink aria-label="Go to previous page" className={cn('gap-1 pl-2.5', className)} size="default" {...props}>
    <ChevronLeft className="h-4 w-4"/>
    <span>Previous</span>
  </PaginationLink>);
PaginationPrevious.displayName = 'PaginationPrevious';
const PaginationNext = ({ className, ...props }) => (<PaginationLink aria-label="Go to next page" className={cn('gap-1 pr-2.5', className)} size="default" {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4"/>
  </PaginationLink>);
PaginationNext.displayName = 'PaginationNext';
const PaginationEllipsis = ({ className, ...props }) => (<span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More pages</span>
  </span>);
PaginationEllipsis.displayName = 'PaginationEllipsis';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, };
//# sourceMappingURL=pagination.jsx.map