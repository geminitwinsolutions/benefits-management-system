import { supabase } from '../supabase';
import toast from 'react-hot-toast';

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

export const updateClient = async (id, updatedClientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updatedClientData)
    .eq('id', id)
    .select();
  if (error) {
    console.error('Error updating client:', error);
    return null;
  }
  return data[0];
};

export const deleteClient = async (id) => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) {
    console.error('Error deleting client:', error);
    return false;
  }
  return true;
};

// --- Location Management ---
export const getLocationsForClient = async (clientId) => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('client_id', clientId);
  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
  return data;
};

export const addLocation = async (locationData) => {
  const { data, error } = await supabase.from('locations').insert([locationData]).select();
  if (error) {
    console.error('Error adding location:', error);
    return null;
  }
  return data[0];
};

export const updateLocation = async (id, locationData) => {
  const { data, error } = await supabase
    .from('locations')
    .update(locationData)
    .eq('id', id)
    .select();
  if (error) {
    console.error('Error updating location:', error);
    return null;
  }
  return data[0];
};

export const deleteLocation = async (id) => {
  const { error } = await supabase.from('locations').delete().eq('id', id);
  if (error) {
    console.error('Error deleting location:', error);
    return false;
  }
  return true;
};

// --- Communications ---
export const getContacts = async () => {
  const { data, error } = await supabase.from('contacts').select('*');
  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
  return data;
};

export const addContact = async (newContactData) => {
  const { data, error } = await supabase.from('contacts').insert([newContactData]).select();
  if (error) {
    console.error('Error adding contact:', error);
    return null;
  }
  return data[0];
};

export const getCommunicationLogs = async () => {
  const { data, error } = await supabase.from('communication_logs').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Error fetching communication logs:', error);
    return [];
  }
  return data;
};

export const addCommunicationLog = async (newLogData) => {
  const { data, error } = await supabase.from('communication_logs').insert([newLogData]).select();
  if (error) {
    console.error('Error adding communication log:', error);
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
  const { description, ...restOfPlanData } = planData;
  const { data: plan, error: planError } = await supabase
    .from('benefits')
    .insert([restOfPlanData])
    .select()
    .single();

  if (planError) {
    console.error('Error adding benefit plan:', planError);
    return null;
  }

  // The `ratesData` now contains nested structures. We'll store it as JSON.
  // We first clear existing rates to prepare for the new rates.
  const { error: deleteRatesError } = await supabase.from('benefit_rates').delete().eq('benefit_id', plan.id);
  if (deleteRatesError) {
      console.error('Error clearing old rates:', deleteRatesError);
      // We can decide to roll back the plan creation here if needed
      return null;
  }

  // Insert the new rate data as a single JSON object.
  const ratesToInsert = {
      benefit_id: plan.id,
      rates: ratesData
  }

  const { error: ratesError } = await supabase.from('benefit_rates').insert([ratesToInsert]);

  if (ratesError) {
    console.error('Error adding benefit rates:', ratesError);
    await supabase.from('benefits').delete().eq('id', plan.id);
    return null;
  }

  return { ...plan, benefit_rates: ratesData };
};


export const updateBenefitPlanWithRates = async (planId, planData, ratesData) => {
  const { description, ...restOfPlanData } = planData;
  const { data: plan, error: planError } = await supabase
    .from('benefits')
    .update(restOfPlanData)
    .eq('id', planId)
    .select()
    .single();

  if (planError) {
    console.error('Error updating benefit plan:', planError);
    return null;
  }

  const { error: deleteError } = await supabase.from('benefit_rates').delete().eq('benefit_id', planId);
  if (deleteError) {
    console.error('Error deleting old rates:', deleteError);
    return null;
  }

  // Insert the new rates as a single JSON object.
  const ratesToInsert = {
      benefit_id: planId,
      rates: ratesData
  };

  const { error: ratesError } = await supabase.from('benefit_rates').insert([ratesToInsert]);

  if (ratesError) {
    console.error('Error inserting new rates:', ratesError);
    return null;
  }

  return { ...plan, benefit_rates: ratesToInsert };
};

export const deleteBenefitPlan = async (id) => {
  const { error } = await supabase.from('benefits').delete().eq('id', id);
  if (error) console.error('Error deleting benefit plan:', error);
  return !error;
};

export const getCarriers = async () => {
  const { data, error } = await supabase.from('carriers').select('*');
  if (error) {
    console.error('Error fetching carriers:', error);
    return [];
  }
  return data || [];
};

export const addCarrier = async (carrierData) => {
  const { data, error } = await supabase.from('carriers').insert([carrierData]).select();
  if (error) console.error('Error adding carrier:', error);
  return data ? data[0] : null;
};

export const updateCarrier = async (id, carrierData) => {
  const { data, error } = await supabase.from('carriers').update(carrierData).eq('id', id).select();
  if (error) console.error('Error updating carrier:', error);
  return data ? data[0] : null;
};

export const deleteCarrier = async (id) => {
  const { error } = await supabase.from('carriers').delete().eq('id', id);
  if (error) console.error('Error deleting carrier:', error);
  return !error;
};


// --- Enrollments & Reconciliation ---
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
  // Add 'date_of_birth' to the select statement to fetch it
  const { data, error } = await supabase.from('employees').select('*, employee_statuses!fk_employee_status(name)');

  if (error) {
    console.error('Error fetching employees:', error);
    // Even if there's an error, return the data we have so the app doesn't crash
    if (data) {
      return data.map(emp => ({ ...emp, status: 'N/A' }));
    }
    return [];
  }

  return data.map(emp => ({
    ...emp,
    // Safely access the status name, providing a default if it's not available
    status: emp.employee_statuses ? emp.employee_statuses.name : 'N/A'
  }));
};

