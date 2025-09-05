import { supabase } from '../supabase';

// This function fetches all client tiers
export const getTiers = async () => {
  const { data, error } = await supabase.from('tiers').select('*');
  if (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
  return data;
};

// This function adds a new tier
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

// This function updates an existing tier
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

// This function deletes a tier by its ID
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

// This function fetches all services
export const getServices = async () => {
    const { data, error } = await supabase.from('services').select('*');
    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }
    return data;
};

// This function adds a new service
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

// This function deletes a service by its ID
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

// This function fetches all reconciliation items
export const getReconciliationItems = async () => {
  const { data, error } = await supabase.from('reconciliation_items').select('*');
  if (error) {
    console.error('Error fetching reconciliation items:', error);
    return [];
  }
  return data;
};

// This function adds a new reconciliation item
export const addReconciliationItem = async (newItemData) => {
  const { data, error } = await supabase
    .from('reconciliation_items')
    .insert([newItemData])
    .select();
  if (error) {
    console.error('Error adding new item:', error);
    return null;
  }
  return data[0];
};

// This function updates the status of a reconciliation item
export const updateReconciliationItemStatus = async (itemId, newStatus) => {
  const { data, error } = await supabase
    .from('reconciliation_items')
    .update({ status: newStatus })
    .eq('id', itemId)
    .select();
  if (error) {
    console.error('Error updating item status:', error);
    return null;
  }
  return data[0];
};

// This function deletes a reconciliation item
export const deleteReconciliationItem = async (itemId) => {
  const { error } = await supabase.from('reconciliation_items').delete().eq('id', itemId);
  if (error) {
    console.error('Error deleting item:', error);
    return false;
  }
  return true;
};

// This function fetches all clients
export const getClients = async () => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data;
};

// This function adds a new client
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

// New functions for our enrollment periods table
export const getEnrollmentPeriods = async () => {
  const { data, error } = await supabase.from('enrollment_periods').select('*');
  if (error) {
    console.error('Error fetching enrollment periods:', error);
    return [];
  }
  return data;
};

export const addEnrollmentPeriod = async (periodData) => {
  const { data, error } = await supabase
    .from('enrollment_periods')
    .insert([periodData])
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

// --- NEW FUNCTIONS FOR ENROLLMENT AND RECONCILIATION ---

// This function fetches all benefit plans
export const getBenefitPlans = async () => {
  const { data, error } = await supabase.from('benefits').select('*');
  if (error) {
    console.error('Error fetching benefit plans:', error);
    return [];
  }
  return data;
};

// This function submits a completed enrollment
export const submitEnrollment = async (enrollmentData) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([enrollmentData])
    .select();
  
  if (error) {
    console.error('Error submitting enrollment:', error);
    return null;
  }
  return data[0];
};

// Fetches all completed enrollments with employee names
export const getEnrollmentsWithEmployeeData = async () => {
  // --- THIS LINE IS NOW CORRECTED ---
  const { data, error } = await supabase.from('enrollments').select('*, employees(name)');
  
  if (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
  return data;
};

// Fetches carrier invoice data for a specific month
export const getInvoicesForMonth = async (month) => { // month should be in 'YYYY-MM-DD' format
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

// Updates the status of a single carrier invoice item
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



