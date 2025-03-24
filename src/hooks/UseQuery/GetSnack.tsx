import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetSnack = () => {
    return useQuery({ queryKey: ["get-snack"], queryFn: async () => {
        const res = await api.get("/Snack") 
        return res.data;
    }});
};  