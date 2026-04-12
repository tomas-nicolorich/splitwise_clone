# Interactive Saving Target Hybrid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the saving target calculator to include starting balance, monthly expenses, and interactive member contribution overrides with real-time forecasting.

**Architecture:** Expand `SavingTargetSection.jsx` state to handle new inputs and manual overrides. Use a unified `useMemo` block to derive both the "Ideal Plan" (goal-based) and "Actual Forecast" (reality-based) values.

**Tech Stack:** React, TailwindCSS, Lucide-react (icons), date-fns.

---

### Task 1: Expand Component State

**Files:**
- Modify: `src/components/group-detail/SavingTargetSection.jsx`

- [ ] **Step 1: Add new state variables for starting balance, monthly expenses, and manual contributions.**

```javascript
// src/components/group-detail/SavingTargetSection.jsx

// Inside SavingTargetSection component:
const [startingBalance, setStartingBalance] = useState("");
const [monthlyExpenses, setMonthlyExpenses] = useState("");
const [manualContributions, setManualContributions] = useState({}); // { memberId: amount }
```

- [ ] **Step 2: Commit initial state changes.**

```bash
git add src/components/group-detail/SavingTargetSection.jsx
git commit -m "feat: add state for starting balance, expenses, and manual overrides"
```

---

### Task 2: Implement Hybrid Calculation Logic

**Files:**
- Modify: `src/components/group-detail/SavingTargetSection.jsx`

- [ ] **Step 1: Update the `calculation` useMemo to handle the new logic.**

```javascript
// src/components/group-detail/SavingTargetSection.jsx

const calculation = useMemo(() => {
    const amount = parseFloat(targetAmount);
    const startBal = parseFloat(startingBalance) || 0;
    const monthlyExp = parseFloat(monthlyExpenses) || 0;
    
    if (isNaN(amount) || !targetDate || members.length === 0) return null;

    const today = new Date();
    const goalDate = new Date(targetDate);
    
    // Inclusive month calculation
    const monthsRemaining = (goalDate.getFullYear() - today.getFullYear()) * 12 + (goalDate.getMonth() - today.getMonth()) + 1;
    
    if (monthsRemaining <= 0) return { error: "Target date must be in the future" };

    const remainingGoal = amount - startBal;
    if (remainingGoal <= 0) return { error: "Goal already reached with starting balance!" };

    // 1. The Plan (Goal-Based)
    const requiredMonthlyNet = remainingGoal / monthsRemaining;
    const idealGroupContribution = requiredMonthlyNet + monthlyExp;
    const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

    const idealBreakdown = members.map(member => {
        const income = incomes.find(i => i.user === member.id)?.amount || 0;
        const incomePct = totalIncome > 0 ? (income / totalIncome) : 0;
        const contribution = incomePct * idealGroupContribution;
        return {
            id: member.id,
            name: member.name,
            idealContribution: contribution,
            income,
            incomePct: incomePct * 100
        };
    });

    // 2. The Forecast (Reality-Based)
    const actualGroupContribution = members.reduce((sum, member) => {
        const manual = parseFloat(manualContributions[member.id]);
        if (!isNaN(manual)) return sum + manual;
        
        // Fallback to ideal split if not overridden
        const ideal = idealBreakdown.find(m => m.id === member.id)?.idealContribution || 0;
        return sum + ideal;
    }, 0);

    const actualMonthlyNet = actualGroupContribution - monthlyExp;
    
    let projection = null;
    if (actualMonthlyNet <= 0) {
        projection = { error: "Goal never reached (Expenses ≥ Contributions)" };
    } else {
        const projectedMonths = remainingGoal / actualMonthlyNet;
        const projectedDate = new Date();
        projectedDate.setMonth(today.getMonth() + Math.ceil(projectedMonths));
        projection = {
            projectedMonths: Math.ceil(projectedMonths),
            projectedDate,
            actualMonthlyNet,
            actualGroupContribution
        };
    }

    return {
        monthsRemaining,
        requiredMonthlyNet,
        idealGroupContribution,
        idealBreakdown,
        projection,
        remainingGoal
    };
}, [targetAmount, targetDate, startingBalance, monthlyExpenses, members, incomes, manualContributions]);
```

