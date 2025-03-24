import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export function GetLogin() {
    return useQuery({ queryKey: ['get-users'], queryFn: async () =>{
        const res = await api.get('/users');
        return res.data
    }})
}

