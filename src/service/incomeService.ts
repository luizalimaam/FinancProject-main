import { supabase } from '../supabase';

export interface Income {
  id?: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  user_id?: string;
}

async function obterIdUsuarioAutenticado(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Usuário não autenticado');

  return user.id;
}

export async function listarReceitas(): Promise<Income[]> {
  const userId = await obterIdUsuarioAutenticado();
  const { data, error } = await supabase
    .from('receitas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false });

  if (error) throw error;

  return data as Income[];
}

export async function criarReceita(income: Income): Promise<Income> {
  const userId = await obterIdUsuarioAutenticado();

  const { data, error } = await supabase
    .from('receitas')
    .insert({
      ...income,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Income;
}

export async function atualizarReceita(id: string, income: Partial<Income>): Promise<Income> {
  const userId = await obterIdUsuarioAutenticado();
  const { data, error } = await supabase
    .from('receitas')
    .update(income)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return data as Income;
}

export async function excluirReceita(id: string): Promise<void> {
  const userId = await obterIdUsuarioAutenticado();
  const { error } = await supabase.from('receitas').delete().eq('id', id).eq('user_id', userId);

  if (error) throw error;
}
