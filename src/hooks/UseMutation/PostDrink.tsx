import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface FormCreateDrinkType {
    nama_Minuman: string;
    harga: number;
    suhu: string;
    stock: number;
    image: string;
}

export const useCreateDrink = () => {
    return useMutation({
        mutationFn: async (data: FormCreateDrinkType) => {
            // Make sure the API endpoint is correct and does not include id_Drink
            const response = await api.post('/Drink', data);
            return response.data;
        },
    });
};
