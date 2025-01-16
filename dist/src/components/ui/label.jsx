'use client';
import { cn } from 'src/utilities/cn';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva } from 'class-variance-authority';
import * as React from 'react';
const labelVariants = cva('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
const Label = React.forwardRef(({ className, ...props }, ref) => (<LabelPrimitive.Root className={cn(labelVariants(), className)} ref={ref} {...props}/>));
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
//# sourceMappingURL=label.jsx.map