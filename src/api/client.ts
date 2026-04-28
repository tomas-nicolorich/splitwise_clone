import { supabase } from '@/lib/supabase-client';
import { User, Group, Income, BudgetCategory, Expense } from './types';

// Vercel Serverless Function based backend (Prisma + Supabase)
const API_BASE_URL = '/api';

export interface FetchAPIOptions {
  providedSession?: any;
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Low-level API fetch wrapper with authentication and timeout.
 */
const fetchAPI = async <T>(endpoint: string, options: FetchAPIOptions = {}): Promise<T> => {
  const { providedSession, ...otherOptions } = options;
  
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
      signal: options.signal || controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      console.error(`[API] Error from ${url}:`, data.error);
      throw new Error(data.error || 'API Error');
    }
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[API] Request to ${url} timed out`);
      throw new Error('Request timed out');
    }
    console.error(`[API] Fetch error for ${url}:`, error);
    throw error;
  }
};

export interface EntityStore<T> {
  list: (sort?: any, group_id?: string | null) => Promise<T[]>;
  filter: (criteria: any) => Promise<T[]>;
  create: (data: any, group_id?: string | null) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  delete: (id: string, group_id?: string | null) => Promise<{ success: boolean }>;
}

const createEntityStore = <T>(entityName: string, specificEndpoint: string | null = null): EntityStore<T> => ({
  list: async (sort, group_id = null) => {
    if (specificEndpoint && !sort) {
        return fetchAPI<T[]>(`${specificEndpoint}?operation=list${group_id ? `&group_id=${group_id}` : ''}`, { method: 'GET' });
    }
    return fetchAPI<T[]>(`data?entity=${entityName}&operation=list`, {
      method: 'POST',
      body: JSON.stringify({ sort }),
    });
  },
  filter: async (criteria) => {
    return fetchAPI<T[]>(`data?entity=${entityName}&operation=filter`, {
      method: 'POST',
      body: JSON.stringify({ criteria }),
    });
  },
  create: async (data, group_id = null) => {
    if (specificEndpoint) {
        return fetchAPI<T>(`${specificEndpoint}?operation=create${group_id ? `&group_id=${group_id}` : ''}`, {
            method: 'POST',
            body: JSON.stringify({ data })
        });
    }
    return fetchAPI<T>(`data?entity=${entityName}&operation=create`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },
  update: async (id, data) => {
    return fetchAPI<T>(`data?entity=${entityName}&operation=update`, {
      method: 'POST',
      body: JSON.stringify({ id, data }),
    });
  },
  delete: async (id, group_id = null) => {
    if (specificEndpoint) {
        return fetchAPI<{ success: boolean }>(`${specificEndpoint}?operation=delete&id=${id}${group_id ? `&group_id=${group_id}` : ''}`, { method: 'DELETE' });
    }
    return fetchAPI<{ success: boolean }>(`data?entity=${entityName}&operation=delete`, {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
});

export const base44 = {
  auth: {
    me: async (providedSession: any = null): Promise<User & { email?: string, full_name?: string }> => {
      try {
        let session = providedSession;
        if (!session) {
          const sessionRes = await supabase.auth.getSession();
          session = sessionRes.data.session;
        }

        if (session?.user) {
          // Fetch the user from public.Users table by auth_id
          const dbUsers = await fetchAPI<User[]>('data?entity=Users&operation=filter', {
            method: 'POST',
            providedSession: session,
            body: JSON.stringify({
              criteria: { auth_id: session.user.id }
            })
          });

          if (dbUsers && dbUsers.length > 0) {
            const dbUser = dbUsers[0];
            return {
              ...dbUser,
              id: dbUser.id.toString(),
              full_name: dbUser.name,
              email: session.user.email
            };
          }

          // Fallback if not found in public.Users (e.g. if the trigger hasn't finished)
          try {
            const backendUser = await fetchAPI<any>(`auth?operation=me&auth_id=${session.user.id}`, {
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
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            created_at: session.user.created_at,
            auth_id: session.user.id,
            icon: session.user.user_metadata?.avatar_url || null
          };
        }
        
        return await fetchAPI<any>('auth?operation=me', { providedSession: session });
      } catch (e) {
        console.error('[Auth.me] Error:', e);
        throw e;
      }
    },
    updateMe: async (data: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      return fetchAPI('auth?operation=updateMe', {
        method: 'POST',
        body: JSON.stringify({ data, auth_id: session?.user?.id }),
      });
    },
    inviteUserByEmail: async (email: string) => {
      return fetchAPI('auth?operation=invite', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    logout: async (redirect?: boolean) => {
      await supabase.auth.signOut();
      if (redirect) window.location.href = '/login';
    },
    redirectToLogin: (_redirect?: boolean) => {
      window.location.href = '/login';
    },
  },
  entities: {
    Group: createEntityStore<Group>('Group', 'groups'),
    Income: createEntityStore<Income>('Income', 'incomes'),
    BudgetCategory: createEntityStore<BudgetCategory>('BudgetCategory', 'categories'),
    Expense: createEntityStore<Expense>('Expense', 'expenses'),
    Users: {
      ...createEntityStore<User>('Users'),
      filter: async (criteria: any) => {
        return fetchAPI<User[]>(`data?entity=Users&operation=filter`, {
          method: 'POST',
          body: JSON.stringify({ criteria }),
        });
      },
    },
  },
  users: {
    inviteUser: async (_nameOrId: string, _role: string) => {
      return true;
    },
  },
  appLogs: {
    logUserInApp: async (_page: string) => {
      // Logic for logging user app usage
    },
  },
};
