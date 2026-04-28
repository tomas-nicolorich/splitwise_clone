import { BudgetCategory, Income, User, Expense } from '../api/types';

type MemoizedFn<T> = (groupId: string, version: string, ...args: any[]) => T;

function memoize<T>(fn: (...args: any[]) => T): MemoizedFn<T> {
    const cache = new Map<string, T>();
    return function(groupId: string, version: string, ...args: any[]) {
        const key = `${groupId}-${version}`;
        if (cache.has(key)) {
            return cache.get(key) as T;
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}

export interface CategorySplit {
    userId: string;
    share: number;
    pct: number;
    originalShare: number;
}

export interface CategorySplits {
    [categoryId: string]: CategorySplit[];
}

export function calculateCategorySplits(
    categories: BudgetCategory[],
    rawIncomes: Income[],
    members: User[],
    allExpenses: Expense[] = []
): CategorySplits {
    const incomesMap = new Map<string, number>();
    (rawIncomes || []).forEach(inc => {
        if (inc && inc.user) {
            incomesMap.set(String(inc.user), (incomesMap.get(String(inc.user)) || 0) + Number(inc.amount || 0));
        }
    });

    const getCategoryMembers = (cat: BudgetCategory): string[] => {
        if (!cat.members || cat.members.length === 0) {
            return members.map(m => String(m.id));
        }
        return cat.members.map(m => String(m));
    };

    const transfers = (allExpenses || []).filter(e => e.description?.startsWith('[BUDGET_TRANSFER]'));

    const splits: CategorySplits = {};
    
    if (!categories || !Array.isArray(categories)) return splits;

    categories.forEach(cat => {
        const catMembers = getCategoryMembers(cat);
        const totalAmount = Number(cat.amount);
        
        // Filter incomes to only include members of this category
        const relevantIncomes = catMembers.map(userId => ({
            userId,
            amount: incomesMap.get(userId) || 0
        }));
        
        const totalIncome = relevantIncomes.reduce((sum, i) => sum + i.amount, 0);

        if (totalIncome === 0) {
            // If no income, everyone gets 0 share
            splits[String(cat.id)] = catMembers.map(userId => ({
                userId,
                share: 0,
                pct: 0,
                originalShare: 0
            }));
        } else {
            // 1. Calculate base shares and remainders
            let targetShares = relevantIncomes.map(i => {
                const exactPct = (i.amount / totalIncome) * 100;
                const exactShare = (i.amount / totalIncome) * totalAmount;
                return {
                    userId: i.userId,
                    exactPct,
                    exactShare,
                    roundedShare: Math.floor(exactShare),
                    remainder: exactShare - Math.floor(exactShare)
                };
            });

            // 2. Distribute remainder using Largest Remainder Method
            let currentTotalShare = targetShares.reduce((sum, s) => sum + s.roundedShare, 0);
            let shareDiff = Math.round(totalAmount) - currentTotalShare;
            
            const sortedByRemainder = [...targetShares].sort((a, b) => b.remainder - a.remainder);
            for (let i = 0; i < shareDiff; i++) {
                const target = sortedByRemainder[i % sortedByRemainder.length];
                const s = targetShares.find(x => x.userId === target.userId);
                if (s) s.roundedShare += 1;
            }

            // 3. Set percentages (just for display/info)
            splits[String(cat.id)] = targetShares.map(s => ({
                userId: s.userId,
                share: s.roundedShare,
                pct: Math.round(s.exactPct), // Simplified percentage
                originalShare: s.roundedShare
            }));
        }

        // 4. Apply Budget Transfers
        const catTransfers = transfers.filter(t => String(t.category_id) === String(cat.id));
        const currentSplits = splits[String(cat.id)];
        
        catTransfers.forEach(t => {
            const senderId = String(t.paid_by);
            const toMatch = (t.description || '').match(/TO:(\d+)/);
            const receiverId = toMatch ? String(toMatch[1]) : null;
            const amount = Number(t.amount);

            const sender = currentSplits.find(s => s.userId === senderId);
            const receiver = receiverId ? currentSplits.find(s => s.userId === receiverId) : null;

            if (sender) sender.share -= amount;
            if (receiver) receiver.share += amount;
        });
    });
    
    return splits;
}

export const calculateCategorySplitsOptimized = memoize(calculateCategorySplits);
