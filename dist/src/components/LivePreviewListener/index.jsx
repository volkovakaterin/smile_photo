'use client';
import { getClientSideURL } from '@/utilities/getURL';
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react';
import { useRouter } from 'next/navigation';
import React from 'react';
export const LivePreviewListener = () => {
    const router = useRouter();
    return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL()}/>;
};
//# sourceMappingURL=index.jsx.map