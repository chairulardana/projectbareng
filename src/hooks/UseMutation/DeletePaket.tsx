import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface  FormDeletePaketType {
    id_Paket: number;
    nama_Paket: string;
    id_Kebab: number;
    id_Snack: number;
    id_Drink: number;
    harga_Paket: number;
    diskon: number;
    harga_Paket_After_Diskon: number;
}

export const DeletePaket = () => {
    return useMutation({
        mutationFn: async (id_Paket: number) => {
            const res = await api.delete(`/PaketMakanan/${id_Paket}`);
            return res.data;
        }
    })
}