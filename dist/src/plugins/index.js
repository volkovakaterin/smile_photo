import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { searchPlugin } from '@payloadcms/plugin-search';
import { revalidateRedirects } from '@/hooks/revalidateRedirects';
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical';
import { searchFields } from '@/search/fieldOverrides';
import { beforeSyncWithSearch } from '@/search/beforeSync';
import { getServerSideURL } from '@/utilities/getURL';
const generateTitle = ({ doc }) => {
    return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template';
};
const generateURL = ({ doc }) => {
    const url = getServerSideURL();
    return doc?.slug ? `${url}/${doc.slug}` : url;
};
export const plugins = [
    redirectsPlugin({
        collections: ['pages', 'posts'],
        overrides: {
            // @ts-expect-error
            fields: ({ defaultFields }) => {
                return defaultFields.map((field) => {
                    if ('name' in field && field.name === 'from') {
                        return {
                            ...field,
                            admin: {
                                description: 'You will need to rebuild the website when changing this field.',
                            },
                        };
                    }
                    return field;
                });
            },
            hooks: {
                afterChange: [revalidateRedirects],
            },
        },
    }),
    nestedDocsPlugin({
        collections: ['categories'],
    }),
    seoPlugin({
        generateTitle,
        generateURL,
    }),
    formBuilderPlugin({
        fields: {
            payment: false,
        },
        formOverrides: {
            fields: ({ defaultFields }) => {
                return defaultFields.map((field) => {
                    if ('name' in field && field.name === 'confirmationMessage') {
                        return {
                            ...field,
                            editor: lexicalEditor({
                                features: ({ rootFeatures }) => {
                                    return [
                                        ...rootFeatures,
                                        FixedToolbarFeature(),
                                        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                                    ];
                                },
                            }),
                        };
                    }
                    return field;
                });
            },
        },
    }),
    searchPlugin({
        collections: ['posts'],
        beforeSync: beforeSyncWithSearch,
        searchOverrides: {
            fields: ({ defaultFields }) => {
                return [...defaultFields, ...searchFields];
            },
        },
    }),
    payloadCloudPlugin(),
];
//# sourceMappingURL=index.js.map