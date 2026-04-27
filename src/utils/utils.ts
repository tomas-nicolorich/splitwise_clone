import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User, Income } from "../api/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const isIframe = typeof window !== 'undefined' ? window.self !== window.top : false;

/**
 * Gets a user's name from a list of members.
 * @param {string|number} userId - The user ID to look up.
 * @param {User[]} members - The list of group members.
 * @returns {string} - The user's name or "Unknown User".
 */
export function getUserName(userId: string | number, members: User[]): string {
    if (!members) return "Unknown User";
    const member = members.find(m => String(m.id) === String(userId));
    return member ? member.name : "Unknown User";
}

/**
 * Deduplicates and maps incomes by user ID.
 * @param {Income[]} rawIncomes - The raw income entries.
 * @returns {Income[]} - The mapped and deduplicated income entries.
 */
export function getMappedIncomes(rawIncomes: Income[]): Income[] {
    const map = new Map<string, Income>();
    (rawIncomes || []).forEach(inc => {
        if (inc && inc.user) map.set(inc.user.toString(), inc);
    });
    return Array.from(map.values());
}
