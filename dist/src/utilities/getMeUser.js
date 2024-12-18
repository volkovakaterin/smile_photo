import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClientSideURL } from './getURL';
export const getMeUser = async (args) => {
    const { nullUserRedirect, validUserRedirect } = args || {};
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
        headers: {
            Authorization: `JWT ${token}`,
        },
    });
    const { user, } = await meUserReq.json();
    if (validUserRedirect && meUserReq.ok && user) {
        redirect(validUserRedirect);
    }
    if (nullUserRedirect && (!meUserReq.ok || !user)) {
        redirect(nullUserRedirect);
    }
    // Token will exist here because if it doesn't the user will be redirected
    return {
        token: token,
        user,
    };
};
//# sourceMappingURL=getMeUser.js.map