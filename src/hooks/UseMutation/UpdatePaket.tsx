import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";


interface FormUpdatePaketType {
    id_Paket: number;
    nama_Paket: string;
    id_Kebab: number;
    id_Snack: number;
    id_Drink: number;
    harga_Paket: number;
    diskon: number;
    harga_Paket_After_Diskon: number;
    stok: number;
    image: string;
}

export const UpdatePaket = () => {
    return useMutation({
        mutationFn: async (form: FormUpdatePaketType) => {
        const res = await api.put(`/PaketMakanan/${form.id_Paket}`, form);
        return res.data
    },
});
}