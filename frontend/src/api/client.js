// API client with seamless fallback to LocalStorage/Mock mode

const API_BASE_URL = '/api';

export const TAX_MULTIPLIER = 1.210208; // SSCL (2.56%) cascading into VAT (18%)

export const calculateTaxTotal = (feeWithoutVat) => {
  const base = Number(feeWithoutVat) || 0;
  if (base <= 0) return 0;
  // Base + (Base * 0.0256) + ((Base + (Base * 0.0256)) * 0.18)
  const sscl = base * 0.0256;
  const subtotal = base + sscl;
  const vat = subtotal * 0.18;
  const total = subtotal + vat;
  return Number(total.toFixed(2));
};

export const getCategoryPrefix = (analysisType) => {
  const t = (analysisType || '').trim().toLowerCase();
  if (t.includes('quartz')) return 'QTZ';
  if (t.includes('dolomite')) return 'DOL';
  if (t.includes('water')) return 'WAT';
  if (t.includes('project')) return 'PRO';
  return 'GEN';
};

const DEFAULT_INITIAL_SAMPLES = [
  {
    id: 'mock-1',
    recordId: 1,
    referenceNumber: 'AL/26/01',
    categoryCounter: 1,
    categoryCode: 'GEN-01',
    reportNumber: 'AL/26/01 GEN-01',
    submissionDate: '2026-08-20T09:30:00.000Z',
    analysisType: 'General',
    analysisCodes: ['CHEM-01', 'XRF'],
    clientName: 'Ceylon Mineral Sands Ltd',
    address: 'No. 45, Industrial Zone, Pulmoddai',
    telephone: '+94 11 234 5678',
    locationAreaDistrict: 'Pulmoddai, Trincomalee',
    locationCoordinates: '8.9482 N, 80.9982 E',
    sampleType: 'Ilmenite',
    sampleColor: 'Dark Metallic Grey',
    sampleWeightVolume: '500g',
    sampleContainerPackaging: 'Sealed Polythene Bag',
    sampleCount: 5,
    requestedTests: ['TiO2 Content', 'Fe2O3 Content', 'Loss on Ignition (LOI)'],
    requestedTestsNotes: 'Priority testing for export mineral assay',
    sampleReturnRequired: false,
    statementOfConformity: true,
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'VRW, HNA',
    analysisState: 'Instrumental analysis',
    remarks: 'Stored in dry mineral storage Unit 1',
    proformaInvoiceRef: 'PI-2026-890',
    voucherNo: 'V-1029',
    feeWithoutVat: 45000,
    feeWithVat: 54459.36,
    advanceAmount: 25000,
    advanceReceiptNo: 'REC-0891',
    totalReceiptNo: '',
    taxInvoiceNo: 'TAX-2026-042',
    reportIssueDate: null,
    issuingMethod: 'Hard Copy',
    issuedBy: 'HNK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    recordId: 2,
    referenceNumber: 'AL/26/02',
    categoryCounter: 1,
    categoryCode: 'QTZ-01',
    reportNumber: 'AL/26/02 QTZ-01',
    submissionDate: '2026-08-21T11:15:00.000Z',
    analysisType: 'Quartz',
    analysisCodes: ['AAS', 'LOI'],
    clientName: 'Lanka Quartz Mining Corp',
    address: '78 High Level Road, Naula',
    telephone: '+94 77 123 4567',
    locationAreaDistrict: 'Naula, Matale',
    locationCoordinates: '7.7025 N, 80.6486 E',
    sampleType: 'Quartz',
    sampleColor: 'Translucent White',
    sampleWeightVolume: '1.2 kg',
    sampleContainerPackaging: 'Plastic Jar',
    sampleCount: 2,
    requestedTests: ['SiO2 Purity %', 'Fe2O3 Impurities', 'Al2O3 Content'],
    requestedTestsNotes: 'High purity quartz screening',
    sampleReturnRequired: true,
    statementOfConformity: true,
    sampleReceivedBy: 'HNK',
    inchargeOfSamples: 'PPG',
    analysisState: 'Completed',
    remarks: 'Purity exceeded 99.8% standard',
    proformaInvoiceRef: 'PI-2026-894',
    voucherNo: 'V-1033',
    feeWithoutVat: 28000,
    feeWithVat: 33885.82,
    advanceAmount: 33885.82,
    advanceReceiptNo: 'REC-0899',
    totalReceiptNo: 'TOT-0451',
    taxInvoiceNo: 'TAX-2026-045',
    reportIssueDate: '2026-08-23T14:00:00.000Z',
    issuingMethod: 'Email',
    issuedBy: 'Vindya',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    recordId: 3,
    referenceNumber: 'AL/26/03',
    categoryCounter: 1,
    categoryCode: 'DOL-01',
    reportNumber: 'AL/26/03 DOL-01',
    submissionDate: '2026-08-24T08:45:00.000Z',
    analysisType: 'Dolomite',
    analysisCodes: ['VOL-01', 'TITR'],
    clientName: 'Central Dolomite Suppliers',
    address: '12 Kandy Road, Matale',
    telephone: '+94 71 888 9999',
    locationAreaDistrict: 'Rattota, Matale',
    locationCoordinates: '7.5218 N, 80.6725 E',
    sampleType: 'Dolomite',
    sampleColor: 'Off-white Powder',
    sampleWeightVolume: '1 kg',
    sampleContainerPackaging: 'Cloth Bag',
    sampleCount: 3,
    requestedTests: ['CaO %', 'MgO %', 'Acid Insoluble Matter'],
    requestedTestsNotes: 'Fertilizer grade specification testing',
    sampleReturnRequired: false,
    statementOfConformity: false,
    sampleReceivedBy: 'VRM',
    inchargeOfSamples: 'CMH, VRW',
    analysisState: 'Sample preparation',
    remarks: 'Grinding stage in progress',
    proformaInvoiceRef: 'PI-2026-902',
    voucherNo: 'V-1040',
    feeWithoutVat: 35000,
    feeWithVat: 42357.28,
    advanceAmount: 20000,
    advanceReceiptNo: 'REC-0910',
    totalReceiptNo: '',
    taxInvoiceNo: '',
    reportIssueDate: null,
    issuingMethod: 'Hard Copy',
    issuedBy: 'HNA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const getStoredLocalSamples = () => {
  try {
    const data = localStorage.getItem('lab_samples_cache');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading localStorage', e);
  }
  return DEFAULT_INITIAL_SAMPLES;
};

const saveStoredLocalSamples = (samples) => {
  try {
    localStorage.setItem('lab_samples_cache', JSON.stringify(samples));
  } catch (e) {
    console.error('Failed writing to localStorage', e);
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('lab_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Check health and Mongo connection
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, database: data.database };
      }
    } catch (err) {
      // Backend offline
    }
    return { isOnline: false, database: 'offline-mode' };
  },

  // Auth: Verify current user
  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return null;
  },

  // Auth: Register
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  },

  // Auth: Login
  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json();
    throw new Error(err.message || 'Invalid email or password');
  },

  // Samples: List all
  async getSamples() {
    try {
      const res = await fetch(`${API_BASE_URL}/samples`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.samples && Array.isArray(data.samples)) {
          saveStoredLocalSamples(data.samples);
          return data.samples;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable. Falling back to local cache.');
    }
    return getStoredLocalSamples();
  },

  // Samples: Create new
  async createSample(sampleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/samples`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sampleData),
      });
      if (res.ok) {
        const data = await res.json();
        const currentList = getStoredLocalSamples();
        saveStoredLocalSamples([data.sample, ...currentList]);
        return { success: true, sample: data.sample, message: data.message };
      }
      const err = await res.json();
      throw new Error(err.message || 'Failed creating sample');
    } catch (err) {
      console.warn('Create sample offline fallback:', err);
      // Fallback local creation
      const prefix = getCategoryPrefix(sampleData.analysisType);
      const currentList = getStoredLocalSamples();
      const catCount = currentList.filter(s => (s.analysisType || '').toLowerCase() === (sampleData.analysisType || '').toLowerCase()).length + 1;
      const categoryCode = `${prefix}-${String(catCount).padStart(2, '0')}`;
      const newSample = {
        ...sampleData,
        id: 'local-' + Date.now(),
        categoryCounter: catCount,
        categoryCode,
        reportNumber: `${sampleData.referenceNumber} ${categoryCode}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStoredLocalSamples([newSample, ...currentList]);
      return { success: true, sample: newSample, message: 'Sample created in local mode' };
    }
  },

  // Samples: Update existing
  async updateSample(id, sampleData) {
    try {
      const res = await fetch(`${API_BASE_URL}/samples/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(sampleData),
      });
      if (res.ok) {
        const data = await res.json();
        const currentList = getStoredLocalSamples();
        const updatedList = currentList.map((item) =>
          (item.id === id || item._id === id) ? data.sample : item
        );
        saveStoredLocalSamples(updatedList);
        return { success: true, sample: data.sample, message: data.message };
      }
      const err = await res.json();
      throw new Error(err.message || 'Failed updating sample');
    } catch (err) {
      console.warn('Update sample offline fallback:', err);
      const currentList = getStoredLocalSamples();
      const updatedList = currentList.map((item) => {
        if (item.id === id || item._id === id) {
          return { ...item, ...sampleData, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      saveStoredLocalSamples(updatedList);
      const updatedItem = updatedList.find((i) => i.id === id || i._id === id);
      return { success: true, sample: updatedItem, message: 'Sample updated in local mode' };
    }
  },

  // Samples: Delete
  async deleteSample(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/samples/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const currentList = getStoredLocalSamples();
        saveStoredLocalSamples(currentList.filter((i) => i.id !== id && i._id !== id));
        return { success: true };
      }
      const err = await res.json();
      throw new Error(err.message || 'Failed deleting sample');
    } catch (err) {
      console.warn('Delete sample offline fallback:', err);
      const currentList = getStoredLocalSamples();
      saveStoredLocalSamples(currentList.filter((i) => i.id !== id && i._id !== id));
      return { success: true };
    }
  },

  // Stats / Dashboard Aggregation
  async getStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    const samples = getStoredLocalSamples();
    const totalSamples = samples.length;
    const completed = samples.filter((s) => s.analysisState === 'Completed').length;
    const inProgress = samples.filter((s) => s.analysisState === 'In Progress' || s.analysisState === 'Sample preparation' || s.analysisState === 'Instrumental analysis').length;
    const pending = samples.filter((s) => s.analysisState === 'Not started' || s.analysisState === 'Received').length;
    const totalRevenue = samples.reduce((sum, s) => sum + (Number(s.feeWithVat) || 0), 0);
    const totalAdvance = samples.reduce((sum, s) => sum + (Number(s.advanceAmount) || 0), 0);

    return {
      totalSamples,
      completed,
      inProgress,
      pending,
      totalRevenue,
      totalAdvance,
      outstandingBalance: totalRevenue - totalAdvance,
    };
  },
};
