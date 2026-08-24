import React, { useState, useEffect } from 'react';
import { useLab } from '../context/LabContext';
import {
  Save,
  ArrowLeft,
  FileSpreadsheet,
  User,
  CheckCircle2,
  CreditCard,
  FileCheck,
  Plus,
  X,
} from 'lucide-react';
import { calculateTaxTotal, getCategoryPrefix } from '../api/client';

// The 46 predefined GSMB mineral and sample matrix types
const GSMB_SAMPLE_TYPES = [
  'Quartz',
  'Sands',
  'Graphite',
  'Zircon',
  'Ilmenite',
  'Rutile',
  'Monazite',
  'Water',
  'Iron ore',
  'Metal waste',
  'Rock',
  'Soil',
  'Mica',
  'Silicates',
  'Laterite',
  'Meteorite',
  'Dolomite',
  'Calcite',
  'Feldspar',
  'Copper',
  'Salt',
  'Charcoal',
  'Soil / Water',
  'Sediment',
  'Sludge',
  'Soil Conditioner',
  'Synthesized Chemical',
  'Digested Fertilizer',
  'Kaolin',
  'Digested Cement & Salt',
  'Boiler Water',
  'Digested Water, Fertilizer & Salt',
  'Synthesized Titanium Phosphate Sample',
  'Cu Alloy',
  'Soil & Clay Mixture',
  'Synthesized K Silicate',
  'Metal Waste',
  'Grinding',
  'Silica Sand',
  'Soil/Sand',
  'Ca(OH)2 Powder',
  'MgCO3',
  'Unknown',
  'Banana Ash',
  'Copper coated Steel Wire',
  'Zinc Ash',
];

// Type of Analysis
const ANALYSIS_TYPES = ['Dolomite', 'General', 'Project', 'Quartz', 'Water'];

// Sample received by
const STAFF_RECEIVED_BY = ['HAPJ', 'HNK', 'PPG', 'VRM'];

// Incharge of Samples
const STAFF_INCHARGE = ['HNK', 'PPG', 'HNA', 'CMH', 'VRW'];

// State of Analysis
const ANALYSIS_STATES = [
  'Not started',
  'Sample preparation',
  'Instrumental analysis',
  'Grinding',
  'Under SDG approvel',
  'Completed',
];

// Issuing method
const ISSUING_METHODS = ['Hard Copy', 'Email', 'Whatsapp', 'Excel sheet'];

// Issued by
const STAFF_ISSUED_BY = ['HNK', 'PPG', 'HNA', 'Vindya'];

