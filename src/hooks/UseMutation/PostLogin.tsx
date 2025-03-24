import { useMutation } from '@tanstack/react-query';
import { api } from '../../config/api';

interface FormCreateLoginType {
  email: string;
  password: string;
}

export const CreateLogin = () => {
  return useMutation({
    mutationFn: async (form: FormCreateLoginType) => {
      const res = await api.post('/auth/login', form); 
      return res.data;
    },
  });
};