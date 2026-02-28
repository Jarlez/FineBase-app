import { supabase } from './supabaseClient'

const EXPENSES_TABLE = 'expenses'
const INCOMES_TABLE = 'incomes'

export async function fetchExpenses() {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function fetchIncomes() {
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function createExpense(payload) {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateExpense(id, payload) {
  const { data, error } = await supabase
    .from(EXPENSES_TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from(EXPENSES_TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function createIncome(payload) {
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateIncome(id, payload) {
  const { data, error } = await supabase
    .from(INCOMES_TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteIncome(id) {
  const { error } = await supabase
    .from(INCOMES_TABLE)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

