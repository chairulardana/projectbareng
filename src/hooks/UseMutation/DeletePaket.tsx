import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";


export const DeletePaket = () => {
    return useMutation({
        mutationFn: async (id_Paket: number) => {
            const res = await api.delete(`/PaketMakanan/${id_Paket}`);
            return res.data;
        }
    })
}