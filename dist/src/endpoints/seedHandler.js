import { seed as seedScript } from '@/endpoints/seed';
export const seedHandler = async (req) => {
    const { payload, user } = req;
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        await seedScript({ payload, req });
        return Response.json({ success: true });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        payload.logger.error(message);
        return Response.json({ error: message }, { status: 500 });
    }
};
//# sourceMappingURL=seedHandler.js.map