- [ ] **Step 2: Commit calculation logic.**

```bash
git add src/components/group-detail/SavingTargetSection.jsx
git commit -m "feat: implement dual-path calculation for plan and forecast"
```

---

### Task 3: Update UI - Input Grid & Reset Button

**Files:**
- Modify: `src/components/group-detail/SavingTargetSection.jsx`

- [ ] **Step 1: Add Starting Balance and Monthly Expenses inputs.**

```javascript
// src/components/group-detail/SavingTargetSection.jsx
// Update the grid layout to include the new fields

<div class="grid grid-cols-2 gap-4">
    {/* Existing Target Amount */}
    {/* Existing Target Date */}
    
    <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Starting Balance</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input
                type="number"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="pl-7 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                placeholder="0"
            />
        </div>
    </div>
    <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 ml-1">Monthly Expenses (from savings)</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                className="pl-7 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                placeholder="0"
            />
        </div>
    </div>
</div>
```

- [ ] **Step 2: Add the "Reset to Income Split" button.**

```javascript
// Add before the member list
<div className="flex justify-between items-center mb-2">
    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-1">
        <Users className="w-3 h-3" /> Monthly Split & Forecast
    </label>
    <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 text-[10px] px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        onClick={() => setManualContributions({})}
    >
        Reset to Income Split
    </Button>
</div>
```

- [ ] **Step 3: Commit UI input changes.**

```bash
git add src/components/group-detail/SavingTargetSection.jsx
git commit -m "feat: add starting balance, expenses inputs and reset button"
```

---

### Task 4: Update Member Rows with Editable Inputs

**Files:**
- Modify: `src/components/group-detail/SavingTargetSection.jsx`

- [ ] **Step 1: Replace the static member row with an interactive one.**

```javascript
// src/components/group-detail/SavingTargetSection.jsx

{calculation.idealBreakdown.map(member => (
    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/50">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{member.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Income Split: {member.incomePct.toFixed(1)}% (${member.idealContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })})
            </p>
        </div>
        <div className="relative w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <Input
                type="number"
                value={manualContributions[member.id] !== undefined ? manualContributions[member.id] : Math.round(member.idealContribution)}
                onChange={(e) => setManualContributions(prev => ({
                    ...prev,
                    [member.id]: e.target.value
                }))}
                className="pl-5 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200"
            />
        </div>
    </div>
))}
```

- [ ] **Step 2: Commit interactive member rows.**

```bash
git add src/components/group-detail/SavingTargetSection.jsx
git commit -m "feat: make member contributions interactive"
```

---

### Task 5: Add Comparison Summary Card

**Files:**
- Modify: `src/components/group-detail/SavingTargetSection.jsx`

- [ ] **Step 1: Implement the Plan vs Forecast comparison view.**

```javascript
// src/components/group-detail/SavingTargetSection.jsx

{calculation.projection && (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* The Plan */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">The Goal (Plan)</p>
            <div className="space-y-1">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{format(targetDate, "MMM yyyy")}</p>
                <p className="text-xs text-slate-500">Need ${calculation.idealGroupContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo total</p>
            </div>
        </div>

        {/* The Forecast */}
        <div className={cn(
            "p-4 rounded-2xl border transition-colors",
            calculation.projection.error 
                ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                : calculation.projection.projectedDate <= targetDate
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
        )}>
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">The Forecast (Reality)</p>
            {calculation.projection.error ? (
                <div className="space-y-1">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">Never Reached</p>
                    <p className="text-xs text-red-500/80">Expenses exceed contributions</p>
                </div>
            ) : (
                <div className="space-y-1">
                    <p className={cn(
                        "text-xl font-bold",
                        calculation.projection.projectedDate <= targetDate ? "text-emerald-600" : "text-amber-600"
                    )}>
                        {format(calculation.projection.projectedDate, "MMM yyyy")}
                    </p>
                    <p className="text-xs text-slate-500">
                        At ${calculation.projection.actualGroupContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo actual
                    </p>
                </div>
            )}
        </div>
    </div>
)}
```

- [ ] **Step 2: Final commit.**

```bash
git add src/components/group-detail/SavingTargetSection.jsx
git commit -m "feat: add plan vs forecast comparison summary"
```
