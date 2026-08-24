import { Sample } from '../models/Sample.js';
import { calculateTaxTotal, getCategoryPrefix } from '../utils/taxCalculator.js';

export const getAllSamples = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.analysisState = new RegExp(status, 'i');
    }

    if (type && type !== 'all') {
      filter.analysisType = new RegExp(`^${type}$`, 'i');
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { referenceNumber: new RegExp(q, 'i') },
        { reportNumber: new RegExp(q, 'i') },
        { categoryCode: new RegExp(q, 'i') },
        { clientName: new RegExp(q, 'i') },
        { sampleType: new RegExp(q, 'i') },
        { analysisType: new RegExp(q, 'i') },
      ];
    }

    const samples = await Sample.find(filter).sort({ recordId: -1 });
    res.json({ samples });
  } catch (error) {
    next(error);
  }
};

export const getSampleById = async (req, res, next) => {
  try {
    const sample = await Sample.findById(req.params.id);
    if (!sample) {
      res.status(404).json({ message: 'Sample record not found.' });
      return;
    }
    res.json({ sample });
  } catch (error) {
    next(error);
  }
};

export const createSample = async (req, res, next) => {
  try {
    const body = req.body;

    // Determine auto serial & category counter if needed
    let categoryCounter = body.categoryCounter;
    let categoryCode = body.categoryCode;
    const analysisType = body.analysisType || 'General';

    if (!categoryCounter) {
      const count = await Sample.countDocuments({ analysisType });
      categoryCounter = count + 1;
    }

    if (!categoryCode) {
      const prefix = getCategoryPrefix(analysisType);
      categoryCode = `${prefix}-${String(categoryCounter).padStart(2, '0')}`;
    }

    const feeWithoutVat = Number(body.feeWithoutVat) || 0;
    const feeWithVat = body.feeWithVat ? Number(body.feeWithVat) : calculateTaxTotal(feeWithoutVat);
    const advanceAmount = Number(body.advanceAmount) || 0;

    if (advanceAmount > feeWithVat) {
      res.status(400).json({
        message: `Advance amount (LKR ${advanceAmount.toFixed(2)}) cannot exceed Total Fee (LKR ${feeWithVat.toFixed(2)}).`,
      });
      return;
    }

    const reportNumber = body.reportNumber || `${body.referenceNumber} ${categoryCode}`.trim();

    const sample = new Sample({
      recordId: Number(body.recordId),
      referenceNumber: body.referenceNumber.trim(),
      submissionDate: body.submissionDate ? new Date(body.submissionDate) : new Date(),
      analysisType,
      categoryCounter,
      categoryCode,
      reportNumber,
      clientName: body.clientName.trim(),
      address: body.address || '',
      telephone: body.telephone || '',
      sampleType: body.sampleType || 'Quartz',
      sampleCount: Number(body.sampleCount) || 1,
      requestedTests: Array.isArray(body.requestedTests) ? body.requestedTests : [],
      sampleReceivedBy: body.sampleReceivedBy || 'HAPJ',
      inchargeOfSamples: body.inchargeOfSamples || 'HNK',
      analysisState: body.analysisState || 'Not started',
      remarks: body.remarks || '',
      feeWithoutVat,
      feeWithVat,
      advanceAmount,
      advanceReceiptNo: body.advanceReceiptNo || '',
      totalReceiptNo: body.totalReceiptNo || '',
      reportIssueDate: body.reportIssueDate ? new Date(body.reportIssueDate) : null,
      issuingMethod: body.issuingMethod || 'Hard Copy',
      issuedBy: body.issuedBy || '',
    });

    await sample.save();

    res.status(201).json({
      message: `Sample ${sample.referenceNumber} created successfully.`,
      sample,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const sample = await Sample.findById(id);
    if (!sample) {
      res.status(404).json({ message: 'Sample record not found.' });
      return;
    }

    const fieldsToUpdate = [
      'recordId',
      'referenceNumber',
      'submissionDate',
      'analysisType',
      'categoryCounter',
      'categoryCode',
      'reportNumber',
      'clientName',
      'address',
      'telephone',
      'sampleType',
      'sampleCount',
      'requestedTests',
      'sampleReceivedBy',
      'inchargeOfSamples',
      'analysisState',
      'remarks',
      'feeWithoutVat',
      'feeWithVat',
      'advanceAmount',
      'advanceReceiptNo',
      'totalReceiptNo',
      'reportIssueDate',
      'issuingMethod',
      'issuedBy',
    ];

    for (const field of fieldsToUpdate) {
      if (body[field] !== undefined) {
        sample[field] = body[field];
      }
    }

    // Recalculate tax if fee changed
    if (body.feeWithoutVat !== undefined) {
      sample.feeWithoutVat = Number(body.feeWithoutVat) || 0;
      sample.feeWithVat = body.feeWithVat ? Number(body.feeWithVat) : calculateTaxTotal(sample.feeWithoutVat);
    }

    if (body.advanceAmount !== undefined) {
      sample.advanceAmount = Number(body.advanceAmount) || 0;
    }

    if (sample.advanceAmount > sample.feeWithVat) {
      res.status(400).json({
        message: `Advance amount (LKR ${sample.advanceAmount.toFixed(2)}) cannot exceed Total Fee (LKR ${sample.feeWithVat.toFixed(2)}).`,
      });
      return;
    }

    await sample.save();

    res.json({
      message: `Sample ${sample.referenceNumber} updated successfully.`,
      sample,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSample = async (req, res, next) => {
  try {
    const sample = await Sample.findByIdAndDelete(req.params.id);
    if (!sample) {
      res.status(404).json({ message: 'Sample not found.' });
      return;
    }
    res.json({
      message: `Sample ${sample.referenceNumber} deleted successfully.`,
      id: sample._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getSampleStats = async (req, res, next) => {
  try {
    const totalSamples = await Sample.countDocuments();
    const completedReports = await Sample.countDocuments({ analysisState: 'Completed' });
    const pendingAnalysis = await Sample.countDocuments({
      analysisState: { $in: ['Not started', 'received', 'pending'] },
    });
    const inProgress = await Sample.countDocuments({
      analysisState: { $in: ['Sample preparation', 'Instrumental analysis', 'Grinding', 'Under SDG approvel', 'progress'] },
    });

    const financialAgg = await Sample.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$feeWithVat' },
          totalAdvance: { $sum: '$advanceAmount' },
        },
      },
    ]);

    const totalRevenue = financialAgg[0]?.totalRevenue || 0;
    const totalAdvance = financialAgg[0]?.totalAdvance || 0;

    res.json({
      totalSamples,
      pendingAnalysis,
      inProgress,
      completedReports,
      totalRevenue,
      totalAdvance,
      pendingBalance: Math.max(0, totalRevenue - totalAdvance),
    });
  } catch (error) {
    next(error);
  }
};
