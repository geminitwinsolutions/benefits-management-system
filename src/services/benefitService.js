// src/services/benefitService.js
import { supabase } from '../supabase';

// --- Tier Management ---
export const getTiers = async () => {
  const { data, error } = await supabase.from('tiers').select('*');
  if (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
  return data;
};

export const addTier = async (newTierData) => {
  const { data, error } = await supabase
    .from('tiers')
    .insert([newTierData])
    .select();

  if (error) {
    console.error('Error adding new tier:', error);
    return null;
  }
  return data[0];
};

export const updateTier = async (id, updatedTierData) => {
  const { data, error } = await supabase
    .from('tiers')
    .update(updatedTierData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating tier:', error);
    return null;
  }
  return data[0];
};

export const deleteTier = async (id) => {
  const { error } = await supabase
    .from('tiers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tier:', error);
    return false;
  }
  return true;
};

// --- Service & Fee Library ---
export const getServices = async () => {
  const { data, error } = await supabase.from('services').select('*');
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  return data;
};

export const addService = async (newServiceData) => {
  const { data, error } = await supabase
    .from('services')
    .insert([newServiceData])
    .select();
  if (error) {
    console.error('Error adding new service:', error);
    return null;
  }
  return data[0];
};

export const updateService = async (id, updatedServiceData) => {
  const { data, error } = await supabase
    .from('services')
    .update(updatedServiceData)
    .eq('id', id)
    .select();
  if (error) {
    console.error('Error updating service:', error);
    return null;
  }
  return data[0];
};

export const deleteService = async (id) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }
  return true;
};

// --- Client Management ---
export const getClients = async () => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data;
};

export const addClient = async (newClientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([newClientData])
    .select();
  if (error) {
    console.error('Error adding new client:', error);
    return null;
  }
  return data[0];
};

// This function gets the open enrollment settings from the database
export const getEnrollmentSettings = async () => {
  const { data, error } = await supabase.from('enrollment_settings').select('*').limit(1);
  if (error) {
    console.error('Error fetching enrollment settings:', error);
    return {
      start_date: null,
      end_date: null,
      is_active: false
    };
  }
  return data[0] || {};
};

// This function sets the open enrollment settings
export const setEnrollmentSettings = async (settings) => {
  const { data, error } = await supabase
    .from('enrollment_settings')
    .upsert(settings, { onConflict: 'id' }) // Upsert ensures we update or create
    .select();
  if (error) {
    console.error('Error setting enrollment settings:', error);
    return null;
  }
  return data[0];
};

// --- Enrollment Periods ---
export const getEnrollmentPeriods = async () => {
  const { data, error } = await supabase.from('enrollment_periods').select('*');
  if (error) {
    console.error('Error fetching enrollment periods:', error);
    return [];
  }
  return data;
};

export const addEnrollmentPeriod = async (periodData) => {
  const dataToInsert = {
    ...periodData,
    waiting_period_days: parseInt(periodData.waiting_period_days, 10),
  };

  const { data, error } = await supabase
    .from('enrollment_periods')
    .insert([dataToInsert])
    .select();
  if (error) {
    console.error('Error adding enrollment period:', error);
    return null;
  }
  return data[0];
};

export const updateEnrollmentPeriod = async (id, updatedPeriodData) => {
  const { data, error } = await supabase
    .from('enrollment_periods')
    .update(updatedPeriodData)
    .eq('id', id)
    .select();
  if (error) {
    console.error('Error updating enrollment period:', error);
    return null;
  }
  return data[0];
};

// --- Benefit Plans & Carriers ---
export const getBenefitPlans = async () => {
  const { data, error } = await supabase
    .from('benefits')
    .select('*, benefit_rates(*)');
  if (error) {
    console.error('Error fetching benefit plans:', error);
    return [];
  }
  return data;
};

export const addBenefitPlanWithRates = async (planData, ratesData) => {
  const { data: plan, error: planError } = await supabase
    .from('benefits')
    .insert([planData])
    .select()
    .single();

  if (planError) {
    console.error('Error adding benefit plan:', planError);
    return null;
  }

  const ratesToInsert = ratesData.map(rate => ({ ...rate, benefit_id: plan.id }));
  const { error: ratesError } = await supabase.from('benefit_rates').insert(ratesToInsert);

  if (ratesError) {
    console.error('Error adding benefit rates:', ratesError);
    await supabase.from('benefits').delete().eq('id', plan.id);
    return null;
  }

  return { ...plan, benefit_rates: ratesToInsert };
};

export const deleteBenefitPlan = async (id) => {
  const { error } = await supabase.from('benefits').delete().eq('id', id);
  if (error) console.error('Error deleting benefit plan:', error);
  return !error;
};

// Fetches all completed enrollments with employee names
export const getEnrollmentsWithEmployeeData = async () => {
  const { data, error } = await supabase.from('enrollments').select('*, employees(name)');

  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
  return data;
};

export const getInvoicesForMonth = async (month) => {
  const { data, error } = await supabase
    .from('carrier_invoices')
    .select('*')
    .eq('billing_month', month);

  if (error) {
    console.error('Error fetching invoices for month:', error);
    return [];
  }
  return data;
};

export const updateInvoiceStatus = async (invoiceId, newStatus) => {
  const { data, error } = await supabase
    .from('carrier_invoices')
    .update({ status: newStatus })
    .eq('id', invoiceId)
    .select();

  if (error) {
    console.error('Error updating invoice status:', error);
    return null;
  }
  return data[0];
};


// --- Employee Management ---
export const getEmployees = async () => {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
};

export const addEmployee = async (employeeData) => {
  const { data, error } = await supabase.from('employees').insert([employeeData]).select();
  if (error) {
    console.error('Error adding employee:', error);
    return null;
  }
  return data[0];
};

export const deleteEmployee = async (id) => {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
  return true;
};

export const updateEmployee = async (id, employeeData) => {
  const { data, error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', id)
    .select();
  if (error) {
    console.error('Error updating employee:', error);
    return null;
  }
  return data[0];
};

// --- Bulk Operations ---
export const batchAddEmployees = async (employees) => {
  const { error } = await supabase.from('employees').insert(employees);
  if (error) {
    console.error('Error batch adding employees:', error);
    return false;
  }
  return true;
};




