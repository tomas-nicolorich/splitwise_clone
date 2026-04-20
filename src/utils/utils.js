import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const isIframe = window.self !== window.top;

/**
 * Gets a user's name from a list of members.
 * @param {string|number} userId - The user ID to look up.
 * @param {Array} members - The list of group members.
 * @returns {string} - The user's name or "Unknown User".
 */
export function getUserName(userId, members) {
    if (!members) return "Unknown User";
    const member = members.find(m => String(m.id) === String(userId));
    return member ? member.name : "Unknown User";
}

/**
 * Deduplicates and maps incomes by user ID.
 * @param {Array} rawIncomes - The raw income entries.
 * @returns {Array} - The mapped and deduplicated income entries.
 */
export function getMappedIncomes(rawIncomes) {
    const map = new Map();
    (rawIncomes || []).forEach(inc => {
        if (inc && inc.user) map.set(inc.user.toString(), inc);
    });
    return Array.from(map.values());
}
