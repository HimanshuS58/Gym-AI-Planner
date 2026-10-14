import type { UserProfile } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002"

console.log("Base url: ", BASE_URL);

async function post(path: string, body: object) {
    const res = await fetch(`${BASE_URL}/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(
            (await res.json().catch(() => ({}))).error || "Request failed",
        )
    }

    return res.json();
}

async function get() {

}


export const api = {
    saveUserProfile: (
        userId: string,
        profileData: Omit<UserProfile, 'userId' | 'updatedAt'>
    ) => {
        return post("/profile", { userId, ...profileData })
    },

    generateUserPlan: (
        userId: string
    ) => {
        return post("/plan/generate", { userId })
    }
}