import { supabase } from '../lib/supabase';

export const fixDemoProductPrice = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update({ precio: 100.00 })
      .eq('nombre', 'Demo')
      .select();

    if (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en fixDemoProductPrice:', error);
    throw error;
  }
};