import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormDeleteDrinkType {
    id_Snack: number;
    namaSnack: string;
    harga: number;
    stock: number;
}


export const DeleteSnack = () => {
    return useMutation({
        mutationFn: async (id_Snack: number) => {
            const res = await api.delete(`/Snack/${id_Snack}`);
            return res.data;
        }
    })
}