import 'dotenv/config';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

const mongoUri = process.env.MONGODB_URI;

const scryptAsync = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt);
  return `${salt}:${derivedKey.toString('hex')}`;
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const sampleSchema = new mongoose.Schema({
  recordId: { type: Number, required: true },
  referenceNumber: { type: String, required: true, unique: true },
  categoryCounter: { type: Number },
  categoryCode: { type: String, default: '' },
  reportNumber: { type: String, default: '' },
  submissionDate: { type: Date, required: true },
  analysisType: { type: String, required: true },
  analysisCodes: { type: [String], default: [] },
  clientName: { type: String, required: true },
  address: { type: String, default: '' },
  telephone: { type: String, default: '' },
  locationAreaDistrict: { type: String, default: '' },
  locationCoordinates: { type: String, default: '' },
  sampleType: { type: String, required: true },
  sampleColor: { type: String, default: '' },
  sampleWeightVolume: { type: String, default: '' },
  sampleContainerPackaging: { type: String, default: '' },
  sampleCount: { type: Number, required: true },
  requestedTests: { type: [String], default: [] },
  requestedTestsNotes: { type: String, default: '' },
  sampleReturnRequired: { type: Boolean, default: false },
  statementOfConformity: { type: Boolean, default: false },
  sampleReceivedBy: { type: String, default: '' },
  inchargeOfSamples: { type: String, default: '' },
  analysisState: { type: String, default: 'Completed' },
  remarks: { type: String, default: '' },
  proformaInvoiceRef: { type: String, default: '' },
  voucherNo: { type: String, default: '' },
  feeWithoutVat: { type: Number },
  feeWithVat: { type: Number },
  advanceAmount: { type: Number },
  advanceReceiptNo: { type: String, default: '' },
  totalReceiptNo: { type: String, default: '' },
  taxInvoiceNo: { type: String, default: '' },
  reportIssueDate: { type: Date },
  issuingMethod: { type: String, default: 'Hard Copy' },
  issuedBy: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Sample = mongoose.model('Sample', sampleSchema);

// Exact 8 Rows from user's Google Sheet
const GSMB_SHEET_SAMPLES = [
  {
    recordId: 1,
    referenceNumber: 'AL/25/01',
    categoryCounter: 1,
    categoryCode: 'GEN-01',
    reportNumber: 'AL/25/01 GEN-01',
    submissionDate: new Date('2025-01-02T00:00:00.000Z'),
    analysisType: 'General',
    clientName: 'Eminet Eng. Shree Chem Food (Pvt) Ltd',
    address: '',
    telephone: '',
    sampleType: 'Salt',
    sampleCount: 1,
    requestedTests: ['Moisture %'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'HNA',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 1000,
    feeWithVat: 1210.21,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '107300',
    taxInvoiceNo: '',
    reportIssueDate: null,
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 2,
    referenceNumber: 'AL/25/02',
    categoryCounter: 1,
    categoryCode: 'WAT-01',
    reportNumber: 'AL/25/02 WAT-01',
    submissionDate: new Date('2025-01-06T00:00:00.000Z'),
    analysisType: 'Water',
    clientName: 'Gaja Holdings (PVT) LTD',
    address: '',
    telephone: '',
    sampleType: 'Ilmenite',
    sampleCount: 1,
    requestedTests: ['TiO2%'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'HNK',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 6000,
    feeWithVat: 7261.25,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '107388',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-01-22T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 3,
    referenceNumber: 'AL/25/03',
    categoryCounter: 1,
    categoryCode: 'QTZ-01',
    reportNumber: 'AL/25/03 QTZ-01',
    submissionDate: new Date('2025-01-08T00:00:00.000Z'),
    analysisType: 'Quartz',
    clientName: 'M. Amaraweera',
    address: '',
    telephone: '',
    sampleType: 'Quartz',
    sampleCount: 1,
    requestedTests: ['Full'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'PPG',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 25000,
    feeWithVat: 30255.20,
    advanceAmount: 0,
    advanceReceiptNo: '107343',
    totalReceiptNo: '107650',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-02-06T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 4,
    referenceNumber: 'AL/25/04',
    categoryCounter: 3,
    categoryCode: 'GEN-03',
    reportNumber: 'AL/25/04 GEN-03',
    submissionDate: new Date('2025-01-08T00:00:00.000Z'),
    analysisType: 'General',
    clientName: 'University of Peradeniya',
    address: '',
    telephone: '',
    sampleType: 'Monazite',
    sampleCount: 3,
    requestedTests: ['Major & REE'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'HNK',
    analysisState: 'Completed',
    remarks: 'FOC',
    feeWithoutVat: 0,
    feeWithVat: 0,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-01-22T00:00:00.000Z'),
    issuingMethod: 'Email',
    issuedBy: '',
  },
  {
    recordId: 5,
    referenceNumber: 'AL/25/05',
    categoryCounter: 4,
    categoryCode: 'GEN-04',
    reportNumber: 'AL/25/05 GEN-04',
    submissionDate: new Date('2025-01-09T00:00:00.000Z'),
    analysisType: 'General',
    clientName: 'Kelani Cables PLC',
    address: '',
    telephone: '',
    sampleType: 'Copper',
    sampleCount: 1,
    requestedTests: ['Full'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'HNK',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 12600,
    feeWithVat: 15248.62,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '107770',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-02-20T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 6,
    referenceNumber: 'AL/25/06',
    categoryCounter: 2,
    categoryCode: 'QTZ-02',
    reportNumber: 'AL/25/06 QTZ-02',
    submissionDate: new Date('2025-01-09T00:00:00.000Z'),
    analysisType: 'Quartz',
    clientName: 'Lio Quartz Processing (PVT) LTD',
    address: '',
    telephone: '',
    sampleType: 'Quartz',
    sampleCount: 2,
    requestedTests: ['Full'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'VRW, HNA',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 50000,
    feeWithVat: 60510.40,
    advanceAmount: 0,
    advanceReceiptNo: '107358',
    totalReceiptNo: '107402',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-01-21T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 7,
    referenceNumber: 'AL/25/07',
    categoryCounter: 5,
    categoryCode: 'GEN-05',
    reportNumber: 'AL/25/07 GEN-05',
    submissionDate: new Date('2025-01-09T00:00:00.000Z'),
    analysisType: 'General',
    clientName: 'Janatha Steels',
    address: '',
    telephone: '',
    sampleType: 'Charcoal',
    sampleCount: 2,
    requestedTests: ['Moisture', 'Carbon & Volatile matter'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'HNK',
    analysisState: 'Completed',
    remarks: '',
    feeWithoutVat: 20000,
    feeWithVat: 24204.16,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '107363',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-01-30T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
  {
    recordId: 8,
    referenceNumber: 'AL/25/08',
    categoryCounter: 6,
    categoryCode: 'GEN-06',
    reportNumber: 'AL/25/08 GEN-06',
    submissionDate: new Date('2025-01-09T00:00:00.000Z'),
    analysisType: 'General',
    clientName: 'G. S. K. Fernando',
    address: '',
    telephone: '',
    sampleType: 'Soil / Water',
    sampleCount: 2,
    requestedTests: ['As', 'Pb', 'Cd', 'Cr'],
    sampleReceivedBy: 'HAPJ',
    inchargeOfSamples: 'PPG',
    analysisState: 'Completed',
    remarks: 'Total of GEN 06 & 07',
    feeWithoutVat: 85180,
    feeWithVat: 103085.52,
    advanceAmount: 0,
    advanceReceiptNo: '',
    totalReceiptNo: '107436',
    taxInvoiceNo: '',
    reportIssueDate: new Date('2025-02-01T00:00:00.000Z'),
    issuingMethod: 'Hard Copy',
    issuedBy: '',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Seed default admin user
    const adminEmail = 'admin@labflow.lk';
    const existingUser = await User.findOne({ email: adminEmail });
    if (!existingUser) {
      const passwordHash = await hashPassword('Admin@1234');
      await User.create({
        name: 'Lead Laboratory Admin',
        email: adminEmail,
        passwordHash,
      });
      console.log(`Default admin created: ${adminEmail} (Password: Admin@1234)`);
    } else {
      console.log('Admin user already exists.');
    }

    // Clean existing samples and insert exact 8 Google Sheet samples
    console.log('Clearing old sample records...');
    await Sample.deleteMany({});

    for (const sampleData of GSMB_SHEET_SAMPLES) {
      await Sample.create(sampleData);
      console.log(`✅ Seeded Sample #${sampleData.recordId}: ${sampleData.referenceNumber} - ${sampleData.clientName} (${sampleData.sampleType})`);
    }

    console.log('\n🎉 Database successfully populated with 8 Google Sheet sample records!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