export const SampleForm = () => {
  const { samples, editingSample, setEditingSample, setActiveTab, createSample, updateSample } =
    useLab();

  // Helper to generate Reference Number AL/{YY}/{Serial}
  const generateGsmbRef = (serial, dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const year2Digits = String(d.getFullYear() || new Date().getFullYear()).slice(-2);
    const paddedSerial = String(serial || 1).padStart(2, '0');
    return `AL/${year2Digits}/${paddedSerial}`;
  };

  const nextRecordId =
    samples.length > 0 ? Math.max(...samples.map((s) => Number(s.recordId) || 0)) + 1 : 1;

  // Category counts
  const computeCategoryCounter = (type) => {
    const prefix = getCategoryPrefix(type);
    const count = samples.filter((s) => (s.analysisType || '').toLowerCase() === type.toLowerCase()).length + 1;
    return {
      counter: count,
      code: `${prefix}-${String(count).padStart(2, '0')}`,
    };
  };

  const [formData, setFormData] = useState({
    recordId: nextRecordId,
    referenceNumber: generateGsmbRef(nextRecordId),
    submissionDate: new Date().toISOString().split('T')[0],
    analysisType: '',
    categoryCounter: 1,
    categoryCode: '',
    reportNumber: generateGsmbRef(nextRecordId),
    clientName: '',
    address: '',
    telephone: '',
    sampleType: '',
    sampleCount: 1,
    requestedTests: [],
    sampleReceivedBy: '',
    inchargeOfSamples: 'HNK',
    analysisState: 'Not started',
    remarks: '',
    voucherNo: '',
    feeWithoutVat: '',
    feeWithVat: '',
    advanceAmount: '',
    advanceReceiptNo: '',
    totalReceiptNo: '',
    taxInvoiceNo: '',
    reportIssueDate: '',
    issuingMethod: 'Hard Copy',
    issuedBy: 'HNK',
  });

  const [currentTestInput, setCurrentTestInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Populate data when editing
  useEffect(() => {
    if (editingSample) {
      const formattedSubDate = editingSample.submissionDate
        ? new Date(editingSample.submissionDate).toISOString().split('T')[0]
        : '';
      const formattedIssueDate = editingSample.reportIssueDate
        ? new Date(editingSample.reportIssueDate).toISOString().split('T')[0]
        : '';

      const testsArr = Array.isArray(editingSample.requestedTests)
        ? editingSample.requestedTests
        : typeof editingSample.requestedTests === 'string'
        ? editingSample.requestedTests.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      setFormData({
        ...editingSample,
        submissionDate: formattedSubDate,
        reportIssueDate: formattedIssueDate,
        analysisType: editingSample.analysisType || '',
        sampleReceivedBy: editingSample.sampleReceivedBy || '',
        inchargeOfSamples: editingSample.inchargeOfSamples || 'HNK',
        analysisState: editingSample.analysisState || 'Not started',
        issuingMethod: editingSample.issuingMethod || 'Hard Copy',
        issuedBy: editingSample.issuedBy || 'HNK',
        sampleType: editingSample.sampleType || '',
        sampleCount: editingSample.sampleCount || 1,
        requestedTests: testsArr,
        remarks: editingSample.remarks || editingSample.requestedTestsNotes || '',
        feeWithoutVat: editingSample.feeWithoutVat ?? '',
        feeWithVat: editingSample.feeWithVat ?? (editingSample.feeWithoutVat ? calculateTaxTotal(editingSample.feeWithoutVat) : ''),
        advanceAmount: editingSample.advanceAmount ?? '',
        taxInvoiceNo: editingSample.taxInvoiceNo || editingSample.referredInvoiceNo || '',
      });
    } else {
      // Setup new sample defaults (blank without forcing defaults)
      const ref = generateGsmbRef(nextRecordId);
      setFormData((prev) => ({
        ...prev,
        recordId: nextRecordId,
        referenceNumber: ref,
        analysisType: '',
        categoryCounter: 1,
        categoryCode: '',
        reportNumber: ref,
        sampleReceivedBy: '',
        sampleType: '',
      }));
    }
  }, [editingSample]);

  // Handle Type of Analysis change -> updates category counter & code
  const handleAnalysisTypeChange = (newType) => {
    if (!newType) {
      setFormData((prev) => ({
        ...prev,
        analysisType: '',
        categoryCode: '',
        reportNumber: prev.referenceNumber,
      }));
      return;
    }
    const cat = computeCategoryCounter(newType);
    setFormData((prev) => ({
      ...prev,
      analysisType: newType,
      categoryCounter: cat.counter,
      categoryCode: cat.code,
      reportNumber: prev.referenceNumber,
    }));
  };

  // Handle Submission Date change -> updates Reference Number
  const handleDateChange = (newDate) => {
    const ref = editingSample
      ? formData.referenceNumber
      : generateGsmbRef(formData.recordId, newDate);
    const rep = `${ref} ${formData.categoryCode || ''}`.trim();

    setFormData((prev) => ({
      ...prev,
      submissionDate: newDate,
      referenceNumber: ref,
      reportNumber: rep,
    }));
  };

  // Tax calculation formula: =U2+(U2*0.0256+((U2+(U2*0.0256))*0.18))
  // Always automatically calculates Fee With VAT
  const handleFeeWithoutVatChange = (value) => {
    const feeWithout = value;
    const feeWith = feeWithout !== '' && !isNaN(Number(feeWithout))
      ? calculateTaxTotal(feeWithout)
      : '';

    setFormData((prev) => ({
      ...prev,
      feeWithoutVat: feeWithout,
      feeWithVat: feeWith,
    }));
  };

  // Requested Tests Tag handlers
  const handleAddTest = () => {
    const trimmed = currentTestInput.trim();
    if (trimmed && !formData.requestedTests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        requestedTests: [...prev.requestedTests, trimmed],
      }));
      setCurrentTestInput('');
    }
  };

  const handleRemoveTest = (testToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requestedTests: prev.requestedTests.filter((t) => t !== testToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.clientName.trim()) {
      alert('Please enter Name of Client.');
      return;
    }

    if (!formData.referenceNumber.trim()) {
      alert('Please enter Reference Number.');
      return;
    }

    const baseFee = formData.feeWithoutVat !== '' && !isNaN(Number(formData.feeWithoutVat)) ? Number(formData.feeWithoutVat) : 0;
    const totalFee = calculateTaxTotal(baseFee);
    const advancePaid = formData.advanceAmount !== '' && !isNaN(Number(formData.advanceAmount)) ? Number(formData.advanceAmount) : 0;

    if (advancePaid > totalFee) {
      alert(`Advance amount (LKR ${advancePaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}) cannot exceed Total Fee (LKR ${totalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}).`);
      return;
    }

    setSubmitting(true);

    const payload = {
      ...formData,
      recordId: Number(formData.recordId) || nextRecordId,
      sampleCount: Number(formData.sampleCount) || 1,
      feeWithoutVat: baseFee,
      feeWithVat: totalFee,
      advanceAmount: advancePaid,
      submissionDate: formData.submissionDate
        ? new Date(formData.submissionDate).toISOString()
        : new Date().toISOString(),
      reportIssueDate: formData.reportIssueDate
        ? new Date(formData.reportIssueDate).toISOString()
        : null,
      taxInvoiceNo: formData.taxInvoiceNo || '',
      referredInvoiceNo: formData.taxInvoiceNo || '',
      requestedTestsNotes: formData.remarks || '',
    };

    let result;
    if (editingSample?.id || editingSample?._id) {
      const targetId = editingSample.id || editingSample._id;
      result = await updateSample(targetId, payload);
    } else {
      result = await createSample(payload);
    }

    setSubmitting(false);

    if (result.success) {
      setEditingSample(null);
      setActiveTab('samples');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Form Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => {
              setEditingSample(null);
              setActiveTab('samples');
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {editingSample ? `Edit Sample: ${editingSample.referenceNumber}` : 'Add Sample'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {formData.referenceNumber && (
            <div
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-50)',
                color: 'var(--brand-700)',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: '1px solid var(--brand-200)',
              }}
            >
              Reference: {formData.referenceNumber}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            <Save size={16} />
            <span>
              {submitting ? 'Saving...' : editingSample ? 'Update Sample' : 'Save Sample'}
            </span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {/* SECTION 1: Requisition Identifiers & Intake */}
        <div className="glass-card">
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FileSpreadsheet size={18} color="var(--brand-500)" />
            1. Requisition Identifiers & Intake
          </h2>

          <div className="form-grid">
            {/* 1. Record ID */}
            <div className="form-group">
              <label className="form-label">
                Record ID <span className="required">*</span>
              </label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.recordId}
                onChange={(e) => {
                  const id = e.target.value;
                  const ref = generateGsmbRef(id, formData.submissionDate);
                  setFormData({
                    ...formData,
                    recordId: id,
                    referenceNumber: ref,
                    reportNumber: `${ref} ${formData.categoryCode || ''}`.trim(),
                  });
                }}
              />
            </div>

            {/* 2. Date of Submission */}
            <div className="form-group">
              <label className="form-label">
                Date of Submission <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.submissionDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {/* 3. Reference Number (Auto-generated & Disabled) */}
            <div className="form-group">
              <label className="form-label">
                Reference Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                readOnly
                value={formData.referenceNumber}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  color: 'var(--brand-700)',
                }}
                title="Auto-generated from Submission Date & Record ID"
                placeholder="e.g. AL/25/01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Sample received by <span className="required">*</span>
              </label>
              <select
                className="form-select"
                required
                value={formData.sampleReceivedBy}
                onChange={(e) => setFormData({ ...formData, sampleReceivedBy: e.target.value })}
              >
                <option value="">-- Select Staff --</option>
                {STAFF_RECEIVED_BY.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Type of Analysis <span className="required">*</span>
              </label>
              <select
                className="form-select"
                required
                value={formData.analysisType}
                onChange={(e) => handleAnalysisTypeChange(e.target.value)}
              >
                <option value="">-- Select Analysis Type --</option>
                {ANALYSIS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Category Serial / Code
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.categoryCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryCode: e.target.value,
                    reportNumber: `${formData.referenceNumber} ${e.target.value}`.trim(),
                  })
                }
                placeholder="e.g. GEN-01"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Client Information */}
        <div className="glass-card">
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <User size={18} color="var(--accent-indigo)" />
            2. Client Information
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name of Client <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Enter client or company name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telephone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter telephone number"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter client address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Sample Specifications, Testing & State */}
        <div className="glass-card">
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
            3. Sample Specifications, Testing & State
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Type of Sample <span className="required">*</span>
              </label>
              <input
                list="gsmb-matrix-list"
                className="form-input"
                required
                placeholder="Select or type sample type..."
                value={formData.sampleType}
                onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
              />
              <datalist id="gsmb-matrix-list">
                {GSMB_SAMPLE_TYPES.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">
                No of Samples <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={formData.sampleCount}
                onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Incharge of Samples
              </label>
              <select
                className="form-select"
                value={formData.inchargeOfSamples}
                onChange={(e) => setFormData({ ...formData, inchargeOfSamples: e.target.value })}
              >
                {STAFF_INCHARGE.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                State of Analysis
              </label>
              <select
                className="form-select"
                value={formData.analysisState}
                onChange={(e) => setFormData({ ...formData, analysisState: e.target.value })}
              >
                {ANALYSIS_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Tests */}
            <div className="form-group full-width">
              <label className="form-label">Requested Tests</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: formData.requestedTests.length > 0 ? '0.5rem' : '0' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter requested tests"
                  value={currentTestInput}
                  onChange={(e) => setCurrentTestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTest();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddTest}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              {formData.requestedTests.length > 0 && (
                <div className="tag-container" style={{ marginTop: '0.4rem' }}>
                  {formData.requestedTests.map((test) => (
                    <span
                      key={test}
                      className="tag-pill"
                      style={{
                        backgroundColor: 'var(--brand-50)',
                        color: 'var(--brand-700)',
                        border: '1px solid var(--brand-200)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        padding: '0.25rem 0.65rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {test}
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(test)}
                        title={`Remove ${test}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'var(--brand-700)',
                        }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Remarks
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Financials & Payment Details */}
        <div className="glass-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CreditCard size={18} color="var(--accent-amber)" />
              4. Financials & Payment Details
            </h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Total Fee (Without VAT) - LKR
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={formData.feeWithoutVat}
                onChange={(e) => handleFeeWithoutVatChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Total Fee (With VAT) - LKR
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                className="form-input"
                placeholder="0.00"
                value={formData.feeWithVat !== '' && formData.feeWithVat !== undefined ? Number(formData.feeWithVat).toFixed(2) : ''}
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  color: 'var(--brand-700)',
                }}
                title="Automatically calculated (SSCL 2.56% + VAT 18%)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount Paid as an Advance - LKR
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="0.00"
                value={formData.advanceAmount}
                onChange={(e) => setFormData({ ...formData, advanceAmount: e.target.value })}
                style={{
                  borderColor:
                    Number(formData.advanceAmount || 0) > Number(formData.feeWithVat || 0) && Number(formData.feeWithVat || 0) > 0
                      ? 'var(--accent-rose)'
                      : undefined,
                }}
              />
              {Number(formData.advanceAmount || 0) > Number(formData.feeWithVat || 0) && Number(formData.feeWithVat || 0) > 0 && (
                <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  ⚠️ Advance cannot exceed Total Fee (LKR {Number(formData.feeWithVat).toFixed(2)})
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Balance Due - LKR
              </label>
              <input
                type="text"
                readOnly
                className="form-input"
                placeholder="0.00"
                value={
                  formData.feeWithVat !== '' && !isNaN(Number(formData.feeWithVat))
                    ? Math.max(0, Number(formData.feeWithVat) - Number(formData.advanceAmount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'
                }
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  cursor: 'not-allowed',
                  fontWeight: 700,
                  color: (Number(formData.feeWithVat || 0) - Number(formData.advanceAmount || 0)) > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                }}
                title="Automatically calculated (Total Fee - Advance Paid)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Advance Receipt No
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter advance receipt number"
                value={formData.advanceReceiptNo}
                onChange={(e) => setFormData({ ...formData, advanceReceiptNo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Receipt No
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter receipt number"
                value={formData.totalReceiptNo}
                onChange={(e) => setFormData({ ...formData, totalReceiptNo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Report Issuance */}
        <div className="glass-card">
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <FileCheck size={18} color="var(--accent-purple)" />
            5. Report Issuance
          </h2>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Date of Issuing Report
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.reportIssueDate}
                onChange={(e) => setFormData({ ...formData, reportIssueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Issuing Method
              </label>
              <select
                className="form-select"
                value={formData.issuingMethod}
                onChange={(e) => setFormData({ ...formData, issuingMethod: e.target.value })}
              >
                {ISSUING_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Issued by
              </label>
              <select
                className="form-select"
                value={formData.issuedBy}
                onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              >
                {STAFF_ISSUED_BY.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setEditingSample(null);
              setActiveTab('samples');
            }}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            <Save size={16} />
            <span>
              {submitting ? 'Saving...' : editingSample ? 'Update Sample' : 'Save Sample'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
