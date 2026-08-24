import React from 'react';
import { useLab } from '../context/LabContext';

export const PrintableReceipt = () => {
  const { printSample } = useLab();

  if (!printSample) return null;

  const sample = printSample;

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return val;
    }
  };

  const formatCurrency = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '0.00';
    return val.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  return (
    <div
      className="printable-area"
      style={{
        display: 'none',
        fontFamily: 'Arial, sans-serif',
        padding: '30px',
        color: '#000',
        backgroundColor: '#fff',
      }}
    >
      {/* Printable Receipt Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #000',
          paddingBottom: '15px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            GSMB ANALYTICAL LABORATORY
          </h1>
          <p style={{ fontSize: '12px', color: '#444', margin: 0, fontWeight: 600 }}>
            Geological Survey & Mines Bureau
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {sample.referenceNumber}
          </div>
          {sample.categoryCode && (
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a' }}>
              Category: {sample.categoryCode}
            </div>
          )}
        </div>
      </div>

      {/* Customer & Sample Details */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '18px',
          fontSize: '12.5px',
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', width: '28%', backgroundColor: '#f9fafb' }}>Sample Received By (Staff)</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', width: '72%', fontWeight: 'bold', color: '#1e3a8a' }}>{sample.sampleReceivedBy || '—'}</td>
          </tr>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Name of Client</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>{sample.clientName}</td>
          </tr>
          {sample.address && (
            <tr>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Address</td>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>{sample.address}</td>
            </tr>
          )}
          {sample.telephone && (
            <tr>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Telephone</td>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>{sample.telephone}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Type of Sample / Matrix</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>
              <strong>{sample.sampleType}</strong> ({sample.sampleCount || 1} Sample(s))
            </td>
          </tr>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Type of Analysis</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>
              {sample.analysisType} {sample.categoryCode && `(${sample.categoryCode})`}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Requested Tests</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>
              {Array.isArray(sample.requestedTests) && sample.requestedTests.length > 0
                ? sample.requestedTests.join(', ')
                : 'Standard analysis profile'}
            </td>
          </tr>
          {sample.remarks && (
            <tr>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Remarks</td>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>{sample.remarks}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Financial Table with SSCL (2.56%) + VAT (18%) Breakdown */}
      <h3 style={{ fontSize: '13px', margin: '15px 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Financial & Payment Details
      </h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          fontSize: '12.5px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'right' }}>Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>Total Fee (Without VAT)</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'right' }}>
              {formatCurrency(sample.feeWithoutVat)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', fontWeight: 'bold' }}>Total Fee (With VAT)</td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>
              {formatCurrency(sample.feeWithVat)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>
              Amount Paid as an Advance {sample.advanceReceiptNo && `(Receipt: ${sample.advanceReceiptNo})`}
            </td>
            <td style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'right', color: '#166534', fontWeight: 'bold' }}>
              {formatCurrency(sample.advanceAmount)}
            </td>
          </tr>
          {sample.totalReceiptNo && (
            <tr>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc' }}>Receipt No</td>
              <td style={{ padding: '7px 10px', border: '1px solid #ccc', textAlign: 'right', fontWeight: 'bold' }}>
                {sample.totalReceiptNo}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Custody & Issuance Details */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '30px',
          fontSize: '12px',
        }}
      >
        <tbody>
          <tr>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', width: '25%', color: '#555' }}>Incharge of Samples:</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', width: '25%', fontWeight: 'bold' }}>{sample.inchargeOfSamples || '—'}</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', width: '25%', color: '#555' }}>Date of Issuing:</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', width: '25%', fontWeight: 'bold' }}>{formatDate(sample.reportIssueDate)}</td>
          </tr>
          <tr>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', color: '#555' }}>Issuing Method:</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', fontWeight: 'bold' }}>{sample.issuingMethod || 'Hard Copy'}</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', color: '#555' }}>Issued By:</td>
            <td style={{ padding: '6px 10px', border: '1px solid #eee', fontWeight: 'bold' }}>{sample.issuedBy || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderBottom: '1px solid #000', height: '35px', marginBottom: '4px' }}></div>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Sample Received By</div>
          <div style={{ fontSize: '11px', color: '#444' }}>{sample.sampleReceivedBy || '—'}</div>
        </div>

        <div style={{ textAlign: 'center', width: '200px' }}>
          <div style={{ borderBottom: '1px solid #000', height: '35px', marginBottom: '4px' }}></div>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>Client Signature</div>
          <div style={{ fontSize: '11px', color: '#444' }}>Authorized Representative</div>
        </div>
      </div>
    </div>
  );
};
