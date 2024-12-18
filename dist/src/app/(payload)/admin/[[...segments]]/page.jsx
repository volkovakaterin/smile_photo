import config from '@payload-config';
import { RootPage, generatePageMetadata } from '@payloadcms/next/views';
import { importMap } from '../importMap';
export const generateMetadata = ({ params, searchParams }) => generatePageMetadata({ config, params, searchParams });
const Page = ({ params, searchParams }) => RootPage({ config, params, searchParams, importMap });
export default Page;
//# sourceMappingURL=page.jsx.map