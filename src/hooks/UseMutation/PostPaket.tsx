import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormCreatePaketType {
    id_Paket: number;
    nama_Paket: string;
    id_Kebab: number;
    id_Snack: number;
    id_Drink: number;
    harga_Paket: number;
    diskon: number;
    harga_Paket_After_Diskon: number;
}

export const CreatePaket = () => {
    return useMutation({
        mutationFn: async ( form : FormCreatePaketType) => {
            const res = await api.post('/PaketMakanan', form);
            return res.data;
        }
    })
}