import { supabase } from '@/lib/supabase-client';

// Vercel Serverless Function based backend (Prisma + Supabase)
const API_BASE_URL = '/api';

/**
 * @typedef {Object} FetchAPIOptions
 * @property {any} [providedSession]
 * @property {string} [method]
 * @property {Object} [headers]
 * @property {any} [body]
 */

/**
 * @param {string} endpoint
 * @param {FetchAPIOptions} [options]
 */
const fetchAPI = async (endpoint, options = {}) => {
  const { providedSession, ...otherOptions } = /** @type {any} */ (options);
  
  // Use provided session or fetch current one
  let session = providedSession;
  if (!session) {
    const sessionRes = await supabase.auth.getSession();
    session = sessionRes.data.session;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
    ...otherOptions.headers,
  };

  const url = `${API_BASE_URL}/${endpoint}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      ...otherOptions,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      console.error(`[API] Error from ${url}:`, data.error);
      throw new Error(data.error || 'API Error');
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[API] Request to ${url} timed out`);
      throw new Error('Request timed out');
    }
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
};

const createEntityStore = (entityName, specificEndpoint = null) => ({
  list: async (sort, group_id = null) => {
    if (specificEndpoint && !sort) {
        return fetchAPI(`${specificEndpoint}?operation=list${group_id ? `&group_id=${group_id}` : ''}`, { method: 'GET' });
    }
    return fetchAPI(`data?entity=${entityName}&operation=list`, {
      method: 'POST',
      body: JSON.stringify({ sort }),
    });
  },
  filter: async (criteria) => {
    return fetchAPI(`data?entity=${entityName}&operation=filter`, {
      method: 'POST',
      body: JSON.stringify({ criteria }),
    });
  },
  create: async (data, group_id = null) => {
    if (specificEndpoint) {
        return fetchAPI(`${specificEndpoint}?operation=create${group_id ? `&group_id=${group_id}` : ''}`, {
            method: 'POST',
            body: JSON.stringify({ data })
        });
    }
    return fetchAPI(`data?entity=${entityName}&operation=create`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },
  update: async (id, data) => {
    return fetchAPI(`data?entity=${entityName}&operation=update`, {
      method: 'POST',
      body: JSON.stringify({ id, data }),
    });
  },
  delete: async (id, group_id = null) => {
    if (specificEndpoint) {
        return fetchAPI(`${specificEndpoint}?operation=delete&id=${id}${group_id ? `&group_id=${group_id}` : ''}`, { method: 'DELETE' });
    }
    return fetchAPI(`data?entity=${entityName}&operation=delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
});

export const base44 = {
  auth: {
    me: async (providedSession = null) => {
      try {
        let session = providedSession;
        if (!session) {
          const sessionRes = await supabase.auth.getSession();
          session = sessionRes.data.session;
        }

        if (session?.user) {
          // Fetch the user from public.Users table by auth_id
          const dbUsers = await fetchAPI('data?entity=Users&operation=filter', {
            method: 'POST',
            providedSession: session,
            body: JSON.stringify({
              criteria: { auth_id: session.user.id }
            })
          });

          if (dbUsers && dbUsers.length > 0) {
            const dbUser = dbUsers[0];
            return {
              id: dbUser.id.toString(),
              name: dbUser.name,
              full_name: dbUser.name,
              email: session.user.email
            };
          }

          // Fallback if not found in public.Users (e.g. if the trigger hasn't finished)
          // Try to fetch via backend 'auth' operation which might auto-create
          try {
            const backendUser = await fetchAPI(`auth?operation=me&auth_id=${session.user.id}`, {
              providedSession: session
            });
            if (backendUser && backendUser.id) {
              return {
                ...backendUser,
                email: session.user.email,
                full_name: backendUser.name
              };
            }
          } catch (backendError) {
            console.warn('[Auth.me] Backend me failed, using fallback:', backendError);
          }

          return {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            email: session.user.email
          };
        }
        
        return await fetchAPI('auth?operation=me', { providedSession: session });
      } catch (e) {
        console.error('[Auth.me] Error:', e);
        throw e;
      }
    },
    updateMe: async (data) => {
      const { data: { session } } = await supabase.auth.getSession();
      return fetchAPI('auth?operation=updateMe', {
        method: 'POST',
        body: JSON.stringify({ data, auth_id: session?.user?.id }),
      });
    },
    inviteUserByEmail: async (email) => {
      return fetchAPI('auth?operation=invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    logout: async (redirect) => {
      await supabase.auth.signOut();
      if (redirect) window.location.href = '/login';
    },
    redirectToLogin: (redirect) => {
      window.location.href = '/login';
    },
  },
  entities: {
    Group: createEntityStore('Group', 'groups'),
    Income: createEntityStore('Income', 'incomes'),
    BudgetCategory: createEntityStore('BudgetCategory', 'categories'),
    Expense: createEntityStore('Expense', 'expenses'),
    Users: {
      ...createEntityStore('Users'),
      filter: async (criteria) => {
        return fetchAPI(`data?entity=Users&operation=filter`, {
          method: 'POST',
          body: JSON.stringify({ criteria }),
        });
      },
    },
  },
  users: {
    inviteUser: async (nameOrId, role) => {
      // In a real app, this might be an API call to create a record or send an email
      return true;
    },
  },
  appLogs: {
    logUserInApp: async (page) => {
      // Logic for logging user app usage
    },
  },
};
