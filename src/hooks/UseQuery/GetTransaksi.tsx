import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetTransaksi = () => {
    return useQuery({ queryKey: ['get-transaksi'],queryFn: async () => {
        const res = await api.get('/DetailTransaksi')
        return res.data
    }})
}