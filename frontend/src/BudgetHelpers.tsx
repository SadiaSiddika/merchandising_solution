import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// 1. Reusable template loader and saver
export function TemplateSelector({
  type,
  onLoadTemplate,
  currentData
}: {
  type: string;
  onLoadTemplate: (data: any[]) => void;
  currentData: any[];
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE}/budget-templates/${type}`);
      const data = await res.json();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [type]);

  const handleSave = async () => {
    if (!templateName) return alert("Please enter template name");
    try {
      const res = await fetch(`${API_BASE}/budget-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: templateName,
          item_type: type,
          template_data: JSON.stringify(currentData)
        })
      });
      if (res.ok) {
        alert("Template saved successfully!");
        setTemplateName('');
        loadTemplates();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Load Template:</span>
        <select 
          className="form-control" 
          style={{ width: '180px', height: '32px', padding: '0 8px', fontSize: '0.8rem', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px' }}
          onChange={(e) => {
            if (!e.target.value) return;
            const t = templates.find(x => String(x.id) === e.target.value);
            if (t) {
              try {
                const parsed = JSON.parse(t.template_data);
                onLoadTemplate(parsed);
              } catch (err) {
                alert("Error loading template data");
              }
            }
          }}
        >
          <option value="">Select Template</option>
          {templates.map(t => <option key={t.id} value={t.id}>{t.template_name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Save Current List as Template:</span>
        <input 
          type="text" 
          className="form-control" 
          style={{ width: '160px', height: '32px', fontSize: '0.8rem', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }}
          placeholder="Template Name"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
        />
        <button type="button" className="btn btn-secondary btn-sm" style={{ height: '32px', padding: '0 12px', fontSize: '0.75rem', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

// 2. Production fabric yarn costing grid
export function YarnCostingSection({
  yarns,
  onChange,
  greyCons
}: {
  composition?: string;
  yarns: any[];
  onChange: (yarns: any[]) => void;
  greyCons: number;
}) {
  const [yarnComp, setYarnComp] = useState('');
  const [yarnCount, setYarnCount] = useState('');
  const [yarnType, setYarnType] = useState('');
  const [pct, setPct] = useState(100);
  const [color, setColor] = useState('');
  const [processLoss, setProcessLoss] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [rate, setRate] = useState(0);

  const handleAddYarn = () => {
    if (!yarnComp || !yarnCount || !yarnType) return alert("Please fill required yarn details (composition, count, type)");
    const consQty = (pct / 100) * greyCons;
    const amount = consQty * rate;

    onChange([...yarns, {
      yarn_composition: yarnComp,
      yarn_count: yarnCount,
      yarn_type: yarnType,
      percentage: pct,
      color,
      cons_qty: consQty,
      process_loss_pct: processLoss,
      n_supplier: supplier,
      rate,
      amount
    }]);

    setYarnComp('');
    setYarnCount('');
    setYarnType('');
    setPct(100);
    setColor('');
    setProcessLoss(0);
    setSupplier('');
    setRate(0);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '20px' }}>
      <h5 style={{ marginBottom: '12px', fontWeight: 600, color: '#f8fafc' }}>Fabric - Yarn Costing (Production source details)</h5>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Composition *</label>
          <input type="text" className="form-control" placeholder="Cotton, Cashmere..." value={yarnComp} onChange={e => setYarnComp(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Count *</label>
          <input type="text" className="form-control" placeholder="30S, 40S..." value={yarnCount} onChange={e => setYarnCount(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Type *</label>
          <input type="text" className="form-control" placeholder="Combed, Carded..." value={yarnType} onChange={e => setYarnType(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Percentage (%) *</label>
          <input type="number" className="form-control" value={pct} onChange={e => setPct(parseInt(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Color</label>
          <input type="text" className="form-control" placeholder="Color" value={color} onChange={e => setColor(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Process Loss (%)</label>
          <input type="number" className="form-control" value={processLoss} onChange={e => setProcessLoss(parseInt(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Supplier</label>
          <input type="text" className="form-control" placeholder="Supplier" value={supplier} onChange={e => setSupplier(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yarn Rate ($) *</label>
          <input type="number" className="form-control" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
        </div>
        <div className="form-group" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '18px' }}>
          <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', height: '36px', cursor: 'pointer', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px' }} onClick={handleAddYarn}>Add Yarn Line</button>
        </div>
      </div>

      {yarns.length > 0 && (
        <div className="table-wrapper mt-10">
          <table className="data-table" style={{ fontSize: '0.8rem', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Yarn Details</th>
                <th style={{ padding: '8px' }}>Pct%</th>
                <th style={{ padding: '8px' }}>Color</th>
                <th style={{ padding: '8px' }}>Cons Qty</th>
                <th style={{ padding: '8px' }}>Supplier</th>
                <th style={{ padding: '8px' }}>Rate</th>
                <th style={{ padding: '8px' }}>Amount ($)</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {yarns.map((y, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '8px' }}>{y.yarn_composition} {y.yarn_count} {y.yarn_type}</td>
                  <td style={{ padding: '8px' }}>{y.percentage}%</td>
                  <td style={{ padding: '8px' }}>{y.color || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{y.cons_qty?.toFixed(4)}</td>
                  <td style={{ padding: '8px' }}>{y.n_supplier || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>${y.rate}</td>
                  <td style={{ padding: '8px' }}><strong>${y.amount?.toFixed(2)}</strong></td>
                  <td style={{ padding: '8px' }}>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(yarns.filter((_, i) => i !== idx))} style={{ cursor: 'pointer', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 3. Reusable popup modal for Grey/Trim/Emb/Wash consumption breakdown
export function ConsumptionBrowseModal({
  isOpen,
  onClose,
  type,
  currentOrder,
  initialRows = [],
  onApply
}: {
  isOpen: boolean;
  onClose: () => void;
  type: 'fabric' | 'trims' | 'emb' | 'wash';
  currentOrder: any;
  styleRef?: string;
  initialRows: any[];
  onApply: (rows: any[], avgCons: number, avgRate: number, totalQty: number, totalAmt: number) => void;
}) {
  const [rows, setRows] = useState<any[]>(initialRows);
  const [poNo, setPoNo] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [poQty, setPoQty] = useState(0);

  // Specific inputs
  const [diaWidth, setDiaWidth] = useState(0);
  const [diaFinType, setDiaFinType] = useState('Open');
  const [country, setCountry] = useState('Bangladesh');
  const [finishCons, setFinishCons] = useState(0);
  const [processLossPct, setProcessLossPct] = useState(0);
  const [rate, setRate] = useState(0);
  const [pcs, setPcs] = useState(1);
  const [sampleQty, setSampleQty] = useState(0);
  const [remarks, setRemarks] = useState('');

  // Extract PO breakdown options
  const pos = currentOrder?.pos || [];

  const handleAutoFillPOQty = () => {
    if (!poNo.trim()) return alert("Please enter a PO number first.");
    const match = pos.find((p: any) => String(p.po_no).toLowerCase() === poNo.trim().toLowerCase());
    if (match) {
      setPoNo(match.po_no);
      const breakdown = match.breakdown || [];
      if (breakdown.length > 0) {
        const sizeMatch = breakdown.find((b: any) => 
          (!color || String(b.color).toLowerCase() === color.toLowerCase()) && 
          (!size || String(b.size).toLowerCase() === size.toLowerCase())
        );
        if (sizeMatch) {
          setPoQty(sizeMatch.pcs_qty || 0);
          setColor(sizeMatch.color || '');
          setSize(sizeMatch.size || '');
        } else {
          // fallback to sum of color if color selected but size is blank
          const sameColor = breakdown.filter((b: any) => !color || String(b.color).toLowerCase() === color.toLowerCase());
          if (sameColor && sameColor.length > 0) {
            setPoQty(sameColor.reduce((sum: number, b: any) => sum + (b.pcs_qty || 0), 0));
          } else {
            setPoQty(match.po_qty || 0);
          }
        }
      } else {
        setPoQty(match.po_qty || 0);
      }
    } else {
      alert(`PO No "${poNo}" not found in current order context.`);
      setPoQty(0);
    }
  };
  const selectedPoDetail = pos.find((p: any) => p.po_no === poNo);
  const colorOptions = selectedPoDetail ? Array.from(new Set(selectedPoDetail.breakdown?.map((b: any) => b.color))) : [];
  const sizeOptions = selectedPoDetail ? Array.from(new Set(selectedPoDetail.breakdown?.filter((b: any) => !color || b.color === color).map((b: any) => b.size))) : [];

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows, isOpen]);

  useEffect(() => {
    if (selectedPoDetail) {
      const match = selectedPoDetail.breakdown?.find((b: any) => b.color === color && b.size === size);
      if (match) {
        setPoQty(match.pcs_qty || 0);
      } else {
        // fallback to sum of color if color selected but size is blank
        const sameColor = selectedPoDetail.breakdown?.filter((b: any) => b.color === color);
        if (sameColor && sameColor.length > 0) {
          setPoQty(sameColor.reduce((sum: number, b: any) => sum + (b.pcs_qty || 0), 0));
        } else {
          setPoQty(selectedPoDetail.po_qty || 0);
        }
      }
    } else {
      setPoQty(0);
    }
  }, [poNo, color, size]);

  const handleAddLine = () => {
    if (!poNo) return alert("Select PO No");

    // Formulas
    const greyCons = finishCons * (1 + (processLossPct || 0) / 100);
    const lineAmt = greyCons * (rate || 0);
    const totalFinishQty = poQty * finishCons;
    const totalQty = poQty * greyCons;
    const totalAmount = poQty * lineAmt;

    setRows([...rows, {
      po_no: poNo,
      color,
      gmt_sizes: size,
      po_qty: poQty,
      dia_width: diaWidth,
      dia_fin_type: diaFinType,
      country,
      finish_cons: finishCons,
      process_loss_pct: processLossPct,
      grey_cons: greyCons,
      rate,
      amount: lineAmt,
      pcs,
      total_finish_qty: totalFinishQty,
      total_qty: totalQty,
      sample_qty: sampleQty,
      total_amount: totalAmount,
      remarks
    }]);

    // reset inputs
    setPoNo('');
    setColor('');
    setSize('');
    setPoQty(0);
    setFinishCons(0);
    setProcessLossPct(0);
    setRate(0);
    setRemarks('');
  };

  const handleApply = () => {
    if (rows.length === 0) {
      alert("No lines added!");
      return;
    }

    const totalPOQty = rows.reduce((sum, r) => sum + (r.po_qty || 0), 0);
    const totalQtySum = rows.reduce((sum, r) => sum + (r.total_qty || 0), 0);
    const totalAmtSum = rows.reduce((sum, r) => sum + (r.total_amount || 0), 0);

    const avgCons = totalPOQty > 0 ? totalQtySum / totalPOQty : 0;
    const avgRate = totalQtySum > 0 ? totalAmtSum / totalQtySum : 0;

    onApply(rows, avgCons, avgRate, totalQtySum, totalAmtSum);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="modal-content" style={{ maxWidth: '900px', width: '95%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', overflowY: 'auto', maxHeight: '90vh' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h4 style={{ fontWeight: 'bold', color: '#f8fafc' }}>
            {type === 'fabric' ? 'Grey Consumption spec details' : 
             type === 'trims' ? 'Trims Cost Consumption spec details' : 
             type === 'emb' ? 'Embellishment Consumption spec details' : 
             'Wash Consumption spec details'}
          </h4>
          <XCircle className="modal-close" onClick={onClose} style={{ cursor: 'pointer', color: '#94a3b8' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '6px', marginBottom: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PO No *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  value={poNo}
                  onChange={e => { setPoNo(e.target.value); setColor(''); setSize(''); }}
                  placeholder="Enter PO No"
                  style={{ flex: 1, height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 8px' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAutoFillPOQty}
                  style={{ height: '36px', whiteSpace: 'nowrap', backgroundColor: '#334155', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' }}
                >
                  Auto Fill
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Color</label>
              <select className="form-control" value={color} onChange={e => { setColor(e.target.value); setSize(''); }} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 8px' }}>
                <option value="">Select Color</option>
                {colorOptions.map((c: any) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gmt Size</label>
              <select className="form-control" value={size} onChange={e => setSize(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 8px' }}>
                <option value="">Select Size</option>
                {sizeOptions.map((s: any) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PO Quantity</label>
              <input type="number" className="form-control" value={poQty} disabled style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px', opacity: 0.5 }} />
            </div>
            {type === 'fabric' ? (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Dia/Cuttable Width</label>
                  <input type="number" className="form-control" value={diaWidth} onChange={e => setDiaWidth(parseInt(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Dia Fin Type</label>
                  <input type="text" className="form-control" value={diaFinType} onChange={e => setDiaFinType(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
                </div>
              </>
            ) : (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Country</label>
                <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{type === 'fabric' || type === 'trims' ? 'Finish Cons' : 'Cons'} *</label>
              <input type="number" step="any" className="form-control" value={finishCons} onChange={e => setFinishCons(parseFloat(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Process Loss %</label>
              <input type="number" className="form-control" value={processLossPct} onChange={e => setProcessLossPct(parseInt(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rate *</label>
              <input type="number" step="any" className="form-control" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pcs (UOM ratio multiplier)</label>
              <input type="number" className="form-control" value={pcs} onChange={e => setPcs(parseInt(e.target.value) || 12)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
            </div>
            {type === 'fabric' ? (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sample Qty</label>
                <input type="number" className="form-control" value={sampleQty} onChange={e => setSampleQty(parseInt(e.target.value) || 0)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
              </div>
            ) : (
              <div style={{ width: '100%' }}></div>
            )}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Remarks</label>
              <input type="text" className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} style={{ width: '100%', height: '36px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '0 10px' }} />
            </div>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', borderRadius: '6px', padding: '6px 12px' }} onClick={handleAddLine}>Add a Line</button>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table className="data-table" style={{ fontSize: '0.75rem', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>PO No</th>
                <th style={{ padding: '8px' }}>Color/Size</th>
                <th style={{ padding: '8px' }}>PO Qty</th>
                <th style={{ padding: '8px' }}>Cons</th>
                <th style={{ padding: '8px' }}>Loss%</th>
                <th style={{ padding: '8px' }}>Grey Cons</th>
                <th style={{ padding: '8px' }}>Rate</th>
                <th style={{ padding: '8px' }}>Total Qty</th>
                <th style={{ padding: '8px' }}>Total Amt ($)</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '8px' }}>{r.po_no}</td>
                  <td style={{ padding: '8px' }}>{r.color} / {r.gmt_sizes}</td>
                  <td style={{ padding: '8px' }}>{r.po_qty}</td>
                  <td style={{ padding: '8px' }}>{r.finish_cons}</td>
                  <td style={{ padding: '8px' }}>{r.process_loss_pct}%</td>
                  <td style={{ padding: '8px' }}>{r.grey_cons?.toFixed(4)}</td>
                  <td style={{ padding: '8px' }}>${r.rate}</td>
                  <td style={{ padding: '8px' }}>{r.total_qty?.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}><strong>${r.total_amount?.toFixed(2)}</strong></td>
                  <td style={{ padding: '8px' }}>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setRows(rows.filter((_, i) => i !== idx))} style={{ cursor: 'pointer', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-20 text-right" style={{ marginTop: '20px', textAlign: 'right' }}>
          <button type="button" className="btn btn-secondary mr-10" style={{ marginRight: '10px', cursor: 'pointer', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', padding: '8px 16px', borderRadius: '6px' }} onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px' }} onClick={handleApply}>Apply Consumption Data</button>
        </div>
      </div>
    </div>
  );
}
