import type { User } from "@neondatabase/neon-js/auth/types";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { authClient } from "../lib/neon";
import type { TrainingPlan, UserProfile } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
    user: User | null;
    plan: TrainingPlan | null;
    isLoading: boolean;
    saveProfile: (profile: Omit<UserProfile, 'userId' | 'updatedAt'>) => Promise<void>;
    generatePlan: () => Promise<void>;
    refreshData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {

    const [neonUser, setNeonUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [plan, setPlan] = useState<TrainingPlan | null>(null);

// A ref to track if a data refresh is in progress, preventing multiple simultaneous refreshes.
    const isRefreshingDataRef = useRef(false);

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


    useEffect(() => {

        if(!isLoading){
            if(neonUser?.id){
                refreshData();
            } else {
                setPlan(null);
            }
            setIsLoading(false);
        }
    }, [neonUser?.id, isLoading])


// RefreshData memoized function to fetch the latest training plan for the authenticated user.
    const refreshData = useCallback(async()=>{

        if(!neonUser || isRefreshingDataRef.current) return // If there's no authenticated user or a refresh is already in progress, exit early.

        isRefreshingDataRef.current = true; // Set the flag to indicate that a refresh is in progress

        try{
            // fetch the plan
            const planData = await api.getCurrentPlan(neonUser.id).catch(() => null);
            
            if(planData){
                setPlan({
                    id: planData.id,
                    userId: planData.userId,
                    overview: planData.planJson.overview,
                    weeklySchedule: planData.planJson.weeklySchedule,
                    progression: planData.planJson.progression,
                    version: planData.version,
                    createdAt: planData.createdAt,
                })
            }
        }
        catch(error){
            console.error("Error refreshing data:", error);
        }
        finally{
            isRefreshingDataRef.current = false;
        }
    }, [neonUser?.id])


    async function saveProfile(profileData: Omit<UserProfile, 'userId' | 'updatedAt'>){
        if(!neonUser){
            throw new Error("User must be authenticated to save profile");
        }
        
        await api.saveUserProfile(neonUser.id, profileData);
        await refreshData();
    }

    async function generatePlan() {
        if(!neonUser){
            throw new Error("User must be authenticated to generate plan");
        }
        
        await api.generateUserPlan(neonUser.id);
        await refreshData();
    }

    return (
        <AuthContext.Provider value={{user: neonUser, plan, isLoading, saveProfile, generatePlan, refreshData }}>
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