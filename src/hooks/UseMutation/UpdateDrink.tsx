import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormUpdateDrinkType {
    id_Drink : number;
    nama_Minuman : string;
    harga :number;
    suhu : string;
    stock : number;
    image: string;
}

export const useUpdateDrink = () => {
    return useMutation({
        mutationFn: async (form: FormUpdateDrinkType) => {
            console.log('Coba Check BackEnd Kalo Salah')

            const res = await api.put(`/Drink/${form.id_Drink}`, form);
            return res.data;
         },
        });
    }
