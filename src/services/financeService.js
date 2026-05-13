import { supabase } from './supabaseClient'

const EXPENSES_TABLE = 'expenses'
const INCOMES_TABLE = 'incomes'
const BUDGETS_TABLE = 'budgets'
const RECURRING_TABLE = 'recurring_templates'

async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) throw new Error('Usuário não autenticado.')
  return session.user.id
}

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchIncomes() {
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createExpense(payload) {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .insert({ ...payload, user_id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExpense(id, payload) {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase.from(EXPENSES_TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function createIncome(payload) {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .insert({ ...payload, user_id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateIncome(id, payload) {
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteIncome(id) {
  const { error } = await supabase.from(INCOMES_TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function fetchBudgets() {
  const { data, error } = await supabase
    .from(BUDGETS_TABLE)
    .select('*')
    .order('category')
  if (error) throw error
  return data || []
}

export async function upsertBudget(category, limit_amount) {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from(BUDGETS_TABLE)
    .upsert({ user_id, category, limit_amount }, { onConflict: 'user_id,category' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBudget(id) {
  const { error } = await supabase.from(BUDGETS_TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function fetchRecurringTemplates() {
  const { data, error } = await supabase
    .from(RECURRING_TABLE)
    .select('*')
    .order('description')
  if (error) throw error
  return data || []
}

export async function createRecurringTemplate(payload) {
  const user_id = await getUserId()
  const { data, error } = await supabase
    .from(RECURRING_TABLE)
    .insert({ ...payload, user_id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRecurringTemplate(id, payload) {
  const { data, error } = await supabase
    .from(RECURRING_TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRecurringTemplate(id) {
  const { error } = await supabase.from(RECURRING_TABLE).delete().eq('id', id)
  if (error) throw error
}
