# Design Spec: Interactive Saving Target Hybrid

## 1. Overview
The **Interactive Saving Target Hybrid** is an upgrade to the existing `SavingTargetSection` component. It allows users to input a starting balance and estimated monthly expenses from their savings, while providing a real-time comparison between their "Goal Plan" (when they *want* to finish) and their "Actual Forecast" (when they *will* finish based on current member contributions).

## 2. Requirements
- **Inputs:**
  - `targetAmount`: Total savings goal (e.g., $24,000).
  - `targetDate`: Desired completion date.
  - `startingBalance`: Initial amount already saved.
  - `monthlyExpenses`: Estimated monthly spending from the savings account (e.g., $200/mo).
- **Interactive Splits:**
  - Users can override individual member contributions.
  - A "Reset to Income Split" button manually syncs the forecast with the income-based plan.
- **Visual Feedback:**
  - Display the "Plan" (Required monthly net and target date).
  - Display the "Forecast" (Actual monthly net and projected completion date).
  - Highlight the forecast based on whether it meets or lags behind the goal.

## 3. Implementation Plan

### A. Data Model & Logic
Expand the `useMemo` calculation block in `SavingTargetSection.jsx` to handle the dual-path calculation:

1. **The Plan (Goal-Based):**
   - `Remaining Goal` = `targetAmount - startingBalance`.
   - `Months Until Target` = Months from `today` to `targetDate`.
   - `Required Monthly Net` = `Remaining Goal / Months Until Target`.
   - `Ideal Group Contribution` = `Required Monthly Net + monthlyExpenses`.
   - `Ideal Member Splits` = `(Member Income / Total Group Income) * Ideal Group Contribution`.

2. **The Forecast (Reality-Based):**
   - `Actual Group Contribution` = Sum of all `manualContributions` (falling back to `Ideal Member Splits` if not overridden).
   - `Actual Monthly Net` = `Actual Group Contribution - monthlyExpenses`.
   - If `Actual Monthly Net <= 0`, the forecast is "Goal Never Reached".
   - `Projected Months` = `Remaining Goal / Actual Monthly Net`.
   - `Projected Completion Date` = `today + Projected Months`.

### B. UI & Component Structure
- **Input Grid (2x2):**
  - Use `Input` components for `targetAmount`, `startingBalance`, and `monthlyExpenses`.
  - Use the existing `Popover` + `Calendar` for `targetDate`.
- **Member Split Table:**
  - Row per member: Name, Income %, Ideal Split (read-only), **Manual Contribution (Input)**.
  - A "Reset" button to clear the `manualContributions` state.
- **Comparison Summary:**
  - A dedicated section (or sticky footer) comparing the **Plan** vs. the **Forecast**.
  - Use color coding (Green for on-track, Red for lagging).

### C. Testing Strategy
- **Logic Validation:** Verify that `monthlyExpenses` correctly reduces the "Actual Monthly Net".
- **Interaction Testing:** Ensure that modifying one member's contribution updates the "Projected Completion Date" in real-time.
- **Edge Cases:**
  - Test with `startingBalance >= targetAmount` (Goal already reached).
  - Test with `monthlyExpenses > contributions` (Infinite time to reach goal).
  - Test with `Zero total group income`.

## 4. Architecture
- **State:** 
  - `targetAmount` (number)
  - `targetDate` (Date)
  - `startingBalance` (number)
  - `monthlyExpenses` (number)
  - `manualContributions` (Object: `{ memberId: amount }`)
- **Persistence:** All state remains local to the `SavingTargetSection` component for now.

## 5. Success Criteria
- [ ] Users can enter `startingBalance` and `monthlyExpenses`.
- [ ] Users can modify individual member contributions.
- [ ] The projected date updates in real-time based on manual overrides.
- [ ] A "Reset" button clears manual overrides and reverts to income-based splits.
