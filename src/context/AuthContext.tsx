import type { User } from "@neondatabase/neon-js/auth/types";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authClient } from "../lib/neon";
import type { UserProfile } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    saveProfile: (profile: Omit<UserProfile, 'userId' | 'updatedAt'>) => Promise<void>;
    generatePlan: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {

    const [neonUser, setNeonUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try{
                const result = await authClient.getSession();
                if(result && result.data?.user){
                    setNeonUser(result.data.user)
                }
                else{
                    setNeonUser(null)
                }
            }
            catch(error){
                setNeonUser(null)
            }
            finally{
                setIsLoading(false);
            }
        }

        loadUser()
    }, [])


    async function saveProfile(profileData: Omit<UserProfile, 'userId' | 'updatedAt'>){
        if(!neonUser){
            throw new Error("User must be authenticated to save profile");
        }
        
        await api.saveUserProfile(neonUser.id, profileData)
    }

    async function generatePlan() {
        if(!neonUser){
            throw new Error("User must be authenticated to generate plan");
        }
        
        await api.generateUserPlan(neonUser.id)
    }

    return (
        <AuthContext.Provider value={{user: neonUser, isLoading, saveProfile, generatePlan }}>
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth() {

    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}