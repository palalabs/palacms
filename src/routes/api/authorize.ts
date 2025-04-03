import { json, error as server_error } from '@sveltejs/kit';
import supabase_admin from '$lib/supabase/admin';
import type { RequestEvent } from '@sveltejs/kit';

type AuthorizeOptions = {
  onsuccess: (args: any) => Promise<Response>;
  onerror: (error: any) => Promise<Response>;
};

export default async function authorize({ request, locals, url }: RequestEvent, { onsuccess, onerror }: AuthorizeOptions): Promise<Response> {
  try {
    const session = await locals.getSession();
    if (!session) {
      throw server_error(401, { message: 'Unauthorized' });
    }

    let request_data = { site_id: null }
    if (request.method === 'POST') {
      request_data = await request.json();
    } else if (request.method === 'GET') {
      const the_url = new URL(url)
      request_data = Object.fromEntries(the_url.searchParams.entries());
    }

    if (!request_data.site_id) {
      return await onsuccess(request_data)
    }

    const user_id = session.user.id;

    // Verify user is site owner
    const { data: owner_site } = await supabase_admin
      .from('sites')
      .select('id')
      .match({ id: request_data.site_id, owner: user_id })
      .single();

    if (!owner_site) {

      const { data: collaborator } = await supabase_admin
        .from('collaborators')
        .select('id')
        .match({ owner_site: request_data.site_id, user: user_id })
        .single();

      if (!collaborator) return json({ deployment: null, error: 'Unauthorized' });
    }

    return await onsuccess(request_data)
  } catch (error) {
    console.error(error);
    return await onerror(error)
  }
};


