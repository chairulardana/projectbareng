import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";


export const  GetPaket = () => {
    return useQuery({ queryKey: ['get-paket'],queryFn: async () => {
        const res = await api.get('/PaketMakanan')
        return res.data;
    }});
};