// Local Storage based replacement for Base44 SDK
const STORAGE_KEY_PREFIX = 'splitwise_data_';

const getStore = (entity) => {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + entity);
    return data ? JSON.parse(data) : [];
};

const setStore = (entity, data) => {
    localStorage.setItem(STORAGE_KEY_PREFIX + entity, JSON.stringify(data));
};

const createEntityStore = (entityName) => ({
    list: async (sort) => {
        let items = getStore(entityName);
        if (sort === '-created_date') {
            items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return items;
    },
    filter: async (criteria) => {
        let items = getStore(entityName);
        return items.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    if (value.$in) return value.$in.includes(item[key]);
                }
                return item[key] === value;
            });
        });
    },
    create: async (data) => {
        const items = getStore(entityName);
        const newItem = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            created_date: new Date().toISOString()
        };
        items.push(newItem);
        setStore(entityName, items);
        return newItem;
    },
    update: async (id, data) => {
        const items = getStore(entityName);
        const index = items.findIndex(item => item.id === id);
        if (index > -1) {
            items[index] = { ...items[index], ...data };
            setStore(entityName, items);
            return items[index];
        }
        throw new Error(`${entityName} not found`);
    },
    delete: async (id) => {
        const items = getStore(entityName);
        const filtered = items.filter(item => item.id !== id);
        setStore(entityName, filtered);
        return true;
    }
});

const mockUser = {
    id: 'user_1',
    email: 'demo@example.com',
    full_name: 'Demo User',
    display_name: 'Demo User'
};

export const base44 = {
    auth: {
        me: async () => {
            const stored = localStorage.getItem('splitwise_user');
            if (stored) return JSON.parse(stored);
            localStorage.setItem('splitwise_user', JSON.stringify(mockUser));
            return mockUser;
        },
        updateMe: async (data) => {
            const user = await base44.auth.me();
            const updated = { ...user, ...data };
            localStorage.setItem('splitwise_user', JSON.stringify(updated));
            return updated;
        },
        logout: (redirect) => {
            localStorage.removeItem('splitwise_user');
            if (redirect) window.location.href = '/';
        },
        redirectToLogin: (redirect) => {
            // In local version, we just "log in" automatically or show a simple form
            base44.auth.me().then(() => {
                if (redirect) window.location.href = redirect;
            });
        }
    },
    entities: {
        Group: createEntityStore('groups'),
        Income: createEntityStore('income'),
        BudgetCategory: createEntityStore('budgets'),
        Expense: createEntityStore('expenses'),
        User: {
            ...createEntityStore('users'),
            filter: async (criteria) => {
                // Return mock user if searching by email
                if (criteria.email === mockUser.email || (criteria.email?.$in && criteria.email.$in.includes(mockUser.email))) {
                    return [mockUser];
                }
                return [];
            }
        }
    },
    users: {
        inviteUser: async (email, role) => {
            console.log('Inviting user:', email, role);
            return true;
        }
    },
    appLogs: {
        logUserInApp: async (page) => {
            console.log('User visited:', page);
        }
    }
};
