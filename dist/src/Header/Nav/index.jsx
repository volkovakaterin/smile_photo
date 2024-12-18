'use client';
import React from 'react';
import { CMSLink } from '@/components/Link';
import Link from 'next/link';
import { SearchIcon } from 'lucide-react';
export const HeaderNav = ({ header }) => {
    const navItems = header?.navItems || [];
    return (<nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
            return <CMSLink key={i} {...link} appearance="link"/>;
        })}
      <Link href="/search">
        <span className="sr-only">Search</span>
        <SearchIcon className="w-5 text-primary"/>
      </Link>
    </nav>);
};
//# sourceMappingURL=index.jsx.map