import { CollectionArchive } from '@/components/CollectionArchive';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React from 'react';
import { Search } from '@/search/Component';
import PageClient from './page.client';
export default async function Page({ searchParams: searchParamsPromise }) {
    const { q: query } = await searchParamsPromise;
    const payload = await getPayload({ config: configPromise });
    const posts = await payload.find({
        collection: 'search',
        depth: 1,
        limit: 12,
        ...(query
            ? {
                where: {
                    or: [
                        {
                            title: {
                                like: query,
                            },
                        },
                        {
                            'meta.description': {
                                like: query,
                            },
                        },
                        {
                            'meta.title': {
                                like: query,
                            },
                        },
                        {
                            slug: {
                                like: query,
                            },
                        },
                    ],
                },
            }
            : {}),
    });
    return (<div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="sr-only">Search</h1>
          <Search />
        </div>
      </div>

      {posts.totalDocs > 0 ? (<CollectionArchive posts={posts.docs}/>) : (<div className="container">No results found.</div>)}
    </div>);
}
export function generateMetadata() {
    return {
        title: `Payload Website Template Search`,
    };
}
//# sourceMappingURL=page.jsx.map