import { useMutation } from '@tanstack/react-query';
import { api } from '../../config/api';

interface FormUpdateKebabType {
  id_Kebab: number;
  nama_Kebab: string;
  harga: number;
  size: string;
  level: number;  // Level dalam bentuk angka
  stock: number;
}

export const UpdateKebab = () => {
  return useMutation({
    mutationFn: async (form: FormUpdateKebabType) => {
      console.log('Payload yang dikirim ke backend:');

      const res = await api.put(`/Kebab/${form.id_Kebab}`, form);
      return res.data;
    },
  });
}
