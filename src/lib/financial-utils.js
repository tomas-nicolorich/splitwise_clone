
export function calculateCategorySplits(categories, rawIncomes, members) {
    const incomes = (() => {
        const map = new Map();
        (rawIncomes || []).forEach(inc => {
            if (inc && inc.user) map.set(inc.user.toString(), inc);
        });
        return Array.from(map.values());
    })();

    const getCategoryMembers = (cat) => {
        if (!cat.members || cat.members.length === 0) {
            return members.map(m => m.id);
        }
        return cat.members;
    };

    const splits = {};
    
    if (!categories || !Array.isArray(categories)) return splits;

    categories.forEach(cat => {
        const catMembers = getCategoryMembers(cat);
        const relevantIncomes = incomes.filter(i => catMembers.includes(i.user) && (i.amount || 0) > 0);
        const relevantTotalIncome = relevantIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);

        if (relevantTotalIncome === 0 || relevantIncomes.length === 0) {
            splits[cat.id] = [];
            return;
        }

        // 1. Calculate rounded percentages that sum to 100
        let pcts = relevantIncomes.map(income => {
            const exactPct = (income.amount / relevantTotalIncome) * 100;
            return {
                userId: income.user,
                exactPct,
                roundedPct: Math.floor(exactPct),
                remainder: exactPct - Math.floor(exactPct)
            };
        });

        let totalRoundedPct = pcts.reduce((sum, p) => sum + p.roundedPct, 0);
        let pctDiff = 100 - totalRoundedPct;
        const sortedPcts = [...pcts].sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < pctDiff; i++) {
            const target = sortedPcts[i % sortedPcts.length];
            const p = pcts.find(x => x.userId === target.userId);
            p.roundedPct += 1;
        }

        // 2. Calculate integer shares that sum to cat.amount based on rounded percentages
        let targetShares = pcts.map(p => {
            const targetShare = (p.roundedPct / 100) * cat.amount;
            return {
                userId: p.userId,
                pct: p.roundedPct,
                targetShare,
                roundedShare: Math.floor(targetShare),
                remainder: targetShare - Math.floor(targetShare)
            };
        });

        let totalRoundedShare = targetShares.reduce((sum, s) => sum + s.roundedShare, 0);
        let shareDiff = Math.round(cat.amount) - totalRoundedShare;
        const sortedShares = [...targetShares].sort((a, b) => b.remainder - a.remainder);
        for (let i = 0; i < shareDiff; i++) {
            const target = sortedShares[i % sortedShares.length];
            const s = targetShares.find(x => x.userId === target.userId);
            s.roundedShare += 1;
        }

        splits[cat.id] = targetShares.map(s => ({
            userId: s.userId,
            share: s.roundedShare,
            pct: s.pct
        }));
    });
    return splits;
}
