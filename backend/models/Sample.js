import mongoose from 'mongoose';
import { calculateTaxTotal, getCategoryPrefix } from '../utils/taxCalculator.js';

const sampleSchema = new mongoose.Schema(
  {
    recordId: {
      type: Number,
      required: [true, 'Record ID is required'],
      min: [1, 'Record ID must be at least 1'],
      index: true,
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference Number is required'],
      trim: true,
      unique: true,
      index: true,
    },
    submissionDate: {
      type: Date,
      required: [true, 'Date of Submission is required'],
      default: Date.now,
    },
    analysisType: {
      type: String,
      required: [true, 'Type of Analysis is required'],
      enum: ['Dolomite', 'General', 'Project', 'Quartz', 'Water'],
      default: 'General',
      trim: true,
    },
    categoryCounter: {
      type: Number,
      default: 1,
    },
    categoryCode: {
      type: String,
      default: '',
      trim: true,
    },
    reportNumber: {
      type: String,
      default: '',
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, 'Client Name is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    telephone: {
      type: String,
      default: '',
      trim: true,
    },
    sampleType: {
      type: String,
      required: [true, 'Sample Matrix / Type is required'],
      trim: true,
    },
    sampleCount: {
      type: Number,
      required: [true, 'Number of samples is required'],
      min: [1, 'Sample count must be at least 1'],
      default: 1,
    },
    requestedTests: {
      type: [String],
      default: [],
    },
    sampleReceivedBy: {
      type: String,
      default: 'HAPJ',
      trim: true,
    },
    inchargeOfSamples: {
      type: String,
      default: 'HNK',
      trim: true,
    },
    analysisState: {
      type: String,
      enum: [
        'Not started',
        'Sample preparation',
        'Instrumental analysis',
        'Grinding',
        'Under SDG approvel',
        'Completed',
      ],
      default: 'Not started',
      trim: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    feeWithoutVat: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
    feeWithVat: {
      type: Number,
      min: [0, 'Fee with VAT cannot be negative'],
      default: 0,
    },
    advanceAmount: {
      type: Number,
      min: [0, 'Advance cannot be negative'],
      default: 0,
    },
    advanceReceiptNo: {
      type: String,
      default: '',
      trim: true,
    },
    totalReceiptNo: {
      type: String,
      default: '',
      trim: true,
    },
    reportIssueDate: {
      type: Date,
      default: null,
    },
    issuingMethod: {
      type: String,
      enum: ['Hard Copy', 'Email', 'Whatsapp', 'Excel sheet'],
      default: 'Hard Copy',
      trim: true,
    },
    issuedBy: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook: Automatically compute category code, report number, and tax formula
sampleSchema.pre('save', function (next) {
  // Compute category prefix & code if not provided
  if (!this.categoryCode && this.analysisType) {
    const prefix = getCategoryPrefix(this.analysisType);
    const counter = this.categoryCounter || 1;
    this.categoryCode = `${prefix}-${String(counter).padStart(2, '0')}`;
  }

  // Combine report number
  if (this.referenceNumber && this.categoryCode) {
    this.reportNumber = `${this.referenceNumber} ${this.categoryCode}`.trim();
  }

  // Automatic tax formula calculation (SSCL 2.56% + VAT 18%)
  if (typeof this.feeWithoutVat === 'number' && this.feeWithoutVat >= 0) {
    if (!this.feeWithVat || this.isModified('feeWithoutVat')) {
      this.feeWithVat = calculateTaxTotal(this.feeWithoutVat);
    }
  }

  next();
});

export const Sample = mongoose.model('Sample', sampleSchema);