export const addEmployee = async (employeeData) => {
  const { data, error } = await supabase.from('employees').insert([employeeData]).select();
  if (error) {
    console.error('Error adding employee:', error);
    return null;
  }
  return data[0];
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

export const deleteEmployee = async (id) => {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
  return true;
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

// --- Primary Organization & Dashboard ---
export const getPrimaryOrganization = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_primary_organization', true)
    .limit(1)
    .single(); // Use single to get one object, not an array

  if (error) {
    console.error('Error fetching primary organization:', error);
    // It's okay if it's null, but not other errors
    if (error.code !== 'PGRST116') {
      toast.error('Could not fetch primary company details.');
    }
    return null;
  }
  return data;
};

// Fetches the client dashboard statistics
export const getClientStats = async () => {
  const { data, error } = await supabase.rpc('get_client_stats');

  if (error) {
    console.error('Error fetching client stats:', error);
    return {};
  }
  return data;
};
export const getAllLocations = async () => {
  const { data, error } = await supabase.from('locations').select('id, client_id');
  if (error) {
    console.error('Error fetching all locations:', error);
    return [];
  }
  return data;
};

// --- Company Settings ---
export const getCompany = async () => {
  const { data, error } = await supabase.from('company').select('*').single();
  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error fetching company details:', error);
    throw error;
  }
  return data;
};

export const updateCompany = async (companyData) => {
  const { id, ...updateData } = companyData;
  const { data, error } = await supabase
    .from('company')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company details:', error);
    throw error;
  }
  return data;
};

// --- User Management ---
export const getUsersWithRoles = async () => {
  const { data, error } = await supabase.rpc('get_users_with_roles_and_email');

  if (error) {
    console.error('Error fetching users with roles:', error);
    return [];
  }
  return data;
};

export const getRoles = async () => {
  const { data, error } = await supabase.from('roles').select('*, role_permissions(permission)');
  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
  return data;
};

export const addRole = async (roleData) => {
  const { data, error } = await supabase.from('roles').insert(roleData).select().single();
  if (error) throw error;
  return data;
};

export const updateRole = async (roleId, roleData) => {
  const { data, error } = await supabase.from('roles').update(roleData).eq('id', roleId).select().single();
  if (error) throw error;
  return data;
};

export const deleteRole = async (roleId) => {
  const { error } = await supabase.from('roles').delete().eq('id', roleId);
  if (error) throw error;
};

export const updateRolePermissions = async (roleId, permissions) => {
  // First, delete existing permissions for the role
  const { error: deleteError } = await supabase.from('role_permissions').delete().eq('role_id', roleId);
  if (deleteError) throw deleteError;

  // Then, insert the new permissions
  if (permissions.length > 0) {
    const newPermissions = permissions.map(p => ({ role_id: roleId, permission: p }));
    const { error: insertError } = await supabase.from('role_permissions').insert(newPermissions);
    if (insertError) throw insertError;
  }
};

export const getEmployeesWithoutUsers = async () => {
  const { data, error } = await supabase.rpc('get_employees_without_users');
  if (error) {
    console.error('Error fetching employees without users:', error);
    return [];
  }
  return data;
}

export const inviteUser = async ({ email, fullName, roleId }) => {
  try {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email, fullName, roleId },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inviting user:', error);
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

export const updateUserRole = async (userId, roleId) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error(error.message);
  }
  return data;
};

export const isSuperAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Correctly query the roles table using the user's role_id from the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profileData || !profileData.role_id) return false;

  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', profileData.role_id)
    .single();

  if (roleError) return false;

  return roleData.name === 'Super Admin';
};

// --- Bank Account Management ---
export const getBankAccounts = async (clientId) => {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('client_id', clientId);
  if (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
  return data;
};

export const addBankAccount = async (accountData) => {
  const { data, error } = await supabase.from('bank_accounts').insert([accountData]).select();
  if (error) {
    console.error('Error adding bank account:', error);
    return null;
  }
  return data[0];
};

export const updateBankAccount = async (id, accountData) => {
  const { data, error } = await supabase.from('bank_accounts').update(accountData).eq('id', id).select();
  if (error) {
    console.error('Error updating bank account:', error);
    return null;
  }
  return data[0];
};

export const deleteBankAccount = async (id) => {
  const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
  if (error) {
    console.error('Error deleting bank account:', error);
    return false;
  }
  return true;
};
export const getUsers = async () => {
  const { data, error } = await supabase.rpc('get_users_with_roles_and_email');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data;
};