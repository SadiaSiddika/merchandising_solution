const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database
db.initDb().then(async () => {
  console.log("Database initialized successfully.");
  try {
    // Delete any old invalid string PQ-MOCK- IDs
    await db.runExec("DELETE FROM price_quotations WHERE id LIKE 'PQ-MOCK-%'");

    const existing = await db.runQuery("SELECT id FROM price_quotations WHERE id IN ('9001', '9002', '9003', '9004', '9005')");
    if (existing.length === 0) {
      console.log("Seeding demo price quotations...");
      const mockQuotes = [
        { id: '9001', style_no: 'ST-TEE-2026', buyer: 'Zara', team_leader: 'Sarah Connor', offer_qty: 15000, total_cost: 4.85, status: 'Pending', comments: 'Initial pricing for summer tees.' },
        { id: '9002', style_no: 'ST-POLO-99', buyer: 'H&M', team_leader: 'John Doe', offer_qty: 20000, total_cost: 6.20, status: 'Rejected', comments: 'CM cost is too high, needs to be under $1.20.' },
        { id: '9003', style_no: 'ST-JEANS-X', buyer: "Levi's", team_leader: 'John Doe', offer_qty: 8000, total_cost: 12.50, status: 'Revised', comments: 'Decrease trims cost by sourcing button locally.' },
        { id: '9004', style_no: 'ST-HOODIE-W', buyer: 'NewYorker', team_leader: 'Sarah Connor', offer_qty: 12000, total_cost: 9.75, status: 'Approved', comments: 'Approved by manager after lab test validation.' },
        { id: '9005', style_no: 'ST-JACKET-Z', buyer: 'Zara', team_leader: 'Alex Mercer', offer_qty: 5000, total_cost: 18.20, status: 'Resubmitted', comments: 'Resubmitted with reduced freight and packaging rates.' }
      ];
      for (const mq of mockQuotes) {
        await db.runExec(
          `INSERT INTO price_quotations (id, style_no, buyer, team_leader, offer_qty, total_cost, status, comments)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [mq.id, mq.style_no, mq.buyer, mq.team_leader, mq.offer_qty, mq.total_cost, mq.status, mq.comments]
        );
      }
      console.log("Demo price quotations seeded successfully!");
    }

    const existingBudgets = await db.runQuery("SELECT id FROM budgets LIMIT 1");
    if (existingBudgets.length === 0) {
      console.log("Seeding demo budgets...");
      const mockBudgets = [
        {
          order_id: 'ORD-001',
          budget_reference: 'BG-ZR-polo-001',
          total_fabric_budget: 12000,
          total_trims_budget: 4500,
          total_cm_budget: 2500,
          total_emb_budget: 1200,
          total_wash_budget: 800,
          total_other_budget: 500,
          total_commercial_budget: 600,
          total_commission_budget: 0,
          total_budget_amount: 22100,
          status: 'Approved',
          buyer: 'Zara',
          season: 'Summer 2026',
          uom: 'Pcs',
          smv: 14.5,
          incoterm: 'FOB',
          mc_line: 12,
          prod_line_hour: 400,
          country: 'Bangladesh',
          currency: 'USD',
          ship_mode: 'Sea',
          remarks: 'Standard Summer Polo collection limit.',
          budget_minute: '174000',
          cutting_smv: 1.5,
          sewing_smv: 11.5,
          finishing_smv: 1.5,
          sewing_efficiency: 85,
          cutting_efficiency: 90,
          finishing_efficiency: 85,
          buying_agent: 'Zara Sourcing',
          incoterm_place: 'Chattogram Port',
          costing_date: '2026-06-15',
          copy_from: '',
          file_no: 'ZR-2026-F1',
          internal_ref: 'INT-ZR-01',
          budget_label: 'Style Label',
          total_lab_test_budget: 200,
          total_inspection_budget: 150,
          total_sample_budget: 100,
          total_freight_budget: 500,
          total_courier_budget: 80,
          total_certif_budget: 120,
          total_common_oh_budget: 250,
          total_deffd_lc_budget: 100,
          total_design_budget: 150,
          total_studio_budget: 100,
          total_opert_exp_budget: 100,
          total_income_tax_budget: 200,
          company: 'Demo Factory Ltd.',
          unit: 'Demo Unit',
          feedback_from_approval: 'Looks good, approved by MD.',
          approve_by: 'Merchandiser Manager/MD',
          user_remarks: 'Status set to Approved',
          quotation_id: '9004',
          style_no: 'ST-TEE-2026',
          style_desc: 'Zara Men Summer Tee',
          department: 'Knitwear'
        },
        {
          order_id: 'ORD-002',
          budget_reference: 'BG-HM-polo-002',
          total_fabric_budget: 9500,
          total_trims_budget: 3200,
          total_cm_budget: 1800,
          total_emb_budget: 800,
          total_wash_budget: 600,
          total_other_budget: 400,
          total_commercial_budget: 500,
          total_commission_budget: 0,
          total_budget_amount: 17300,
          status: 'Pending',
          buyer: 'H&M',
          season: 'Spring 2026',
          uom: 'Pcs',
          smv: 12.0,
          incoterm: 'FOB',
          mc_line: 10,
          prod_line_hour: 350,
          country: 'Bangladesh',
          currency: 'USD',
          ship_mode: 'Sea',
          remarks: 'Pending approval by Supervisor.',
          budget_minute: '144000',
          cutting_smv: 1.2,
          sewing_smv: 9.6,
          finishing_smv: 1.2,
          sewing_efficiency: 80,
          cutting_efficiency: 85,
          finishing_efficiency: 80,
          buying_agent: 'H&M Sourcing',
          incoterm_place: 'Chattogram Port',
          costing_date: '2026-06-18',
          copy_from: '',
          file_no: 'HM-2026-F2',
          internal_ref: 'INT-HM-02',
          budget_label: 'Style Label',
          total_lab_test_budget: 150,
          total_inspection_budget: 100,
          total_sample_budget: 80,
          total_freight_budget: 400,
          total_courier_budget: 60,
          total_certif_budget: 100,
          total_common_oh_budget: 200,
          total_deffd_lc_budget: 80,
          total_design_budget: 120,
          total_studio_budget: 80,
          total_opert_exp_budget: 85,
          total_income_tax_budget: 150,
          company: 'Demo Factory Ltd.',
          unit: 'Demo Unit',
          feedback_from_approval: '',
          approve_by: '',
          user_remarks: 'Status set to Pending',
          quotation_id: '9001',
          style_no: 'ST-POLO-99',
          style_desc: 'H&M Polo Basic',
          department: 'Knitwear'
        }
      ];
      for (const mb of mockBudgets) {
        await db.runExec(
          `INSERT INTO budgets (
            order_id, budget_reference, total_fabric_budget, total_trims_budget,
            total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
            total_commercial_budget, total_commission_budget, total_budget_amount, status,
            buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
            ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
            sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
            incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
            total_lab_test_budget, total_inspection_budget, total_sample_budget,
            total_freight_budget, total_courier_budget, total_certif_budget,
            total_common_oh_budget, total_deffd_lc_budget, total_design_budget,
            total_studio_budget, total_opert_exp_budget, total_income_tax_budget,
            company, unit, feedback_from_approval, approve_by, user_remarks,
            quotation_id, style_no, style_desc, department
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            mb.order_id, mb.budget_reference, mb.total_fabric_budget, mb.total_trims_budget,
            mb.total_cm_budget, mb.total_emb_budget, mb.total_wash_budget, mb.total_other_budget,
            mb.total_commercial_budget, mb.total_commission_budget, mb.total_budget_amount, mb.status,
            mb.buyer, mb.season, mb.uom, mb.smv, mb.incoterm, mb.mc_line, mb.prod_line_hour, mb.country, mb.currency,
            mb.ship_mode, mb.remarks, mb.budget_minute, mb.cutting_smv, mb.sewing_smv, mb.finishing_smv,
            mb.sewing_efficiency, mb.cutting_efficiency, mb.finishing_efficiency, mb.buying_agent,
            mb.incoterm_place, mb.costing_date, mb.copy_from, mb.file_no, mb.internal_ref, mb.budget_label,
            mb.total_lab_test_budget, mb.total_inspection_budget, mb.total_sample_budget,
            mb.total_freight_budget, mb.total_courier_budget, mb.total_certif_budget,
            mb.total_common_oh_budget, mb.total_deffd_lc_budget, mb.total_design_budget,
            mb.total_studio_budget, mb.total_opert_exp_budget, mb.total_income_tax_budget,
            mb.company, mb.unit, mb.feedback_from_approval, mb.approve_by, mb.user_remarks,
            mb.quotation_id, mb.style_no, mb.style_desc, mb.department
          ]
        );
      }
      console.log("Demo budgets seeded successfully!");
    }
  } catch (err) {
    console.error("Failed to seed demo data:", err.message);
  }
}).catch(err => {
  console.error("Database initialization failed:", err.message);
});

// Helper for sending error responses
const handleError = (res, err, context = "") => {
  console.error(`Error in ${context}:`, err);
  res.status(500).json({ error: err.message || "Internal server error" });
};

// Date formatter helper: 2026-06-21 -> 2026-Jun-21
function formatInquiryDate(dStr) {
  const d = dStr ? new Date(dStr) : new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = d.getFullYear();
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 1. DB Status Endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    dbType: db.getDbType()
  });
});

// 2. CRM & Master Data Endpoints
app.get('/api/buyers', async (req, res) => {
  try {
    const rows = await db.runQuery("SELECT * FROM buyers ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/buyers");
  }
});

app.post('/api/buyers', async (req, res) => {
  try {
    const { name, code, brand, buying_agent, team_leader, season } = req.body;
    const result = await db.runExec(
      "INSERT INTO buyers (name, code, brand, buying_agent, team_leader, season) VALUES (?, ?, ?, ?, ?, ?)",
      [name, code, brand, buying_agent, team_leader, season]
    );
    res.status(201).json({ id: result.insertId, message: "Buyer created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/buyers");
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const rows = await db.runQuery("SELECT * FROM items_master ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/items");
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { item_name, item_group, category, uom, smv } = req.body;
    const result = await db.runExec(
      "INSERT INTO items_master (item_name, item_group, category, uom, smv) VALUES (?, ?, ?, ?, ?)",
      [item_name, item_group, category, uom, smv || 1.0]
    );
    res.status(201).json({ id: result.insertId, message: "Item created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/items");
  }
});

// 3. Sales Target Endpoints (Header + Months Architecture)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// GET all headers with aggregated month totals
app.get('/api/sales-targets', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT st.*, COALESCE(b.name, st.buyer_name) as buyer_name, b.code as buyer_code,
        COALESCE(agg.total_basic_qty,0) as total_basic_qty,
        COALESCE(agg.total_basic_val,0) as total_basic_val,
        COALESCE(agg.total_casual_qty,0) as total_casual_qty,
        COALESCE(agg.total_casual_val,0) as total_casual_val,
        COALESCE(agg.total_fashion_qty,0) as total_fashion_qty,
        COALESCE(agg.total_fashion_val,0) as total_fashion_val,
        COALESCE(agg.target_qty,0) as target_qty,
        COALESCE(agg.target_value,0) as target_value,
        COALESCE(agg.achieve_qty,0) as achieve_qty,
        COALESCE(agg.achieve_value,0) as achieve_value,
        COALESCE(agg.confirm_qty,0) as confirm_qty,
        COALESCE(agg.confirm_value,0) as confirm_value
      FROM sales_targets st
      LEFT JOIN buyers b ON st.buyer_id = b.id
      LEFT JOIN (
        SELECT sales_target_id,
          SUM(target_basic_qty) as total_basic_qty,
          SUM(target_basic_val) as total_basic_val,
          SUM(target_casual_qty) as total_casual_qty,
          SUM(target_casual_val) as total_casual_val,
          SUM(target_fashion_qty) as total_fashion_qty,
          SUM(target_fashion_val) as total_fashion_val,
          SUM(target_basic_qty + target_casual_qty + target_fashion_qty) as target_qty,
          SUM(target_basic_val + target_casual_val + target_fashion_val) as target_value,
          SUM(achieve_basic_qty + achieve_casual_qty + achieve_fashion_qty) as achieve_qty,
          SUM(achieve_basic_val + achieve_casual_val + achieve_fashion_val) as achieve_value,
          SUM(confirm_qty) as confirm_qty,
          SUM(confirm_value) as confirm_value
        FROM sales_target_months
        GROUP BY sales_target_id
      ) agg ON agg.sales_target_id = st.id
      ORDER BY st.year DESC, st.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/sales-targets");
  }
});


// GET single target with all month rows
app.get('/api/sales-targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const headers = await db.runQuery(`
      SELECT st.*, COALESCE(b.name, st.buyer_name) as buyer_name, b.code as buyer_code
      FROM sales_targets st LEFT JOIN buyers b ON st.buyer_id = b.id
      WHERE st.id = ?`, [id]);
    if (!headers.length) return res.status(404).json({ error: 'Not found' });
    const months = await db.runQuery(
      `SELECT * FROM sales_target_months WHERE sales_target_id = ? ORDER BY id ASC`, [id]);
    // Ensure all 12 months present
    const monthMap = {};
    months.forEach(m => { monthMap[m.month] = m; });
    const fullMonths = MONTHS.map(mn => monthMap[mn] || {
      sales_target_id: parseInt(id), month: mn,
      target_basic_qty: 0, target_basic_val: 0,
      target_casual_qty: 0, target_casual_val: 0,
      target_fashion_qty: 0, target_fashion_val: 0,
      achieve_basic_qty: 0, achieve_basic_val: 0,
      achieve_casual_qty: 0, achieve_casual_val: 0,
      achieve_fashion_qty: 0, achieve_fashion_val: 0,
      confirm_qty: 0, confirm_value: 0, is_locked: 0
    });
    res.json({ ...headers[0], months: fullMonths });
  } catch (e) {
    handleError(res, e, "GET /api/sales-targets/:id");
  }
});

// POST create header + initialize 12 blank month rows
app.post('/api/sales-targets', async (req, res) => {
  try {
    const { unit, buyer_id, buyer_name, team_leader, season, year, brand, buying_agent, buying_agent_merchant, status, style_id } = req.body;
    const dbBuyerId = (buyer_id && buyer_id !== "") ? parseInt(buyer_id) : null;
    const dbYear = (year && year !== "") ? parseInt(year) : new Date().getFullYear();
    const result = await db.runExec(
      `INSERT INTO sales_targets (unit, buyer_id, buyer_name, team_leader, season, year, brand, buying_agent, buying_agent_merchant, status, style_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [unit, dbBuyerId, buyer_name || '', team_leader, season, dbYear, brand, buying_agent, buying_agent_merchant, status || 'Draft', style_id || '']
    );
    const newId = result.insertId;
    // Initialize 12 blank month rows
    for (const month of MONTHS) {
      await db.runExec(
        `INSERT INTO sales_target_months (sales_target_id, month) VALUES (?, ?)`,
        [newId, month]
      );
    }
    res.status(201).json({ id: newId, message: "Sales target created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/sales-targets");
  }
});

// PUT update header
app.put('/api/sales-targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { unit, buyer_id, buyer_name, team_leader, season, year, brand, buying_agent, buying_agent_merchant, status, style_id } = req.body;
    const dbBuyerId = (buyer_id && buyer_id !== "") ? parseInt(buyer_id) : null;
    const dbYear = (year && year !== "") ? parseInt(year) : new Date().getFullYear();
    await db.runExec(
      `UPDATE sales_targets SET unit=?, buyer_id=?, buyer_name=?, team_leader=?, season=?, year=?, brand=?, buying_agent=?, buying_agent_merchant=?, status=?, style_id=? WHERE id=?`,
      [unit, dbBuyerId, buyer_name || '', team_leader, season, dbYear, brand, buying_agent, buying_agent_merchant, status, style_id || '', id]
    );
    res.json({ message: "Sales target updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/sales-targets/:id");
  }
});

// PUT update a single month row (blocked if locked)
app.put('/api/sales-targets/:id/months/:month', async (req, res) => {
  try {
    const { id, month } = req.params;
    // Check if locked
    const rows = await db.runQuery(
      `SELECT is_locked, id as month_id FROM sales_target_months WHERE sales_target_id=? AND month=?`, [id, month]);
    if (rows.length && rows[0].is_locked) {
      return res.status(403).json({ error: 'This month row is locked and cannot be edited.' });
    }
    const {
      target_basic_qty, target_basic_val, target_casual_qty, target_casual_val,
      target_fashion_qty, target_fashion_val, confirm_qty, confirm_value
    } = req.body;

    if (rows.length) {
      await db.runExec(
        `UPDATE sales_target_months SET target_basic_qty=?, target_basic_val=?, target_casual_qty=?, target_casual_val=?,
         target_fashion_qty=?, target_fashion_val=?, confirm_qty=?, confirm_value=?
         WHERE sales_target_id=? AND month=?`,
        [target_basic_qty || 0, target_basic_val || 0, target_casual_qty || 0, target_casual_val || 0,
        target_fashion_qty || 0, target_fashion_val || 0, confirm_qty || 0, confirm_value || 0, id, month]
      );
    } else {
      await db.runExec(
        `INSERT INTO sales_target_months (sales_target_id, month, target_basic_qty, target_basic_val, target_casual_qty, target_casual_val, target_fashion_qty, target_fashion_val, confirm_qty, confirm_value)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, month, target_basic_qty || 0, target_basic_val || 0, target_casual_qty || 0, target_casual_val || 0,
          target_fashion_qty || 0, target_fashion_val || 0, confirm_qty || 0, confirm_value || 0]
      );
    }
    res.json({ message: "Month updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/sales-targets/:id/months/:month");
  }
});

// PUT lock a confirmed month row
app.put('/api/sales-targets/:id/months/:month/lock', async (req, res) => {
  try {
    const { id, month } = req.params;
    await db.runExec(
      `UPDATE sales_target_months SET is_locked=1 WHERE sales_target_id=? AND month=?`, [id, month]);
    res.json({ message: "Month locked successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/sales-targets/:id/months/:month/lock");
  }
});

// DELETE sales target (header + months)
app.delete('/api/sales-targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.runExec(`DELETE FROM sales_target_months WHERE sales_target_id=?`, [id]);
    await db.runExec(`DELETE FROM sales_targets WHERE id=?`, [id]);
    res.json({ message: "Sales target deleted" });
  } catch (e) {
    handleError(res, e, "DELETE /api/sales-targets/:id");
  }
});

// Master dropdown data endpoints
app.get('/api/master/buying-agents', async (req, res) => {
  try {
    const rows = await db.runQuery(
      `SELECT DISTINCT buying_agent FROM buyers WHERE buying_agent IS NOT NULL AND buying_agent != '' ORDER BY buying_agent`);
    res.json(rows.map(r => r.buying_agent));
  } catch (e) { handleError(res, e, "GET /api/master/buying-agents"); }
});

app.get('/api/master/buying-agent-merchants', async (req, res) => {
  try {
    const { buying_agent } = req.query;
    let rows;
    if (buying_agent) {
      rows = await db.runQuery(
        `SELECT DISTINCT buying_agent_merchant FROM buyers WHERE buying_agent=? AND buying_agent_merchant IS NOT NULL AND buying_agent_merchant != '' ORDER BY buying_agent_merchant`,
        [buying_agent]);
    } else {
      rows = await db.runQuery(
        `SELECT DISTINCT buying_agent_merchant FROM buyers WHERE buying_agent_merchant IS NOT NULL AND buying_agent_merchant != '' ORDER BY buying_agent_merchant`);
    }
    res.json(rows.map(r => r.buying_agent_merchant));
  } catch (e) { handleError(res, e, "GET /api/master/buying-agent-merchants"); }
});

app.get('/api/master/brands', async (req, res) => {
  try {
    const rows = await db.runQuery(
      `SELECT DISTINCT brand FROM buyers WHERE brand IS NOT NULL AND brand != '' ORDER BY brand`);
    res.json(rows.map(r => r.brand));
  } catch (e) { handleError(res, e, "GET /api/master/brands"); }
});

app.get('/api/master/seasons', async (req, res) => {
  try {
    const rows = await db.runQuery(
      `SELECT DISTINCT season FROM buyers WHERE season IS NOT NULL AND season != '' ORDER BY season`);
    res.json(rows.map(r => r.season));
  } catch (e) { handleError(res, e, "GET /api/master/seasons"); }
});

app.get('/api/master/team-leaders', async (req, res) => {
  try {
    const rows = await db.runQuery(
      `SELECT DISTINCT team_leader FROM buyers WHERE team_leader IS NOT NULL AND team_leader != '' ORDER BY team_leader`);
    res.json(rows.map(r => r.team_leader));
  } catch (e) { handleError(res, e, "GET /api/master/team-leaders"); }
});

app.get('/api/master/units', async (req, res) => {
  try {
    const rows = await db.runQuery(
      `SELECT DISTINCT unit FROM users WHERE unit IS NOT NULL AND unit != '' ORDER BY unit`);
    res.json(rows.map(r => r.unit));
  } catch (e) { handleError(res, e, "GET /api/master/units"); }
});


// 4. Quotation Inquiry Endpoints
app.get('/api/inquiries', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT qi.*, COALESCE(b.name, qi.buyer_name) as buyer_name,
             f.fabric_type, f.composition as fabric_composition, f.gsm, f.dia
      FROM quotation_inquiries qi
      LEFT JOIN buyers b ON qi.buyer_id = b.id
      LEFT JOIN (
        SELECT f1.* FROM inquiry_fabrics f1
        WHERE f1.id = (SELECT MIN(f2.id) FROM inquiry_fabrics f2 WHERE f2.inquiry_id = f1.inquiry_id)
      ) f ON qi.id = f.inquiry_id
      ORDER BY qi.inquiry_date DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/inquiries");
  }
});

// Search inquiry by Style No — must be before /:id to avoid conflict
app.get('/api/inquiries/by-style/:style_no', async (req, res) => {
  try {
    const { style_no } = req.params;
    const rows = await db.runQuery(
      `SELECT qi.id, qi.buyer_id, COALESCE(b.name, qi.buyer_name) as buyer_name, qi.brand, qi.style_no
       FROM quotation_inquiries qi
       LEFT JOIN buyers b ON qi.buyer_id = b.id
       WHERE LOWER(qi.style_no) = LOWER(?)
       ORDER BY qi.inquiry_date DESC
       LIMIT 1`,
      [style_no]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: `No inquiry found with Style No "${style_no}"` });
    }
    res.json(rows[0]);
  } catch (e) {
    handleError(res, e, 'GET /api/inquiries/by-style/:style_no');
  }
});

app.get('/api/inquiries/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const inquiry = await db.runQuery("SELECT * FROM quotation_inquiries WHERE id=?", [id]);
    if (inquiry.length === 0) return res.status(404).json({ error: "Inquiry not found" });

    const fabrics = await db.runQuery("SELECT * FROM inquiry_fabrics WHERE inquiry_id=?", [id]);
    const yarns = await db.runQuery("SELECT * FROM inquiry_yarns WHERE inquiry_id=?", [id]);

    res.json({
      ...inquiry[0],
      fabrics,
      yarns
    });
  } catch (e) {
    handleError(res, e, "GET /api/inquiries/:id");
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const {
      id, buyer_id, buyer_name, style_no, style_desc, item_group, brand, season,
      team_leader, dealing_merchant, inquiry_date, sub_date, ship_date,
      offer_qty, uom, costing_per, department, sample_req, remarks, image_url,
      garments_item, status, fabrics, yarns, company, quoted_by
    } = req.body;

    const dbBuyerId = (buyer_id && buyer_id !== "") ? parseInt(buyer_id) : null;
    let finalBuyerName = buyer_name;
    if (!finalBuyerName && dbBuyerId) {
      const buyerResult = await db.runQuery("SELECT name FROM buyers WHERE id=?", [dbBuyerId]);
      finalBuyerName = buyerResult[0] ? buyerResult[0].name : '';
    }

    // Generate automatic ID matching TD-001-2023-Aug-07
    let finalId = id;
    if (!finalId) {
      let buyerCode = "ZR";
      if (dbBuyerId) {
        const buyerResult = await db.runQuery("SELECT code FROM buyers WHERE id=?", [dbBuyerId]);
        buyerCode = buyerResult[0] ? buyerResult[0].code : "ZR";
      }

      const d = new Date(inquiry_date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateFormatted = `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;

      let count = 1;
      if (dbBuyerId) {
        const countResult = await db.runQuery("SELECT COUNT(*) as count FROM quotation_inquiries WHERE buyer_id=?", [dbBuyerId]);
        count = parseInt(countResult[0].count) + 1;
      } else {
        const countResult = await db.runQuery("SELECT COUNT(*) as count FROM quotation_inquiries");
        count = parseInt(countResult[0].count) + 1;
      }

      finalId = `${buyerCode}-${String(count).padStart(3, '0')}-${dateFormatted}`;
    }

    await db.runExec(
      `INSERT INTO quotation_inquiries (id, buyer_id, buyer_name, style_no, style_desc, item_group, brand, season,
        team_leader, dealing_merchant, inquiry_date, sub_date, ship_date, offer_qty, uom, costing_per,
        department, sample_req, remarks, image_url, garments_item, status, company, quoted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalId, dbBuyerId, finalBuyerName, style_no, style_desc, item_group, brand, season,
        team_leader, dealing_merchant, inquiry_date, sub_date, ship_date,
        offer_qty, uom, costing_per, department, sample_req, remarks, image_url, garments_item, status || 'Draft', company, quoted_by]
    );

    // Save Fabrics
    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        await db.runExec(
          "INSERT INTO inquiry_fabrics (inquiry_id, composition, fabric_type, gsm, dia, dia_type, uom, rate, required_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [finalId, f.composition, f.fabric_type, f.gsm, f.dia, f.dia_type, f.uom, f.rate, f.required_qty]
        );
      }
    }

    // Save Yarns
    if (yarns && yarns.length > 0) {
      for (let y of yarns) {
        await db.runExec(
          "INSERT INTO inquiry_yarns (inquiry_id, composition, yarn_composition, yarn_count, yarn_type, certification) VALUES (?, ?, ?, ?, ?, ?)",
          [finalId, y.composition, y.yarn_composition, y.yarn_count, y.yarn_type, y.certification]
        );
      }
    }

    res.status(201).json({ id: finalId, message: "Quotation Inquiry created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/inquiries");
  }
});

app.put('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      buyer_id, buyer_name, style_no, style_desc, item_group, brand, season, team_leader, dealing_merchant,
      inquiry_date, sub_date, ship_date, offer_qty, uom, costing_per, department,
      sample_req, remarks, image_url, garments_item, status, fabrics, yarns, company, quoted_by
    } = req.body;

    const dbBuyerId = (buyer_id && buyer_id !== "") ? parseInt(buyer_id) : null;
    let finalBuyerName = buyer_name;
    if (!finalBuyerName && dbBuyerId) {
      const buyerResult = await db.runQuery("SELECT name FROM buyers WHERE id=?", [dbBuyerId]);
      finalBuyerName = buyerResult[0] ? buyerResult[0].name : '';
    }

    await db.runExec(
      `UPDATE quotation_inquiries SET buyer_id=?, buyer_name=?, style_no=?, style_desc=?, item_group=?, brand=?, season=?, 
        team_leader=?, dealing_merchant=?, inquiry_date=?, sub_date=?, ship_date=?, offer_qty=?, 
        uom=?, costing_per=?, department=?, sample_req=?, remarks=?, image_url=?, garments_item=?, status=?, company=?, quoted_by=? WHERE id=?`,
      [dbBuyerId, finalBuyerName, style_no, style_desc, item_group, brand, season, team_leader, dealing_merchant,
        inquiry_date, sub_date, ship_date, offer_qty, uom, costing_per, department,
        sample_req, remarks, image_url, garments_item, status, company, quoted_by, id]
    );

    // Re-create fabrics
    await db.runExec("DELETE FROM inquiry_fabrics WHERE inquiry_id=?", [id]);
    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        await db.runExec(
          "INSERT INTO inquiry_fabrics (inquiry_id, composition, fabric_type, gsm, dia, dia_type, uom, rate, required_qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [id, f.composition, f.fabric_type, f.gsm, f.dia, f.dia_type, f.uom, f.rate, f.required_qty]
        );
      }
    }

    // Re-create yarns
    await db.runExec("DELETE FROM inquiry_yarns WHERE inquiry_id=?", [id]);
    if (yarns && yarns.length > 0) {
      for (let y of yarns) {
        await db.runExec(
          "INSERT INTO inquiry_yarns (inquiry_id, composition, yarn_composition, yarn_count, yarn_type, certification) VALUES (?, ?, ?, ?, ?, ?)",
          [id, y.composition, y.yarn_composition, y.yarn_count, y.yarn_type, y.certification]
        );
      }
    }

    res.json({ message: "Quotation Inquiry updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/inquiries/:id");
  }
});

// Delete Quotation Inquiry
app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.runExec("DELETE FROM inquiry_fabrics WHERE inquiry_id=?", [id]);
    await db.runExec("DELETE FROM inquiry_yarns WHERE inquiry_id=?", [id]);
    await db.runExec("DELETE FROM quotation_inquiries WHERE id=?", [id]);
    res.json({ message: "Quotation Inquiry deleted successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/inquiries/:id");
  }
});

// Update Status of Quotation Inquiry
app.put('/api/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.runExec("UPDATE quotation_inquiries SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Status updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/inquiries/:id/status");
  }
});

// Approve Quotation Inquiry
app.put('/api/inquiries/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by } = req.body;
    const dateStr = new Date().toISOString().split('T')[0];
    await db.runExec(
      "UPDATE quotation_inquiries SET status='Approved', approved_by=?, approve_date=? WHERE id=?",
      [approved_by || 'Supervisor', dateStr, id]
    );
    res.json({ message: "Inquiry approved successfully." });
  } catch (e) {
    handleError(res, e, "APPROVE /api/inquiries/:id");
  }
});

// 5. Costing & Price Quotation Endpoints
app.get('/api/quotations', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT 
        pq.*, 
        qi.buyer_id, 
        b.name as buyer_name, 
        qi.season,
        (SELECT composition FROM quotation_fabric_costs WHERE quotation_id = CAST(pq.id AS TEXT) LIMIT 1) as fabric_composition,
        (SELECT fabric_type FROM quotation_fabric_costs WHERE quotation_id = CAST(pq.id AS TEXT) LIMIT 1) as fabric_type,
        (SELECT gsm FROM quotation_fabric_costs WHERE quotation_id = CAST(pq.id AS TEXT) LIMIT 1) as fabric_gsm,
        (SELECT rate FROM quotation_fabric_costs WHERE quotation_id = CAST(pq.id AS TEXT) LIMIT 1) as fabric_rate,
        (SELECT SUM(total_amount) FROM quotation_fabric_costs WHERE quotation_id = CAST(pq.id AS TEXT)) as total_fabric_price,
        (SELECT SUM(cutting_smv + sewing_smv + finishing_smv) FROM price_quotation_garments WHERE price_quotation_id = CAST(pq.id AS TEXT)) as calculated_smv
      FROM price_quotations pq
      LEFT JOIN quotation_inquiries qi ON pq.inquiry_id = qi.id
      LEFT JOIN buyers b ON qi.buyer_id = b.id
      ORDER BY pq.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/quotations");
  }
});

app.get('/api/quotations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await db.runQuery("SELECT * FROM price_quotations WHERE id=?", [id]);
    if (quotation.length === 0) return res.status(404).json({ error: "Price quotation not found" });

    const garments = await db.runQuery("SELECT * FROM price_quotation_garments WHERE price_quotation_id=?", [id]);
    const fabrics = await db.runQuery("SELECT * FROM quotation_fabric_costs WHERE quotation_id=?", [id]);
    const yarns = await db.runQuery("SELECT * FROM quotation_yarn_costs WHERE quotation_id=?", [id]);
    const trims = await db.runQuery("SELECT * FROM quotation_trims_costs WHERE quotation_id=?", [id]);
    const embs = await db.runQuery("SELECT * FROM quotation_emb_costs WHERE quotation_id=?", [id]);
    const washes = await db.runQuery("SELECT * FROM quotation_wash_costs WHERE quotation_id=?", [id]);
    const commls = await db.runQuery("SELECT * FROM quotation_comml_costs WHERE quotation_id=?", [id]);
    const others = await db.runQuery("SELECT * FROM quotation_other_costs WHERE quotation_id=?", [id]);
    const transports = await db.runQuery("SELECT * FROM quotation_transport_costs WHERE quotation_id=?", [id]);

    res.json({
      ...quotation[0],
      garments,
      fabrics,
      yarns,
      trims,
      embs,
      washes,
      commls,
      others,
      transports
    });
  } catch (e) {
    handleError(res, e, "GET /api/quotations/:id");
  }
});

app.post('/api/quotations', async (req, res) => {
  try {
    const allowedRoles = ['super_admin', 'production_manager', 'merchandiser_manager', 'store_manager'];
    const userRole = req.headers['x-user-role'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access Denied: You do not have permission to edit price quotations." });
    }

    const {
      inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
      department, season, offer_qty, uom, costing_per, incoterm, team_leader, dealing_merchant,
      est_ship_date, size_group, mc_line, prod_line_hour, sewing_efficiency, cutting_efficiency,
      finishing_efficiency, qc_efficiency, prep_efficiency, yarn_cert, size_grading, country,
      buying_agent, buying_merchant, currency, color_range, sustainable_material, garments_cert,
      emb_type, emb_name, confirm_date, quotation_date, order_place_date, emb_note, incoterm_place,
      exchange_rate, pcs_carton, cbm_carton, remarks, image_url, files, garments,
      fabric_cost, trims_cost, emb_cost, wash_cost, comml_cost, lab_test, inspection_cost,
      cm_cost, sample_cost, freight_cost, other_cost, courier_cost, certif_cost, common_oh,
      deffd_lc, design_cost, studio_cost, opert_exp, income_tax, total_cost,
      transport_cost, asking_profit, revised_price, confirm_price, commi_dzn, target_price,
      fabrics, yarns, trims, embs, washes, commls, others, transports
    } = req.body;

    // Generate automatic ID matching PQ-001-2026-Jun-21
    let finalId = req.body.id;
    if (!finalId) {
      const d = new Date(quotation_date || new Date());
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateFormatted = `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;

      const countResult = await db.runQuery("SELECT COUNT(*) as count FROM price_quotations");
      const count = parseInt(countResult[0].count) + 1;

      finalId = `PQ-${String(count).padStart(3, '0')}-${dateFormatted}`;
    }

    const result = await db.runExec(
      `INSERT INTO price_quotations (
        id, inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
        department, season, offer_qty, uom, costing_per, incoterm, team_leader, dealing_merchant,
        est_ship_date, size_group, mc_line, prod_line_hour, sewing_efficiency, cutting_efficiency,
        finishing_efficiency, qc_efficiency, prep_efficiency, yarn_cert, size_grading, country,
        buying_agent, buying_merchant, currency, color_range, sustainable_material, garments_cert,
        emb_type, emb_name, confirm_date, quotation_date, order_place_date, emb_note, incoterm_place,
        exchange_rate, pcs_carton, cbm_carton, remarks, image_url, files, status,
        fabric_cost, trims_cost, emb_cost, wash_cost, comml_cost, lab_test, inspection_cost,
        cm_cost, sample_cost, freight_cost, other_cost, courier_cost, certif_cost, common_oh,
        deffd_lc, design_cost, studio_cost, opert_exp, income_tax, total_cost,
        transport_cost, asking_profit, revised_price, confirm_price, commi_dzn, target_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalId, inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
        department, season, offer_qty, uom, costing_per, incoterm || 'FOB', team_leader, dealing_merchant,
        est_ship_date, size_group, mc_line, prod_line_hour, sewing_efficiency, cutting_efficiency,
        finishing_efficiency, qc_efficiency, prep_efficiency, yarn_cert, size_grading, country,
        buying_agent, buying_merchant, currency || 'USD', color_range, sustainable_material, garments_cert,
        emb_type, emb_name, confirm_date, quotation_date, order_place_date, emb_note, incoterm_place,
        exchange_rate, pcs_carton, cbm_carton, remarks, image_url, JSON.stringify(files || []), 'Draft',
        fabric_cost || 0, trims_cost || 0, emb_cost || 0, wash_cost || 0, comml_cost || 0, lab_test || 0, inspection_cost || 0,
        cm_cost || 0, sample_cost || 0, freight_cost || 0, other_cost || 0, courier_cost || 0, certif_cost || 0, common_oh || 0,
        deffd_lc || 0, design_cost || 0, studio_cost || 0, opert_exp || 0, income_tax || 0, total_cost || 0,
        transport_cost || 0, asking_profit || 0, revised_price || 0, confirm_price || 0, commi_dzn || 0, target_price || 0
      ]
    );

    const quotationId = finalId;

    if (garments && garments.length > 0) {
      for (let g of garments) {
        await db.runExec(
          `INSERT INTO price_quotation_garments (price_quotation_id, garments_item, set_ratio, cutting_smv, sewing_smv, finishing_smv, total_smv)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [quotationId, g.garments_item, g.set_ratio, g.cutting_smv, g.sewing_smv, g.finishing_smv, g.total_smv]
        );
      }
    }

    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        await db.runExec(
          `INSERT INTO quotation_fabric_costs (
            quotation_id, item_name, body_part, part_type, color_range, color_nature,
            composition, fabric_type, source, supplier, gsm, dia_type, cons_basis,
            uom, grey_cons, rate, amount, total_qty, total_amount, process_loss_pct
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId, f.gmt_item, f.body_part, f.body_part_type, f.color_range, f.color_nature,
            f.composition, f.fabric_type, f.fabric_source, f.n_supplier, f.gsm_oz, f.dia_type, f.cons_basis,
            f.uom, f.grey_cons, f.rate, f.amount, f.total_qty, f.total_amount, f.process_loss_pct || 0
          ]
        );
      }
    }

    if (yarns && yarns.length > 0) {
      for (let y of yarns) {
        await db.runExec(
          `INSERT INTO quotation_yarn_costs (
            quotation_id, yarn_composition, yarn_count, yarn_type, percentage,
            color, cons_qty, process_loss_pct, supplier, rate, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId, y.yarn_composition, y.yarn_count, y.yarn_type, y.percentage,
            y.color, y.cons_qty, y.process_loss_pct || 0, y.supplier, y.rate, y.amount
          ]
        );
      }
    }

    if (trims && trims.length > 0) {
      for (let t of trims) {
        await db.runExec(
          `INSERT INTO quotation_trims_costs (
            quotation_id, gmt_item, item_name, item_desc, cons_uom, cons_unit,
            extra_pct, total_cons, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId, t.gmt_item, t.item_name, t.item_desc, t.cons_uom, t.cons_unit,
            t.extra_pct, t.total_cons, t.rate, t.amount, t.supplier, t.status
          ]
        );
      }
    }

    if (embs && embs.length > 0) {
      for (let e of embs) {
        await db.runExec(
          `INSERT INTO quotation_emb_costs (
            quotation_id, emb_type, emb_name, item_name, description, body_part,
            cons_unit, process_loss_pct, total_qty, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId, e.emb_type, e.emb_name, e.item_name, e.description, e.body_part,
            e.cons_unit, e.process_loss_pct, e.total_qty, e.rate, e.amount, e.supplier, e.status
          ]
        );
      }
    }

    if (washes && washes.length > 0) {
      for (let w of washes) {
        await db.runExec(
          `INSERT INTO quotation_wash_costs (
            quotation_id, wash_type, wash_name, item_name, description, body_part,
            cons_unit, process_loss_pct, total_qty, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quotationId, w.wash_type, w.wash_name, w.item_name, w.description, w.body_part,
            w.cons_unit, w.process_loss_pct, w.total_qty, w.rate, w.amount, w.supplier, w.status
          ]
        );
      }
    }

    if (commls && commls.length > 0) {
      for (let c of commls) {
        await db.runExec(
          `INSERT INTO quotation_comml_costs (
            quotation_id, comml_type, rate_pct, amount, status
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            quotationId, c.comml_type, c.rate_pct, c.amount, c.status
          ]
        );
      }
    }

    if (others && others.length > 0) {
      for (let o of others) {
        await db.runExec(
          `INSERT INTO quotation_other_costs (
            quotation_id, cost_details, amount
          ) VALUES (?, ?, ?)`,
          [
            quotationId, o.cost_details, o.amount
          ]
        );
      }
    }

    if (transports && transports.length > 0) {
      for (let t of transports) {
        await db.runExec(
          `INSERT INTO quotation_transport_costs (
            quotation_id, rate, cbm, amount
          ) VALUES (?, ?, ?, ?)`,
          [
            quotationId, t.rate, t.cbm, t.amount
          ]
        );
      }
    }

    res.status(201).json({ id: quotationId, message: "Price Quotation created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/quotations");
  }
});

app.put('/api/quotations/:id', async (req, res) => {
  try {
    const allowedRoles = ['super_admin', 'production_manager', 'merchandiser_manager', 'store_manager'];
    const userRole = req.headers['x-user-role'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Access Denied: You do not have permission to edit price quotations." });
    }

    const { id } = req.params;
    const {
      inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
      department, season, offer_qty, uom, costing_per, incoterm, team_leader, dealing_merchant,
      est_ship_date, size_group, mc_line, prod_line_hour, sewing_efficiency, cutting_efficiency,
      finishing_efficiency, qc_efficiency, prep_efficiency, yarn_cert, size_grading, country,
      buying_agent, buying_merchant, currency, color_range, sustainable_material, garments_cert,
      emb_type, emb_name, confirm_date, quotation_date, order_place_date, emb_note, incoterm_place,
      exchange_rate, pcs_carton, cbm_carton, remarks, image_url, files, garments,
      fabric_cost, trims_cost, emb_cost, wash_cost, comml_cost, lab_test, inspection_cost,
      cm_cost, sample_cost, freight_cost, other_cost, courier_cost, certif_cost, common_oh,
      deffd_lc, design_cost, studio_cost, opert_exp, income_tax, total_cost,
      transport_cost, asking_profit, revised_price, confirm_price, commi_dzn, target_price,
      fabrics, yarns, trims, embs, washes, commls, others, transports
    } = req.body;

    await db.runExec(
      `UPDATE price_quotations SET
        inquiry_id = ?, style_no = ?, buyer = ?, garments_category = ?, brand = ?, style_desc = ?, item_group = ?,
        department = ?, season = ?, offer_qty = ?, uom = ?, costing_per = ?, incoterm = ?, team_leader = ?, dealing_merchant = ?,
        est_ship_date = ?, size_group = ?, mc_line = ?, prod_line_hour = ?, sewing_efficiency = ?, cutting_efficiency = ?,
        finishing_efficiency = ?, qc_efficiency = ?, prep_efficiency = ?, yarn_cert = ?, size_grading = ?, country = ?,
        buying_agent = ?, buying_merchant = ?, currency = ?, color_range = ?, sustainable_material = ?, garments_cert = ?,
        emb_type = ?, emb_name = ?, confirm_date = ?, quotation_date = ?, order_place_date = ?, emb_note = ?, incoterm_place = ?,
        exchange_rate = ?, pcs_carton = ?, cbm_carton = ?, remarks = ?, image_url = ?,
        fabric_cost = ?, trims_cost = ?, emb_cost = ?, wash_cost = ?, comml_cost = ?, lab_test = ?, inspection_cost = ?,
        cm_cost = ?, sample_cost = ?, freight_cost = ?, other_cost = ?, courier_cost = ?, certif_cost = ?, common_oh = ?,
        deffd_lc = ?, design_cost = ?, studio_cost = ?, opert_exp = ?, income_tax = ?, total_cost = ?,
        transport_cost = ?, asking_profit = ?, revised_price = ?, confirm_price = ?, commi_dzn = ?, target_price = ?
      WHERE id = ?`,
      [
        inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
        department, season, offer_qty, uom, costing_per, incoterm || 'FOB', team_leader, dealing_merchant,
        est_ship_date, size_group, mc_line, prod_line_hour, sewing_efficiency, cutting_efficiency,
        finishing_efficiency, qc_efficiency, prep_efficiency, yarn_cert, size_grading, country,
        buying_agent, buying_merchant, currency || 'USD', color_range, sustainable_material, garments_cert,
        emb_type, emb_name, confirm_date, quotation_date, order_place_date, emb_note, incoterm_place,
        exchange_rate, pcs_carton, cbm_carton, remarks, image_url,
        fabric_cost || 0, trims_cost || 0, emb_cost || 0, wash_cost || 0, comml_cost || 0, lab_test || 0, inspection_cost || 0,
        cm_cost || 0, sample_cost || 0, freight_cost || 0, other_cost || 0, courier_cost || 0, certif_cost || 0, common_oh || 0,
        deffd_lc || 0, design_cost || 0, studio_cost || 0, opert_exp || 0, income_tax || 0, total_cost || 0,
        transport_cost || 0, asking_profit || 0, revised_price || 0, confirm_price || 0, commi_dzn || 0, target_price || 0,
        id
      ]
    );

    // Delete existing relation records
    await db.runExec("DELETE FROM price_quotation_garments WHERE price_quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_fabric_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_yarn_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_trims_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_emb_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_wash_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_comml_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_other_costs WHERE quotation_id = ?", [id]);
    await db.runExec("DELETE FROM quotation_transport_costs WHERE quotation_id = ?", [id]);

    // Insert updated relations
    if (garments && garments.length > 0) {
      for (let g of garments) {
        await db.runExec(
          `INSERT INTO price_quotation_garments (price_quotation_id, garments_item, set_ratio, cutting_smv, sewing_smv, finishing_smv, total_smv)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, g.garments_item, g.set_ratio, g.cutting_smv, g.sewing_smv, g.finishing_smv, g.total_smv]
        );
      }
    }

    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        await db.runExec(
          `INSERT INTO quotation_fabric_costs (
            quotation_id, item_name, body_part, part_type, color_range, color_nature,
            composition, fabric_type, source, supplier, gsm, dia_type, cons_basis,
            uom, grey_cons, rate, amount, total_qty, total_amount, process_loss_pct
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, f.gmt_item || f.item_name, f.body_part, f.body_part_type || f.part_type, f.color_range, f.color_nature,
            f.composition, f.fabric_type, f.fabric_source || f.source, f.n_supplier || f.supplier, f.gsm_oz || f.gsm, f.dia_type, f.cons_basis,
            f.uom, f.grey_cons, f.rate, f.amount, f.total_qty, f.total_amount, f.process_loss_pct || 0
          ]
        );
      }
    }

    if (yarns && yarns.length > 0) {
      for (let y of yarns) {
        await db.runExec(
          `INSERT INTO quotation_yarn_costs (
            quotation_id, yarn_composition, yarn_count, yarn_type, percentage,
            color, cons_qty, process_loss_pct, supplier, rate, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, y.yarn_composition, y.yarn_count, y.yarn_type, y.percentage,
            y.color, y.cons_qty, y.process_loss_pct || 0, y.supplier, y.rate, y.amount
          ]
        );
      }
    }

    if (trims && trims.length > 0) {
      for (let t of trims) {
        await db.runExec(
          `INSERT INTO quotation_trims_costs (
            quotation_id, gmt_item, item_name, item_desc, cons_uom, cons_unit,
            extra_pct, total_cons, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, t.gmt_item, t.item_name, t.item_desc, t.cons_uom, t.cons_unit,
            t.extra_pct, t.total_cons, t.rate, t.amount, t.supplier, t.status
          ]
        );
      }
    }

    if (embs && embs.length > 0) {
      for (let e of embs) {
        await db.runExec(
          `INSERT INTO quotation_emb_costs (
            quotation_id, emb_type, emb_name, item_name, description, body_part,
            cons_unit, process_loss_pct, total_qty, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, e.emb_type, e.emb_name, e.item_name, e.description, e.body_part,
            e.cons_unit, e.process_loss_pct, e.total_qty, e.rate, e.amount, e.supplier, e.status
          ]
        );
      }
    }

    if (washes && washes.length > 0) {
      for (let w of washes) {
        await db.runExec(
          `INSERT INTO quotation_wash_costs (
            quotation_id, wash_type, wash_name, item_name, description, body_part,
            cons_unit, process_loss_pct, total_qty, rate, amount, supplier, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, w.wash_type, w.wash_name, w.item_name, w.description, w.body_part,
            w.cons_unit, w.process_loss_pct, w.total_qty, w.rate, w.amount, w.supplier, w.status
          ]
        );
      }
    }

    if (commls && commls.length > 0) {
      for (let c of commls) {
        await db.runExec(
          `INSERT INTO quotation_comml_costs (
            quotation_id, comml_type, rate_pct, amount, status
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            id, c.comml_type, c.rate_pct, c.amount, c.status
          ]
        );
      }
    }

    if (others && others.length > 0) {
      for (let o of others) {
        await db.runExec(
          `INSERT INTO quotation_other_costs (
            quotation_id, cost_details, amount
          ) VALUES (?, ?, ?)`,
          [
            id, o.cost_details, o.amount
          ]
        );
      }
    }

    if (transports && transports.length > 0) {
      for (let t of transports) {
        await db.runExec(
          `INSERT INTO quotation_transport_costs (
            quotation_id, rate, cbm, amount
          ) VALUES (?, ?, ?, ?)`,
          [
            id, t.rate, t.cbm, t.amount
          ]
        );
      }
    }

    res.json({ id, message: "Price Quotation updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/quotations/:id");
  }
});

app.put('/api/quotations/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_by, status, comments } = req.body;
    const newStatus = status || 'Approved';
    await db.runExec(
      "UPDATE price_quotations SET status=?, approved_by=?, comments=? WHERE id=?",
      [newStatus, approved_by || 'Store Manager', comments || null, id]
    );
    res.json({ message: `Price Quotation status updated to ${newStatus} successfully.` });
  } catch (e) {
    handleError(res, e, "PUT /api/quotations/:id/approve");
  }
});

// 6. Order Entry & PO Breakdown Endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT o.*, 
        (SELECT SUM(po_qty) FROM order_pos WHERE order_id = o.id) as total_qty,
        (SELECT SUM(po_qty * fob_price) FROM order_pos WHERE order_id = o.id) as total_value
      FROM orders o
      ORDER BY o.id DESC
    `);
    for (let row of rows) {
      row.pos = await db.runQuery("SELECT * FROM order_pos WHERE order_id=?", [row.id]);
      for (let po of row.pos) {
        po.breakdown = await db.runQuery("SELECT * FROM order_po_breakdown WHERE po_id=?", [po.id]);
      }
    }
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/orders");
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await db.runQuery("SELECT * FROM orders WHERE id=?", [id]);
    if (orderResult.length === 0) return res.status(404).json({ error: "Order not found" });

    const pos = await db.runQuery("SELECT * FROM order_pos WHERE order_id=?", [id]);

    // Fetch breakdown for each PO
    for (let po of pos) {
      po.breakdown = await db.runQuery("SELECT * FROM order_po_breakdown WHERE po_id=?", [po.id]);
    }

    res.json({
      ...orderResult[0],
      pos
    });
  } catch (e) {
    handleError(res, e, "GET /api/orders/:id");
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
      style_no, inquiry_id, buyer, style_desc, order_status, category, season,
      team_leader, dealing_merchant, factory_merchant, currency, uom, smv,
      repeat_no, model_code, garment_dept, embellishment_type, embellishment_name,
      ship_mode, quality_label, garment_weight, avg_weight, image_url, yarn_type,
      yarn_comp, yarn_cert, embellishment_notes, special_instruction, terms, status, pos
    } = req.body;

    const result = await db.runExec(
      `INSERT INTO orders (style_no, inquiry_id, buyer, style_desc, order_status, category, season,
        team_leader, dealing_merchant, factory_merchant, currency, uom, smv, repeat_no, model_code,
        garment_dept, embellishment_type, embellishment_name, ship_mode, quality_label, garment_weight,
        avg_weight, image_url, yarn_type, yarn_comp, yarn_cert, embellishment_notes, special_instruction, terms, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [style_no, inquiry_id, buyer, style_desc, order_status, category, season,
        team_leader, dealing_merchant, factory_merchant, currency, uom, smv,
        repeat_no, model_code, garment_dept, embellishment_type, embellishment_name,
        ship_mode, quality_label, garment_weight, avg_weight, image_url, yarn_type,
        yarn_comp, yarn_cert, embellishment_notes, special_instruction, terms, status || 'Draft']
    );
    const orderId = result.insertId;

    // Save POs and their breakdowns
    if (pos && pos.length > 0) {
      for (let po of pos) {
        const poResult = await db.runExec(
          `INSERT INTO order_pos (order_id, po_no, status, received_date, ex_factory_date, ship_date,
            week_no, lead_time, po_qty, fob_price, carton_info, comm_file_no, packing_ratio, delay_for,
            po_status, remarks, delivery_country, code, area, pcs_per_pack, fob_in_dzn, internal_ref_no,
            print_qty, embroidery_qty, area_code, cutoff_date, cutoff_val, division, country_ship_date,
            pack_type, port_of_discharge, product_type, req_hanger, matrix_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, po.po_no, po.status, po.received_date, po.ex_factory_date, po.ship_date,
            po.week_no, po.lead_time, po.po_qty, po.fob_price, po.carton_info, po.comm_file_no,
            po.packing_ratio, po.delay_for, po.po_status, po.remarks, po.delivery_country, po.code,
            po.area, po.pcs_per_pack, po.fob_in_dzn, po.internal_ref_no, po.print_qty, po.embroidery_qty,
            po.area_code, po.cutoff_date, po.cutoff_val, po.division, po.country_ship_date, po.pack_type,
            po.port_of_discharge, po.product_type, po.req_hanger, po.matrix_type]
        );
        const poId = poResult.insertId;

        if (po.breakdown && po.breakdown.length > 0) {
          for (let b of po.breakdown) {
            await db.runExec(
              `INSERT INTO order_po_breakdown (po_id, color, size, set_qty, pcs_qty, rate, ex_cut_pct,
                plan_cut_qty, article_no, amount, garments_item)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [poId, b.color, b.size, b.set_qty, b.pcs_qty, b.rate, b.ex_cut_pct,
                b.plan_cut_qty, b.article_no, b.amount, b.garments_item]
            );
          }
        }
      }
    }

    if (status === 'Approved' || order_status === 'Confirm') {
      await updateSalesTargetsAchievement(buyer, season, pos);
    }

    res.status(201).json({ id: orderId, message: "Order created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/orders");
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      style_no, inquiry_id, buyer, style_desc, order_status, category, season,
      team_leader, dealing_merchant, factory_merchant, currency, uom, smv,
      repeat_no, model_code, garment_dept, embellishment_type, embellishment_name,
      ship_mode, quality_label, garment_weight, avg_weight, image_url, yarn_type,
      yarn_comp, yarn_cert, embellishment_notes, special_instruction, terms, status, pos
    } = req.body;

    await db.runExec(
      `UPDATE orders SET style_no=?, inquiry_id=?, buyer=?, style_desc=?, order_status=?, category=?,
        season=?, team_leader=?, dealing_merchant=?, factory_merchant=?, currency=?, uom=?, smv=?,
        repeat_no=?, model_code=?, garment_dept=?, embellishment_type=?, embellishment_name=?,
        ship_mode=?, quality_label=?, garment_weight=?, avg_weight=?, image_url=?, yarn_type=?, 
        yarn_comp=?, yarn_cert=?, embellishment_notes=?, special_instruction=?, terms=?, status=? WHERE id=?`,
      [style_no, inquiry_id, buyer, style_desc, order_status, category, season,
        team_leader, dealing_merchant, factory_merchant, currency, uom, smv,
        repeat_no, model_code, garment_dept, embellishment_type, embellishment_name,
        ship_mode, quality_label, garment_weight, avg_weight, image_url, yarn_type,
        yarn_comp, yarn_cert, embellishment_notes, special_instruction, terms, status, id]
    );

    // Fetch existing PO IDs to delete breakdowns
    const existingPOs = await db.runQuery("SELECT id FROM order_pos WHERE order_id=?", [id]);
    for (let po of existingPOs) {
      await db.runExec("DELETE FROM order_po_breakdown WHERE po_id=?", [po.id]);
    }
    await db.runExec("DELETE FROM order_pos WHERE order_id=?", [id]);

    // Save POs and their breakdowns
    if (pos && pos.length > 0) {
      for (let po of pos) {
        const poResult = await db.runExec(
          `INSERT INTO order_pos (order_id, po_no, status, received_date, ex_factory_date, ship_date,
            week_no, lead_time, po_qty, fob_price, carton_info, comm_file_no, packing_ratio, delay_for,
            po_status, remarks, delivery_country, code, area, pcs_per_pack, fob_in_dzn, internal_ref_no,
            print_qty, embroidery_qty, area_code, cutoff_date, cutoff_val, division, country_ship_date,
            pack_type, port_of_discharge, product_type, req_hanger, matrix_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, po.po_no, po.status, po.received_date, po.ex_factory_date, po.ship_date,
            po.week_no, po.lead_time, po.po_qty, po.fob_price, po.carton_info, po.comm_file_no,
            po.packing_ratio, po.delay_for, po.po_status, po.remarks, po.delivery_country, po.code,
            po.area, po.pcs_per_pack, po.fob_in_dzn, po.internal_ref_no, po.print_qty, po.embroidery_qty,
            po.area_code, po.cutoff_date, po.cutoff_val, po.division, po.country_ship_date, po.pack_type,
            po.port_of_discharge, po.product_type, po.req_hanger, po.matrix_type]
        );
        const poId = poResult.insertId;

        if (po.breakdown && po.breakdown.length > 0) {
          for (let b of po.breakdown) {
            await db.runExec(
              `INSERT INTO order_po_breakdown (po_id, color, size, set_qty, pcs_qty, rate, ex_cut_pct,
                plan_cut_qty, article_no, amount, garments_item)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [poId, b.color, b.size, b.set_qty, b.pcs_qty, b.rate, b.ex_cut_pct,
                b.plan_cut_qty, b.article_no, b.amount, b.garments_item]
            );
          }
        }
      }
    }

    if (status === 'Approved' || order_status === 'Confirm') {
      await updateSalesTargetsAchievement(buyer, season, pos);
    }

    res.json({ message: "Order updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/orders/:id");
  }
});

app.put('/api/orders/:id/approve-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, feedback_comments } = req.body;

    await db.runExec(
      "UPDATE orders SET status=?, approved_by=?, feedback_comments=? WHERE id=?",
      [status, approved_by || null, feedback_comments || null, id]
    );

    if (status === 'Approved') {
      const order = await db.runQuery("SELECT buyer, season FROM orders WHERE id=?", [id]);
      if (order.length > 0) {
        const pos = await db.runQuery("SELECT * FROM order_pos WHERE order_id=?", [id]);
        await updateSalesTargetsAchievement(order[0].buyer, order[0].season, pos);
      }
    }

    res.json({ message: `Order status updated to ${status} successfully.` });
  } catch (e) {
    handleError(res, e, "PUT /api/orders/:id/approve-status");
  }
});

async function updateSalesTargetsAchievement(buyerName, season, pos) {
  try {
    const buyerResult = await db.runQuery("SELECT id FROM buyers WHERE name=?", [buyerName]);
    if (buyerResult.length === 0) return;
    const buyerId = buyerResult[0].id;

    // Sum PO Qty and Value
    let totalQty = 0;
    let totalVal = 0;
    if (pos) {
      pos.forEach(p => {
        totalQty += parseFloat(p.po_qty || 0);
        totalVal += parseFloat(p.po_qty || 0) * parseFloat(p.fob_price || 0);
      });
    }

    // Fetch sales targets matching this buyer, season and current year
    const currentYear = new Date().getFullYear();
    const targets = await db.runQuery(
      "SELECT id, confirm_qty, confirm_value FROM sales_targets WHERE buyer_id=? AND season=? AND year=?",
      [buyerId, season, currentYear]
    );

    if (targets.length > 0) {
      // Update target achievement values
      const targetId = targets[0].id;
      const newQty = parseFloat(targets[0].confirm_qty || 0) + totalQty;
      const newVal = parseFloat(targets[0].confirm_value || 0) + totalVal;
      await db.runExec(
        "UPDATE sales_targets SET confirm_qty=?, confirm_value=? WHERE id=?",
        [newQty, newVal, targetId]
      );
    }
  } catch (err) {
    console.error("Failed to update sales target achievements:", err);
  }
}

// 7. Budgeting & Financial Control Endpoints
app.get('/api/budgets', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT b.*, 
        COALESCE(b.style_no, o.style_no) as style_no, 
        COALESCE(b.buyer, o.buyer) as buyer, 
        COALESCE(b.season, o.season) as season,
        o.dealing_merchant as dealing_merchant,
        (SELECT SUM(po_qty) FROM order_pos WHERE order_id = o.id) as order_qty
      FROM budgets b
      LEFT JOIN orders o ON b.order_id = o.id
      ORDER BY b.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/budgets");
  }
});

app.get('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await db.runQuery("SELECT * FROM budgets WHERE id=?", [id]);
    if (budget.length === 0) return res.status(404).json({ error: "Budget not found" });

    const items = await db.runQuery("SELECT * FROM budget_items WHERE budget_id=?", [id]);

    // Fabrics
    const fabrics = await db.runQuery("SELECT * FROM budget_fabric_costs WHERE budget_id=?", [id]);
    for (let f of fabrics) {
      f.consumption = await db.runQuery("SELECT * FROM budget_fabric_consumption WHERE budget_fabric_cost_id=?", [f.id]);
      f.yarns = await db.runQuery("SELECT * FROM budget_yarn_costing WHERE budget_fabric_cost_id=?", [f.id]);
    }

    // Trims
    const trims = await db.runQuery("SELECT * FROM budget_trims_costs WHERE budget_id=?", [id]);
    for (let t of trims) {
      t.consumption = await db.runQuery("SELECT * FROM budget_trims_consumption WHERE budget_trims_cost_id=?", [t.id]);
    }

    // Embellishments
    const embs = await db.runQuery("SELECT * FROM budget_emb_costs WHERE budget_id=?", [id]);
    for (let e of embs) {
      e.consumption = await db.runQuery("SELECT * FROM budget_emb_consumption WHERE budget_emb_cost_id=?", [e.id]);
    }

    // Wash
    const washes = await db.runQuery("SELECT * FROM budget_wash_costs WHERE budget_id=?", [id]);
    for (let w of washes) {
      w.consumption = await db.runQuery("SELECT * FROM budget_wash_consumption WHERE budget_wash_cost_id=?", [w.id]);
    }

    // Commercial
    const commls = await db.runQuery("SELECT * FROM budget_comml_costs WHERE budget_id=?", [id]);

    // Commissions
    const commissions = await db.runQuery("SELECT * FROM budget_commission_costs WHERE budget_id=?", [id]);

    // Other Costs list
    const others = await db.runQuery("SELECT * FROM budget_other_costs WHERE budget_id=?", [id]);

    res.json({
      ...budget[0],
      items,
      fabrics,
      trims,
      embs,
      washes,
      commls,
      commissions,
      others
    });
  } catch (e) {
    handleError(res, e, "GET /api/budgets/:id");
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const {
      order_id, budget_reference, total_fabric_budget, total_trims_budget,
      total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
      total_commercial_budget, total_commission_budget, total_budget_amount, status,
      buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
      ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
      sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
      incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
      total_lab_test_budget, total_inspection_budget, total_sample_budget,
      total_freight_budget, total_courier_budget, total_certif_budget,
      total_common_oh_budget, total_deffd_lc_budget, total_design_budget,
      total_studio_budget, total_opert_exp_budget, total_income_tax_budget,
      company, unit, feedback_from_approval, approve_by, user_remarks,
      quotation_id, style_no, style_desc, department,
      items, fabrics, trims, embs, washes, commls, commissions, others
    } = req.body;

    const result = await db.runExec(
      `INSERT INTO budgets (order_id, budget_reference, total_fabric_budget, total_trims_budget,
        total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
        total_commercial_budget, total_commission_budget, total_budget_amount, status,
        buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
        ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
        sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
        incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
        total_lab_test_budget, total_inspection_budget, total_sample_budget,
        total_freight_budget, total_courier_budget, total_certif_budget,
        total_common_oh_budget, total_deffd_lc_budget, total_design_budget,
        total_studio_budget, total_opert_exp_budget, total_income_tax_budget,
        company, unit, feedback_from_approval, approve_by, user_remarks,
        quotation_id, style_no, style_desc, department)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_id, budget_reference, total_fabric_budget, total_trims_budget,
        total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
        total_commercial_budget, total_commission_budget, total_budget_amount, status || 'Draft',
        buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
        ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
        sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
        incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
        total_lab_test_budget || 0, total_inspection_budget || 0, total_sample_budget || 0,
        total_freight_budget || 0, total_courier_budget || 0, total_certif_budget || 0,
        total_common_oh_budget || 0, total_deffd_lc_budget || 0, total_design_budget || 0,
        total_studio_budget || 0, total_opert_exp_budget || 0, total_income_tax_budget || 0,
        company || null, unit || null, feedback_from_approval || null, approve_by || null, user_remarks || null,
        quotation_id || null, style_no || null, style_desc || null, department || null]
    );
    const budgetId = result.insertId;

    if (items && items.length > 0) {
      for (let item of items) {
        await db.runExec(
          "INSERT INTO budget_items (budget_id, item_type, budget_qty, budget_rate, budget_amount, actual_qty, actual_amount) VALUES (?, ?, ?, ?, ?, 0, 0)",
          [budgetId, item.item_type, item.budget_qty, item.budget_rate, item.budget_amount]
        );
      }
    }

    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        const fRes = await db.runExec(
          `INSERT INTO budget_fabric_costs (
            budget_id, gmt_item, body_part, body_part_type, color_range, color_nature,
            composition, fabric_type, fabric_nature, code, fabric_source, n_supplier,
            gsm_oz, dia_type, color_size_sensitive, color, cons_basis, uom, grey_cons,
            rate, amount, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            budgetId, f.gmt_item, f.body_part, f.body_part_type, f.color_range, f.color_nature,
            f.composition, f.fabric_type, f.fabric_nature, f.code, f.fabric_source, f.n_supplier,
            f.gsm_oz, f.dia_type, f.color_size_sensitive, f.color, f.cons_basis, f.uom, f.grey_cons,
            f.rate, f.amount, f.total_qty, f.total_amount
          ]
        );
        const fId = fRes.insertId;

        if (f.consumption && f.consumption.length > 0) {
          for (let c of f.consumption) {
            await db.runExec(
              `INSERT INTO budget_fabric_consumption (
                budget_fabric_cost_id, po_no, color, gmt_sizes, po_qty, dia_width,
                dia_fin_type, finish_cons, process_loss_pct, grey_cons, rate, amount,
                pcs, total_finish_qty, total_qty, sample_qty, total_amount, remarks
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.dia_width,
                c.dia_fin_type, c.finish_cons, c.process_loss_pct, c.grey_cons, c.rate, c.amount,
                c.pcs, c.total_finish_qty, c.total_qty, c.sample_qty, c.total_amount, c.remarks
              ]
            );
          }
        }

        if (f.fabric_source === 'Production' && f.yarns && f.yarns.length > 0) {
          for (let y of f.yarns) {
            await db.runExec(
              `INSERT INTO budget_yarn_costing (
                budget_fabric_cost_id, yarn_composition, yarn_count, yarn_type, percentage,
                color, cons_qty, process_loss_pct, n_supplier, rate, amount
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fId, y.yarn_composition, y.yarn_count, y.yarn_type, y.percentage,
                y.color, y.cons_qty, y.process_loss_pct, y.n_supplier, y.rate, y.amount
              ]
            );
          }
        }
      }
    }

    if (trims && trims.length > 0) {
      for (let t of trims) {
        const tRes = await db.runExec(
          `INSERT INTO budget_trims_costs (
            budget_id, gmt_item, item_name, item_description, cons_uom, cons_unit_gmt,
            rate, amount, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            budgetId, t.gmt_item, t.item_name, t.item_description, t.cons_uom, t.cons_unit_gmt,
            t.rate, t.amount, t.total_qty, t.total_amount
          ]
        );
        const tId = tRes.insertId;

        if (t.consumption && t.consumption.length > 0) {
          for (let c of t.consumption) {
            await db.runExec(
              `INSERT INTO budget_trims_consumption (
                budget_trims_cost_id, po_no, color, gmt_sizes, po_qty, country,
                finish_cons, process_loss_pct, grey_cons, rate, amount, pcs,
                total_finish_qty, total_qty, total_amount
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                tId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.finish_cons, c.process_loss_pct, c.grey_cons, c.rate, c.amount, c.pcs,
                c.total_finish_qty, c.total_qty, c.total_amount
              ]
            );
          }
        }
      }
    }

    if (embs && embs.length > 0) {
      for (let e of embs) {
        const eRes = await db.runExec(
          `INSERT INTO budget_emb_costs (
            budget_id, emb_type, emb_name, gmt_item, description, body_part,
            cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            budgetId, e.emb_type, e.emb_name, e.gmt_item, e.description, e.body_part,
            e.cons_unit_gmt, e.rate, e.amount, e.total_qty, e.total_amount, e.supplier, e.image_url
          ]
        );
        const eId = eRes.insertId;

        if (e.consumption && e.consumption.length > 0) {
          for (let c of e.consumption) {
            await db.runExec(
              `INSERT INTO budget_emb_consumption (
                budget_emb_cost_id, po_no, color, gmt_sizes, po_qty, country,
                cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                eId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.cons, c.process_loss_pct, c.rate, c.amount, c.total_qty, c.total_amount, c.pcs
              ]
            );
          }
        }
      }
    }

    if (washes && washes.length > 0) {
      for (let w of washes) {
        const wRes = await db.runExec(
          `INSERT INTO budget_wash_costs (
            budget_id, wash_type, wash_name, gmt_item, description, body_part,
            cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            budgetId, w.wash_type, w.wash_name, w.gmt_item, w.description, w.body_part,
            w.cons_unit_gmt, w.rate, w.amount, w.total_qty, w.total_amount, w.supplier, w.image_url
          ]
        );
        const wId = wRes.insertId;

        if (w.consumption && w.consumption.length > 0) {
          for (let c of w.consumption) {
            await db.runExec(
              `INSERT INTO budget_wash_consumption (
                budget_wash_cost_id, po_no, color, gmt_sizes, po_qty, country,
                cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                wId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.cons, c.process_loss_pct, c.rate, c.amount, c.total_qty, c.total_amount, c.pcs
              ]
            );
          }
        }
      }
    }

    if (commls && commls.length > 0) {
      for (let c of commls) {
        await db.runExec(
          `INSERT INTO budget_comml_costs (budget_id, commercial_type, rate_pct, amount, status)
           VALUES (?, ?, ?, ?, ?)`,
          [budgetId, c.commercial_type, c.rate_pct, c.amount, c.status]
        );
      }
    }

    if (commissions && commissions.length > 0) {
      for (let c of commissions) {
        await db.runExec(
          `INSERT INTO budget_commission_costs (budget_id, particulars, comm_base, rate, amount, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [budgetId, c.particulars, c.comm_base, c.rate, c.amount, c.status]
        );
      }
    }

    if (others && others.length > 0) {
      for (let o of others) {
        await db.runExec(
          `INSERT INTO budget_other_costs (budget_id, cost_details, amount)
           VALUES (?, ?, ?)`,
          [budgetId, o.cost_details, o.amount]
        );
      }
    }

    res.status(201).json({ id: budgetId, message: "Budget created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/budgets");
  }
});

app.put('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, order_id, budget_reference, total_fabric_budget, total_trims_budget,
      total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
      total_commercial_budget, total_commission_budget, total_budget_amount,
      buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
      ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
      sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
      incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
      total_lab_test_budget, total_inspection_budget, total_sample_budget,
      total_freight_budget, total_courier_budget, total_certif_budget,
      total_common_oh_budget, total_deffd_lc_budget, total_design_budget,
      total_studio_budget, total_opert_exp_budget, total_income_tax_budget,
      feedback_from_approval, approve_by, user_remarks, company, unit,
      quotation_id, style_no, style_desc, department,
      items, fabrics, trims, embs, washes, commls, commissions, others
    } = req.body;

    const currentBudget = await db.runQuery("SELECT status FROM budgets WHERE id=?", [id]);
    if (currentBudget.length > 0 && currentBudget[0].status === 'Approved' && status === 'Approved') {
      await db.runExec(
        `UPDATE budgets SET status=?, approve_by=?, feedback_from_approval=?, user_remarks=? WHERE id=?`,
        [status, approve_by || null, feedback_from_approval || null, user_remarks || null, id]
      );
      return res.json({ message: "Budget status updated successfully" });
    }

    await db.runExec(
      `UPDATE budgets SET 
        order_id=?, budget_reference=?, total_fabric_budget=?, total_trims_budget=?,
        total_cm_budget=?, total_emb_budget=?, total_wash_budget=?, total_other_budget=?,
        total_commercial_budget=?, total_commission_budget=?, total_budget_amount=?, status=?,
        buyer=?, season=?, uom=?, smv=?, incoterm=?, mc_line=?, prod_line_hour=?, country=?, currency=?,
        ship_mode=?, remarks=?, budget_minute=?, cutting_smv=?, sewing_smv=?, finishing_smv=?,
        sewing_efficiency=?, cutting_efficiency=?, finishing_efficiency=?, buying_agent=?,
        incoterm_place=?, costing_date=?, copy_from=?, file_no=?, internal_ref=?, budget_label=?,
        total_lab_test_budget=?, total_inspection_budget=?, total_sample_budget=?,
        total_freight_budget=?, total_courier_budget=?, total_certif_budget=?,
        total_common_oh_budget=?, total_deffd_lc_budget=?, total_design_budget=?,
        total_studio_budget=?, total_opert_exp_budget=?, total_income_tax_budget=?,
        approve_by=?, feedback_from_approval=?, user_remarks=?, company=?, unit=?,
        quotation_id=?, style_no=?, style_desc=?, department=?
       WHERE id=?`,
      [
        order_id, budget_reference, total_fabric_budget, total_trims_budget,
        total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
        total_commercial_budget, total_commission_budget, total_budget_amount, status || 'Draft',
        buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
        ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
        sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
        incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
        total_lab_test_budget || 0, total_inspection_budget || 0, total_sample_budget || 0,
        total_freight_budget || 0, total_courier_budget || 0, total_certif_budget || 0,
        total_common_oh_budget || 0, total_deffd_lc_budget || 0, total_design_budget || 0,
        total_studio_budget || 0, total_opert_exp_budget || 0, total_income_tax_budget || 0,
        approve_by || null, feedback_from_approval || null, user_remarks || null,
        company || null, unit || null,
        quotation_id || null, style_no || null, style_desc || null, department || null,
        id
      ]
    );

    await db.runExec("DELETE FROM budget_items WHERE budget_id=?", [id]);
    if (items && items.length > 0) {
      for (let item of items) {
        await db.runExec(
          "INSERT INTO budget_items (budget_id, item_type, budget_qty, budget_rate, budget_amount, actual_qty, actual_amount) VALUES (?, ?, ?, ?, ?, 0, 0)",
          [id, item.item_type, item.budget_qty, item.budget_rate, item.budget_amount]
        );
      }
    }

    const oldFabrics = await db.runQuery("SELECT id FROM budget_fabric_costs WHERE budget_id=?", [id]);
    for (let f of oldFabrics) {
      await db.runExec("DELETE FROM budget_fabric_consumption WHERE budget_fabric_cost_id=?", [f.id]);
      await db.runExec("DELETE FROM budget_yarn_costing WHERE budget_fabric_cost_id=?", [f.id]);
    }
    await db.runExec("DELETE FROM budget_fabric_costs WHERE budget_id=?", [id]);

    if (fabrics && fabrics.length > 0) {
      for (let f of fabrics) {
        const fRes = await db.runExec(
          `INSERT INTO budget_fabric_costs (
            budget_id, gmt_item, body_part, body_part_type, color_range, color_nature,
            composition, fabric_type, fabric_nature, code, fabric_source, n_supplier,
            gsm_oz, dia_type, color_size_sensitive, color, cons_basis, uom, grey_cons,
            rate, amount, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, f.gmt_item, f.body_part, f.body_part_type, f.color_range, f.color_nature,
            f.composition, f.fabric_type, f.fabric_nature, f.code, f.fabric_source, f.n_supplier,
            f.gsm_oz, f.dia_type, f.color_size_sensitive, f.color, f.cons_basis, f.uom, f.grey_cons,
            f.rate, f.amount, f.total_qty, f.total_amount
          ]
        );
        const fId = fRes.insertId;

        if (f.consumption && f.consumption.length > 0) {
          for (let c of f.consumption) {
            await db.runExec(
              `INSERT INTO budget_fabric_consumption (
                budget_fabric_cost_id, po_no, color, gmt_sizes, po_qty, dia_width,
                dia_fin_type, finish_cons, process_loss_pct, grey_cons, rate, amount,
                pcs, total_finish_qty, total_qty, sample_qty, total_amount, remarks
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.dia_width,
                c.dia_fin_type, c.finish_cons, c.process_loss_pct, c.grey_cons, c.rate, c.amount,
                c.pcs, c.total_finish_qty, c.total_qty, c.sample_qty, c.total_amount, c.remarks
              ]
            );
          }
        }

        if (f.fabric_source === 'Production' && f.yarns && f.yarns.length > 0) {
          for (let y of f.yarns) {
            await db.runExec(
              `INSERT INTO budget_yarn_costing (
                budget_fabric_cost_id, yarn_composition, yarn_count, yarn_type, percentage,
                color, cons_qty, process_loss_pct, n_supplier, rate, amount
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                fId, y.yarn_composition, y.yarn_count, y.yarn_type, y.percentage,
                y.color, y.cons_qty, y.process_loss_pct, y.n_supplier, y.rate, y.amount
              ]
            );
          }
        }
      }
    }

    const oldTrims = await db.runQuery("SELECT id FROM budget_trims_costs WHERE budget_id=?", [id]);
    for (let t of oldTrims) {
      await db.runExec("DELETE FROM budget_trims_consumption WHERE budget_trims_cost_id=?", [t.id]);
    }
    await db.runExec("DELETE FROM budget_trims_costs WHERE budget_id=?", [id]);

    if (trims && trims.length > 0) {
      for (let t of trims) {
        const tRes = await db.runExec(
          `INSERT INTO budget_trims_costs (
            budget_id, gmt_item, item_name, item_description, cons_uom, cons_unit_gmt,
            rate, amount, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, t.gmt_item, t.item_name, t.item_description, t.cons_uom, t.cons_unit_gmt,
            t.rate, t.amount, t.total_qty, t.total_amount
          ]
        );
        const tId = tRes.insertId;

        if (t.consumption && t.consumption.length > 0) {
          for (let c of t.consumption) {
            await db.runExec(
              `INSERT INTO budget_trims_consumption (
                budget_trims_cost_id, po_no, color, gmt_sizes, po_qty, country,
                finish_cons, process_loss_pct, grey_cons, rate, amount, pcs,
                total_finish_qty, total_qty, total_amount
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                tId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.finish_cons, c.process_loss_pct, c.grey_cons, c.rate, c.amount, c.pcs,
                c.total_finish_qty, c.total_qty, c.total_amount
              ]
            );
          }
        }
      }
    }

    const oldEmbs = await db.runQuery("SELECT id FROM budget_emb_costs WHERE budget_id=?", [id]);
    for (let e of oldEmbs) {
      await db.runExec("DELETE FROM budget_emb_consumption WHERE budget_emb_cost_id=?", [e.id]);
    }
    await db.runExec("DELETE FROM budget_emb_costs WHERE budget_id=?", [id]);

    if (embs && embs.length > 0) {
      for (let e of embs) {
        const eRes = await db.runExec(
          `INSERT INTO budget_emb_costs (
            budget_id, emb_type, emb_name, gmt_item, description, body_part,
            cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, e.emb_type, e.emb_name, e.gmt_item, e.description, e.body_part,
            e.cons_unit_gmt, e.rate, e.amount, e.total_qty, e.total_amount, e.supplier, e.image_url
          ]
        );
        const eId = eRes.insertId;

        if (e.consumption && e.consumption.length > 0) {
          for (let c of e.consumption) {
            await db.runExec(
              `INSERT INTO budget_emb_consumption (
                budget_emb_cost_id, po_no, color, gmt_sizes, po_qty, country,
                cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                eId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.cons, c.process_loss_pct, c.rate, c.amount, c.total_qty, c.total_amount, c.pcs
              ]
            );
          }
        }
      }
    }

    const oldWashes = await db.runQuery("SELECT id FROM budget_wash_costs WHERE budget_id=?", [id]);
    for (let w of oldWashes) {
      await db.runExec("DELETE FROM budget_wash_consumption WHERE budget_wash_cost_id=?", [w.id]);
    }
    await db.runExec("DELETE FROM budget_wash_costs WHERE budget_id=?", [id]);

    if (washes && washes.length > 0) {
      for (let w of washes) {
        const wRes = await db.runExec(
          `INSERT INTO budget_wash_costs (
            budget_id, wash_type, wash_name, gmt_item, description, body_part,
            cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, w.wash_type, w.wash_name, w.gmt_item, w.description, w.body_part,
            w.cons_unit_gmt, w.rate, w.amount, w.total_qty, w.total_amount, w.supplier, w.image_url
          ]
        );
        const wId = wRes.insertId;

        if (w.consumption && w.consumption.length > 0) {
          for (let c of w.consumption) {
            await db.runExec(
              `INSERT INTO budget_wash_consumption (
                budget_wash_cost_id, po_no, color, gmt_sizes, po_qty, country,
                cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                wId, c.po_no, c.color, c.gmt_sizes, c.po_qty, c.country,
                c.cons, c.process_loss_pct, c.rate, c.amount, c.total_qty, c.total_amount, c.pcs
              ]
            );
          }
        }
      }
    }

    await db.runExec("DELETE FROM budget_comml_costs WHERE budget_id=?", [id]);
    if (commls && commls.length > 0) {
      for (let c of commls) {
        await db.runExec(
          `INSERT INTO budget_comml_costs (budget_id, commercial_type, rate_pct, amount, status)
           VALUES (?, ?, ?, ?, ?)`,
          [id, c.commercial_type, c.rate_pct, c.amount, c.status]
        );
      }
    }

    await db.runExec("DELETE FROM budget_commission_costs WHERE budget_id=?", [id]);
    if (commissions && commissions.length > 0) {
      for (let c of commissions) {
        await db.runExec(
          `INSERT INTO budget_commission_costs (budget_id, particulars, comm_base, rate, amount, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, c.particulars, c.comm_base, c.rate, c.amount, c.status]
        );
      }
    }

    await db.runExec("DELETE FROM budget_other_costs WHERE budget_id=?", [id]);
    if (others && others.length > 0) {
      for (let o of others) {
        await db.runExec(
          `INSERT INTO budget_other_costs (budget_id, cost_details, amount)
           VALUES (?, ?, ?)`,
          [id, o.cost_details, o.amount]
        );
      }
    }

    res.json({ message: "Budget updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/budgets/:id");
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await db.runQuery("SELECT status FROM budgets WHERE id=?", [id]);
    if (current.length === 0) return res.status(404).json({ error: "Budget not found" });
    if (current[0].status === 'Approved') {
      return res.status(400).json({ error: "Cannot delete an approved budget." });
    }

    await db.runExec("DELETE FROM budgets WHERE id=?", [id]);
    await db.runExec("DELETE FROM budget_items WHERE budget_id=?", [id]);

    const oldFabrics = await db.runQuery("SELECT id FROM budget_fabric_costs WHERE budget_id=?", [id]);
    for (let f of oldFabrics) {
      await db.runExec("DELETE FROM budget_fabric_consumption WHERE budget_fabric_cost_id=?", [f.id]);
      await db.runExec("DELETE FROM budget_yarn_costing WHERE budget_fabric_cost_id=?", [f.id]);
    }
    await db.runExec("DELETE FROM budget_fabric_costs WHERE budget_id=?", [id]);

    const oldTrims = await db.runQuery("SELECT id FROM budget_trims_costs WHERE budget_id=?", [id]);
    for (let t of oldTrims) {
      await db.runExec("DELETE FROM budget_trims_consumption WHERE budget_trims_cost_id=?", [t.id]);
    }
    await db.runExec("DELETE FROM budget_trims_costs WHERE budget_id=?", [id]);

    const oldEmbs = await db.runQuery("SELECT id FROM budget_emb_costs WHERE budget_id=?", [id]);
    for (let e of oldEmbs) {
      await db.runExec("DELETE FROM budget_emb_consumption WHERE budget_emb_cost_id=?", [e.id]);
    }
    await db.runExec("DELETE FROM budget_emb_costs WHERE budget_id=?", [id]);

    const oldWashes = await db.runQuery("SELECT id FROM budget_wash_costs WHERE budget_id=?", [id]);
    for (let w of oldWashes) {
      await db.runExec("DELETE FROM budget_wash_consumption WHERE budget_wash_cost_id=?", [w.id]);
    }
    await db.runExec("DELETE FROM budget_wash_costs WHERE budget_id=?", [id]);

    await db.runExec("DELETE FROM budget_comml_costs WHERE budget_id=?", [id]);
    await db.runExec("DELETE FROM budget_commission_costs WHERE budget_id=?", [id]);
    await db.runExec("DELETE FROM budget_other_costs WHERE budget_id=?", [id]);

    res.json({ message: "Budget deleted successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/budgets/:id");
  }
});

// Budget Template Endpoints
app.post('/api/budget-templates', async (req, res) => {
  try {
    const { template_name, item_type, template_data } = req.body;
    await db.runExec(
      `INSERT INTO budget_templates (template_name, item_type, template_data) VALUES (?, ?, ?)`,
      [template_name, item_type, JSON.stringify(template_data)]
    );
    res.status(201).json({ message: "Template saved successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/budget-templates");
  }
});

app.get('/api/budget-templates/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const rows = await db.runQuery("SELECT * FROM budget_templates WHERE item_type=?", [type]);
    res.json(rows.map(r => ({ ...r, template_data: JSON.parse(r.template_data) })));
  } catch (e) {
    handleError(res, e, "GET /api/budget-templates/:type");
  }
});

// 8. Fabric Booking Endpoints (with BUDGET LIMIT CHECK validation)
app.get('/api/fabric-bookings', async (req, res) => {
  try {
    const { company, unit, role } = req.query;
    let query = `
      SELECT fb.*, b.budget_reference, o.style_no, o.buyer 
      FROM fabric_bookings fb
      LEFT JOIN budgets b ON fb.budget_id = b.id
      LEFT JOIN orders o ON b.order_id = o.id
    `;
    let params = [];
    if (role === 'admin_user') {
      query += ` WHERE fb.company = ? `;
      params.push(company);
    } else if (role === 'unit_user') {
      query += ` WHERE fb.company = ? AND fb.unit = ? `;
      params.push(company, unit);
    }
    query += ` ORDER BY fb.id DESC `;
    const rows = await db.runQuery(query, params);

    for (let r of rows) {
      r.items = await db.runQuery("SELECT * FROM fabric_booking_items WHERE booking_id = ?", [r.id]);
    }

    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/fabric-bookings");
  }
});

app.get('/api/fabric-bookings/last-attention', async (req, res) => {
  try {
    const row = await db.runQuery("SELECT attention FROM fabric_bookings ORDER BY id DESC LIMIT 1");
    res.json({ attention: row.length > 0 ? row[0].attention : '' });
  } catch (e) {
    handleError(res, e, "GET /api/fabric-bookings/last-attention");
  }
});

app.get('/api/fabric-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.runQuery("SELECT * FROM fabric_bookings WHERE id=?", [id]);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    const items = await db.runQuery("SELECT * FROM fabric_booking_items WHERE booking_id=?", [id]);
    res.json({
      ...booking[0],
      items
    });
  } catch (e) {
    handleError(res, e, "GET /api/fabric-bookings/:id");
  }
});

app.get('/api/fabric-bookings/booked-quantity/:budgetId', async (req, res) => {
  try {
    const { budgetId } = req.params;
    const rows = await db.runQuery(`
      SELECT fbi.po_no, fbi.garments_item, fbi.body_parts, fbi.color, fbi.fabric_type, fbi.fabric_composition,
             SUM(fbi.work_order_quantity) as booked_qty
      FROM fabric_booking_items fbi
      JOIN fabric_bookings fb ON fbi.booking_id = fb.id
      WHERE fb.budget_id = ? AND fb.status = 'Approved'
      GROUP BY fbi.po_no, fbi.garments_item, fbi.body_parts, fbi.color, fbi.fabric_type, fbi.fabric_composition
    `, [budgetId]);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/fabric-bookings/booked-quantity/:budgetId");
  }
});

app.post('/api/fabric-bookings', async (req, res) => {
  try {
    const {
      booking_reference, budget_id, basis, main_booking_id, booking_date, supplier_name,
      delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
      collar_cuff_info, terms_conditions, status, company, unit, booking_by, items,
      linked_main_booking_ids, buyer, style_no, fabric_source, fabric_composition, dealing_merchant
    } = req.body;

    // VALIDATION 1: Verify Budget exists and is APPROVED
    const budgetResult = await db.runQuery("SELECT status, total_fabric_budget, total_budget_amount, actual_spend FROM budgets WHERE id=?", [budget_id]);
    if (budgetResult.length === 0) {
      return res.status(400).json({ error: "Associated budget not found." });
    }

    const budget = budgetResult[0];
    if (budget.status !== 'Approved') {
      return res.status(400).json({ error: "Booking Blocked: The budget for this order is not approved yet." });
    }

    // VALIDATION 2: For Short Booking, verify main bookings exist and are fully approved and completed
    if (basis === 'Short') {
      const ids = Array.isArray(linked_main_booking_ids)
        ? linked_main_booking_ids
        : (main_booking_id ? [main_booking_id.toString()] : []);

      if (ids.length === 0) {
        return res.status(400).json({ error: "Booking Blocked: Short booking requires reference to at least one Approved Main Booking ID." });
      }

      let totalMainQty = 0;
      let totalBudgetQty = 0;

      for (const mid of ids) {
        const mainBooking = await db.runQuery("SELECT status FROM fabric_bookings WHERE id=?", [parseInt(mid)]);
        if (mainBooking.length === 0 || mainBooking[0].status !== 'Approved') {
          return res.status(400).json({ error: `Booking Blocked: Referenced Main Booking ID ${mid} is not approved.` });
        }

        const mainItems = await db.runQuery("SELECT work_order_quantity, budget_quantity FROM fabric_booking_items WHERE booking_id=?", [parseInt(mid)]);
        mainItems.forEach(item => {
          totalMainQty += parseFloat(item.work_order_quantity || 0);
          totalBudgetQty += parseFloat(item.budget_quantity || 0);
        });
      }

      if (totalMainQty < totalBudgetQty && totalBudgetQty > 0) {
        return res.status(400).json({
          error: `Booking Blocked: Cannot place Short Booking. The referenced Main Booking quantity (${totalMainQty.toFixed(2)}) has not fully completed the Budget quantity (${totalBudgetQty.toFixed(2)}).`
        });
      }
    }

    // AUTO GENERATE ITEMS if empty
    let finalItems = items;
    if ((!finalItems || finalItems.length === 0) && basis === 'Main') {
      finalItems = [];
      const budgetDetailResult = await db.runQuery("SELECT * FROM budgets WHERE id=?", [budget_id]);
      if (budgetDetailResult.length > 0) {
        const budgetDetail = budgetDetailResult[0];
        const fabrics = await db.runQuery("SELECT * FROM budget_fabric_costs WHERE budget_id=?", [budget_id]);
        for (let fab of fabrics) {
          const consumptions = await db.runQuery("SELECT * FROM budget_fabric_consumption WHERE budget_fabric_cost_id=?", [fab.id]);
          const yarns = await db.runQuery("SELECT * FROM budget_yarn_costing WHERE budget_fabric_cost_id=?", [fab.id]);
          const embs = await db.runQuery("SELECT * FROM budget_emb_costs WHERE budget_id=?", [budget_id]);

          for (let cons of consumptions) {
            const isProd = String(fab.fabric_source).toLowerCase() === 'production';
            const yarnDetail = isProd && yarns?.[0] ? `${yarns[0].yarn_composition} ${yarns[0].yarn_count}` : 'N/A';
            const embType = embs?.[0]?.emb_type || 'N/A';
            const embName = embs?.[0]?.emb_name || 'N/A';

            // Filter out already booked quantity
            const bookedQuantityResult = await db.runQuery(`
              SELECT SUM(fbi.work_order_quantity) as booked_qty
              FROM fabric_booking_items fbi
              JOIN fabric_bookings fb ON fbi.booking_id = fb.id
              WHERE fb.budget_id = ? AND fb.status = 'Approved'
                AND fbi.po_no = ? AND fbi.garments_item = ? AND fbi.body_parts = ? AND fbi.color = ? AND fbi.fabric_type = ? AND fbi.fabric_composition = ?
            `, [budget_id, cons.po_no, fab.gmt_item, fab.body_part, cons.color, fab.fabric_type, fab.composition]);

            const bookedQty = parseFloat(bookedQuantityResult[0]?.booked_qty || 0);
            const remainingQty = parseFloat(cons.total_qty || 0) - bookedQty;

            if (remainingQty > 0) {
              finalItems.push({
                po_id: cons.po_id || 1,
                po_no: cons.po_no,
                color: cons.color,
                size: cons.gmt_sizes || 'M',
                item_size: cons.gmt_sizes || 'M',
                garments_qty: cons.po_qty || 0,
                excess_pct: cons.process_loss_pct || 0,
                total_qty: remainingQty,
                rate: cons.rate || 0,
                amount: remainingQty * (cons.rate || 0),
                buyer: budgetDetail.buyer,
                style_no: budgetDetail.style_no,
                garments_item: fab.gmt_item || 'Polo Shirt',
                body_parts: fab.body_part || 'Body Fabric',
                fabric_color: cons.color,
                yarn_type: yarnDetail,
                embellishment_type: embType,
                embellishment_name: embName,
                fabric_type: fab.fabric_type || 'Jersey',
                fabric_composition: fab.composition || '100% Cotton',
                gsm: fab.gsm_oz || 180,
                fabric_dia: cons.dia_width || fab.dia_type || 'Open Width',
                lab_dip: '',
                garments_quantity: cons.po_qty || 0,
                total_fabric_quantity: remainingQty,
                uom: fab.uom || 'Kg',
                budget_quantity: cons.total_qty || 0,
                work_order_quantity: remainingQty
              });
            }
          }
        }
      }
    }

    // VALIDATION 3: BUDGET LIMIT QUANTITY & VALUE CHECK (based on work_order_quantity)
    let newBookingTotalAmount = 0;
    if (finalItems) {
      finalItems.forEach(it => {
        newBookingTotalAmount += parseFloat(it.rate || 0) * parseFloat(it.work_order_quantity || 0);
      });
    }

    // Get current total fabric bookings approved for this budget
    const existingFabricBookings = await db.runQuery(`
      SELECT SUM(fbi.rate * fbi.work_order_quantity) as total 
      FROM fabric_booking_items fbi
      JOIN fabric_bookings fb ON fbi.booking_id = fb.id
      WHERE fb.budget_id = ? AND fb.status = 'Approved'
    `, [budget_id]);

    const currentFabricBookedAmount = parseFloat(existingFabricBookings[0].total || 0);
    const allowedFabricBudget = parseFloat(budget.total_fabric_budget || 0);

    if (currentFabricBookedAmount + newBookingTotalAmount > allowedFabricBudget) {
      return res.status(400).json({
        error: `Over-Budget Booking Blocked! Total Fabric bookings (${(currentFabricBookedAmount + newBookingTotalAmount).toFixed(2)}) would exceed the approved Fabric Budget (${allowedFabricBudget.toFixed(2)}).`
      });
    }

    const linkedMainIds = req.body.linked_main_booking_ids;
    const linkedMainStr = Array.isArray(linkedMainIds) ? JSON.stringify(linkedMainIds) : (typeof linkedMainIds === 'string' ? linkedMainIds : '[]');
    const primaryMainId = Array.isArray(linkedMainIds) && linkedMainIds.length > 0 ? parseInt(linkedMainIds[0]) : (main_booking_id || null);

    // Create the booking
    const result = await db.runExec(
      `INSERT INTO fabric_bookings (booking_reference, budget_id, basis, main_booking_id, booking_date,
        supplier_name, delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
        collar_cuff_info, terms_conditions, status, company, unit, booking_by, linked_main_booking_ids,
        buyer, style_no, fabric_source, fabric_composition, dealing_merchant)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_reference, budget_id, basis, primaryMainId, booking_date, supplier_name,
        delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
        JSON.stringify(collar_cuff_info), terms_conditions, status || 'Draft', company, unit, booking_by, linkedMainStr,
        buyer, style_no, fabric_source, fabric_composition, dealing_merchant]
    );
    const bookingId = result.insertId;

    // Save booking items
    if (finalItems && finalItems.length > 0) {
      for (let it of finalItems) {
        const yarnTag = it.yarn_tag || 'YT-991';
        const garmentsCert = it.garments_cert || 'Oeko-Tex 100';
        await db.runExec(
          `INSERT INTO fabric_booking_items (booking_id, po_id, po_no, color, size, item_size, garments_qty,
            excess_pct, total_qty, rate, amount, buyer, style_no, garments_item, body_parts, fabric_color,
            yarn_type, embellishment_type, embellishment_name, fabric_type, fabric_composition, gsm,
            fabric_dia, lab_dip, garments_quantity, total_fabric_quantity, uom, budget_quantity, work_order_quantity,
            yarn_tag, garments_cert)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, it.po_id, it.po_no, it.color, it.size, it.item_size, it.garments_qty,
            it.excess_pct, it.total_qty, it.rate, it.amount, it.buyer, it.style_no, it.garments_item, it.body_parts,
            it.fabric_color, it.yarn_type, it.embellishment_type, it.embellishment_name, it.fabric_type,
            it.fabric_composition, it.gsm, it.fabric_dia, it.lab_dip, it.garments_quantity, it.total_fabric_quantity,
            it.uom, it.budget_quantity, it.work_order_quantity,
            yarnTag, garmentsCert]
        );
      }
    }

    // Update actual spend on budget if status is Approved
    if (status === 'Approved') {
      const newSpend = parseFloat(budget.actual_spend || 0) + newBookingTotalAmount;
      const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
      await db.runExec(
        "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
        [newSpend, overBudgetStatus, budget_id]
      );
    }

    res.status(201).json({ id: bookingId, message: "Fabric booking created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/fabric-bookings");
  }
});

app.put('/api/fabric-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, booking_reference, budget_id, basis, main_booking_id, booking_date, supplier_name,
      delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
      collar_cuff_info, terms_conditions, company, unit, booking_by, items, linked_main_booking_ids,
      buyer, style_no, fabric_source, fabric_composition, dealing_merchant } = req.body;

    const booking = await db.runQuery("SELECT * FROM fabric_bookings WHERE id=?", [id]);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    // Status toggle update
    if (status && !items) {
      const approvedBy = req.body.approved_by || (status === 'Approved' ? 'Production Manager' : null);
      const approvedDate = req.body.approved_date || (status === 'Approved' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null);
      await db.runExec("UPDATE fabric_bookings SET status=?, approved_by=?, approved_date=? WHERE id=?", [status, approvedBy, approvedDate, id]);

      // If approved, update the budget actual spend
      if (status === 'Approved' && booking[0].status !== 'Approved') {
        const itemsList = await db.runQuery("SELECT SUM(rate * work_order_quantity) as total FROM fabric_booking_items WHERE booking_id=?", [id]);
        const bookingCost = parseFloat(itemsList[0].total || 0);

        const budgetResult = await db.runQuery("SELECT id, actual_spend, total_budget_amount FROM budgets WHERE id=?", [booking[0].budget_id]);
        if (budgetResult.length > 0) {
          const budget = budgetResult[0];
          const newSpend = parseFloat(budget.actual_spend || 0) + bookingCost;
          const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
          await db.runExec(
            "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
            [newSpend, overBudgetStatus, budget.id]
          );
        }
      }
      return res.json({ message: "Fabric booking status updated successfully" });
    }

    // VALIDATION: For Short Booking, verify main bookings exist and are fully approved and completed
    if (basis === 'Short') {
      const ids = Array.isArray(linked_main_booking_ids)
        ? linked_main_booking_ids
        : (main_booking_id ? [main_booking_id.toString()] : []);

      if (ids.length === 0) {
        return res.status(400).json({ error: "Booking Blocked: Short booking requires reference to at least one Approved Main Booking ID." });
      }

      let totalMainQty = 0;
      let totalBudgetQty = 0;

      for (const mid of ids) {
        const mainBooking = await db.runQuery("SELECT status FROM fabric_bookings WHERE id=?", [parseInt(mid)]);
        if (mainBooking.length === 0 || mainBooking[0].status !== 'Approved') {
          return res.status(400).json({ error: `Booking Blocked: Referenced Main Booking ID ${mid} is not approved.` });
        }

        const mainItems = await db.runQuery("SELECT work_order_quantity, budget_quantity FROM fabric_booking_items WHERE booking_id=?", [parseInt(mid)]);
        mainItems.forEach(item => {
          totalMainQty += parseFloat(item.work_order_quantity || 0);
          totalBudgetQty += parseFloat(item.budget_quantity || 0);
        });
      }

      if (totalMainQty < totalBudgetQty && totalBudgetQty > 0) {
        return res.status(400).json({
          error: `Booking Blocked: Cannot place Short Booking. The referenced Main Booking quantity (${totalMainQty.toFixed(2)}) has not fully completed the Budget quantity (${totalBudgetQty.toFixed(2)}).`
        });
      }
    }

    const linkedMainIds = req.body.linked_main_booking_ids;
    const linkedMainStr = Array.isArray(linkedMainIds) ? JSON.stringify(linkedMainIds) : (typeof linkedMainIds === 'string' ? linkedMainIds : '[]');
    const primaryMainId = Array.isArray(linkedMainIds) && linkedMainIds.length > 0 ? parseInt(linkedMainIds[0]) : (main_booking_id || null);

    const approvedBy = req.body.approved_by || (status === 'Approved' ? 'Production Manager' : null);
    const approvedDate = req.body.approved_date || (status === 'Approved' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null);

    // Full booking record update
    await db.runExec(
      `UPDATE fabric_bookings SET 
        booking_reference=?, budget_id=?, basis=?, main_booking_id=?, booking_date=?,
        supplier_name=?, delivery_date=?, inhouse_date=?, pay_mode=?, source=?, currency=?,
        attention=?, remarks=?, collar_cuff_info=?, terms_conditions=?, status=?, company=?, unit=?, booking_by=?, linked_main_booking_ids=?,
        approved_by=?, approved_date=?, buyer=?, style_no=?, fabric_source=?, fabric_composition=?, dealing_merchant=?
      WHERE id=?`,
      [booking_reference, budget_id, basis, primaryMainId, booking_date, supplier_name,
        delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
        JSON.stringify(collar_cuff_info), terms_conditions, status || 'Draft', company, unit, booking_by, linkedMainStr,
        approvedBy, approvedDate, buyer, style_no, fabric_source, fabric_composition, dealing_merchant, id]
    );

    // Re-create booking items
    await db.runExec("DELETE FROM fabric_booking_items WHERE booking_id=?", [id]);

    if (items && items.length > 0) {
      for (let it of items) {
        const yarnTag = it.yarn_tag || 'YT-991';
        const garmentsCert = it.garments_cert || 'Oeko-Tex 100';
        await db.runExec(
          `INSERT INTO fabric_booking_items (booking_id, po_id, po_no, color, size, item_size, garments_qty,
            excess_pct, total_qty, rate, amount, buyer, style_no, garments_item, body_parts, fabric_color,
            yarn_type, embellishment_type, embellishment_name, fabric_type, fabric_composition, gsm,
            fabric_dia, lab_dip, garments_quantity, total_fabric_quantity, uom, budget_quantity, work_order_quantity,
            yarn_tag, garments_cert)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, it.po_id, it.po_no, it.color, it.size, it.item_size, it.garments_qty,
            it.excess_pct, it.total_qty, it.rate, it.amount, it.buyer, it.style_no, it.garments_item, it.body_parts,
            it.fabric_color, it.yarn_type, it.embellishment_type, it.embellishment_name, it.fabric_type,
            it.fabric_composition, it.gsm, it.fabric_dia, it.lab_dip, it.garments_quantity, it.total_fabric_quantity,
            it.uom, it.budget_quantity, it.work_order_quantity,
            yarnTag, garmentsCert]
        );
      }
    }

    res.json({ message: "Fabric booking updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/fabric-bookings/:id");
  }
});

app.delete('/api/fabric-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookingResult = await db.runQuery("SELECT * FROM fabric_bookings WHERE id=?", [id]);
    if (bookingResult.length === 0) return res.status(404).json({ error: "Booking not found" });
    const booking = bookingResult[0];

    // Deduct actual spend on budget if status was Approved
    if (booking.status === 'Approved') {
      const itemsQuery = await db.runQuery("SELECT SUM(rate * work_order_quantity) as total FROM fabric_booking_items WHERE booking_id=?", [id]);
      const bookingCost = parseFloat(itemsQuery[0].total || 0);

      const budgetResult = await db.runQuery("SELECT id, actual_spend, total_budget_amount FROM budgets WHERE id=?", [booking.budget_id]);
      if (budgetResult.length > 0) {
        const budget = budgetResult[0];
        const newSpend = Math.max(0, parseFloat(budget.actual_spend || 0) - bookingCost);
        const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
        await db.runExec(
          "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
          [newSpend, overBudgetStatus, budget.id]
        );
      }
    }

    await db.runExec("DELETE FROM fabric_booking_items WHERE booking_id=?", [id]);
    await db.runExec("DELETE FROM fabric_bookings WHERE id=?", [id]);

    res.json({ message: "Fabric booking deleted successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/fabric-bookings/:id");
  }
});

// 9. Trims Booking Endpoints (with BUDGET LIMIT CHECK validation)
// 9. Trims Booking Endpoints (with BUDGET LIMIT CHECK validation)
app.get('/api/trims-bookings', async (req, res) => {
  try {
    const { company, unit, role } = req.query;
    let query = `
      SELECT tb.*, b.budget_reference, o.style_no, o.buyer 
      FROM trims_bookings tb
      LEFT JOIN budgets b ON tb.budget_id = b.id
      LEFT JOIN orders o ON b.order_id = o.id
    `;
    let params = [];
    if (role === 'admin_user') {
      query += ` WHERE tb.company = ? `;
      params.push(company);
    } else if (role === 'unit_user') {
      query += ` WHERE tb.company = ? AND tb.unit = ? `;
      params.push(company, unit);
    }
    query += ` ORDER BY tb.id DESC `;
    const rows = await db.runQuery(query, params);

    // Populate items for each booking
    for (let r of rows) {
      r.items = await db.runQuery("SELECT * FROM trims_booking_items WHERE booking_id = ?", [r.id]);
    }

    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/trims-bookings");
  }
});

app.get('/api/trims-bookings/last-attention', async (req, res) => {
  try {
    const row = await db.runQuery("SELECT attention FROM trims_bookings ORDER BY id DESC LIMIT 1");
    res.json({ attention: row.length > 0 ? row[0].attention : '' });
  } catch (e) {
    handleError(res, e, "GET /api/trims-bookings/last-attention");
  }
});

app.get('/api/trims-bookings/booked-quantity/:budgetId', async (req, res) => {
  try {
    const { budgetId } = req.params;
    const rows = await db.runQuery(`
      SELECT tbi.po_no, tbi.item_name, tbi.garments_color, tbi.item_desc,
             SUM(tbi.work_order_qty) as booked_qty
      FROM trims_booking_items tbi
      JOIN trims_bookings tb ON tbi.booking_id = tb.id
      WHERE tb.budget_id = ? AND tb.status = 'Approved'
      GROUP BY tbi.po_no, tbi.item_name, tbi.garments_color, tbi.item_desc
    `, [budgetId]);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/trims-bookings/booked-quantity/:budgetId");
  }
});

app.get('/api/trims-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db.runQuery("SELECT * FROM trims_bookings WHERE id=?", [id]);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    const items = await db.runQuery("SELECT * FROM trims_booking_items WHERE booking_id=?", [id]);
    res.json({
      ...booking[0],
      items
    });
  } catch (e) {
    handleError(res, e, "GET /api/trims-bookings/:id");
  }
});

app.post('/api/trims-bookings', async (req, res) => {
  try {
    const {
      booking_reference, budget_id, basis, main_booking_id, booking_date, source,
      supplier_name, delivery_date, inhouse_date, pay_mode, currency, attention, remarks,
      booking_label, terms_conditions, status, company, unit, booking_by, items
    } = req.body;

    // VALIDATION 1: Verify Budget approved
    const budgetResult = await db.runQuery("SELECT status, total_trims_budget, total_budget_amount, actual_spend FROM budgets WHERE id=?", [budget_id]);
    if (budgetResult.length === 0) {
      return res.status(400).json({ error: "Associated budget not found." });
    }

    const budget = budgetResult[0];
    if (budget.status !== 'Approved') {
      return res.status(400).json({ error: "Booking Blocked: The budget for this order is not approved yet." });
    }

    // VALIDATION 2: BUDGET LIMIT CHECK FOR TRIMS
    let newBookingTotalAmount = 0;
    if (items) {
      items.forEach(it => {
        const woQty = parseFloat(it.work_order_qty || 0);
        const excess = parseInt(it.excess_pct || 0);
        const finalQty = woQty * (1 + excess / 100);
        newBookingTotalAmount += parseFloat(it.rate || 0) * finalQty;
      });
    }

    const existingTrimsBookings = await db.runQuery(`
      SELECT SUM(tbi.rate * tbi.final_wo_qty) as total 
      FROM trims_booking_items tbi
      JOIN trims_bookings tb ON tbi.booking_id = tb.id
      WHERE tb.budget_id = ? AND tb.status = 'Approved'
    `, [budget_id]);

    const currentTrimsBookedAmount = parseFloat(existingTrimsBookings[0].total || 0);
    const allowedTrimsBudget = parseFloat(budget.total_trims_budget || 0);

    if (currentTrimsBookedAmount + newBookingTotalAmount > allowedTrimsBudget) {
      return res.status(400).json({
        error: `Over-Budget Booking Blocked! Total Trims bookings (${(currentTrimsBookedAmount + newBookingTotalAmount).toFixed(2)}) would exceed the approved Trims Budget (${allowedTrimsBudget.toFixed(2)}).`
      });
    }

    // Create the trims booking
    const created_date = new Date().toISOString();
    const result = await db.runExec(
      `INSERT INTO trims_bookings (booking_reference, budget_id, basis, main_booking_id, booking_date,
        source, supplier_name, delivery_date, inhouse_date, pay_mode, currency, attention, remarks,
        booking_label, terms_conditions, status, company, unit, booking_by, created_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_reference, budget_id, basis, main_booking_id || null, booking_date, source, supplier_name,
        delivery_date, inhouse_date, pay_mode, currency, attention, remarks,
        booking_label, terms_conditions, status || 'Pending', company, unit, booking_by, created_date]
    );
    const bookingId = result.insertId;

    if (items && items.length > 0) {
      for (let it of items) {
        const woQty = parseFloat(it.work_order_qty || 0);
        const excess = parseInt(it.excess_pct || 0);
        const finalQty = woQty * (1 + excess / 100);
        const calculatedAmount = finalQty * parseFloat(it.rate || 0);

        await db.runExec(
          `INSERT INTO trims_booking_items (booking_id, po_id, garments_color, item_color, item_name,
            item_desc, required_qty, prev_booked_qty, work_order_qty, excess_pct, final_wo_qty, rate, amount,
            buyer, style_no, po_no, garments_item, garments_shipment_date, item_booking_date, item_delivery_date,
            supplier, sensitivity, short_booking_qty, uom, payment_mode, source, booking_by, rmg_quantity, contrast_color, remarks, garments_cert)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, it.po_id, it.garments_color, it.item_color, it.item_name, it.item_desc,
            it.required_qty, it.prev_booked_qty || 0, woQty, excess, finalQty,
            it.rate, calculatedAmount, it.buyer, it.style_no, it.po_no, it.garments_item, it.garments_shipment_date,
            it.item_booking_date, it.item_delivery_date, it.supplier, it.sensitivity, it.short_booking_qty || 0,
            it.uom, it.payment_mode, it.source, it.booking_by, it.rmg_quantity || 0, it.contrast_color || '', it.remarks || '', it.garments_cert || 'Oeko-Tex 100']
        );

      }
    }

    // Update actual spend on budget if status is Approved
    if (status === 'Approved') {
      const newSpend = parseFloat(budget.actual_spend || 0) + newBookingTotalAmount;
      const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
      await db.runExec(
        "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
        [newSpend, overBudgetStatus, budget_id]
      );
    }

    res.status(201).json({ id: bookingId, message: "Trims booking created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/trims-bookings");
  }
});

app.put('/api/trims-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, basis, main_booking_id, booking_date, source, supplier_name, delivery_date,
      inhouse_date, pay_mode, currency, attention, remarks, booking_label, terms_conditions,
      items, booking_by, feedback_by_approval_body, approved_by
    } = req.body;

    const bookingResult = await db.runQuery("SELECT * FROM trims_bookings WHERE id=?", [id]);
    if (bookingResult.length === 0) return res.status(404).json({ error: "Booking not found" });
    const oldBooking = bookingResult[0];

    // Set approval_date_time if transitioning to Approved
    let approval_date_time = oldBooking.approval_date_time;
    if (status === 'Approved' && oldBooking.status !== 'Approved') {
      approval_date_time = new Date().toISOString();
    }

    const finalApprovedBy = approved_by || (status === 'Approved' ? 'Super Admin' : oldBooking.approved_by);

    // Update trims_bookings table
    await db.runExec(
      `UPDATE trims_bookings SET
        status=?, basis=?, main_booking_id=?, booking_date=?, source=?, supplier_name=?,
        delivery_date=?, inhouse_date=?, pay_mode=?, currency=?, attention=?, remarks=?,
        booking_label=?, terms_conditions=?, booking_by=?, approval_date_time=?,
        feedback_by_approval_body=?, approved_by=?
      WHERE id=?`,
      [status || oldBooking.status, basis || oldBooking.basis, main_booking_id || oldBooking.main_booking_id,
      booking_date || oldBooking.booking_date, source || oldBooking.source, supplier_name || oldBooking.supplier_name,
      delivery_date || oldBooking.delivery_date, inhouse_date || oldBooking.inhouse_date,
      pay_mode || oldBooking.pay_mode, currency || oldBooking.currency, attention || oldBooking.attention,
      remarks || oldBooking.remarks, booking_label || oldBooking.booking_label,
      terms_conditions || oldBooking.terms_conditions, booking_by || oldBooking.booking_by,
        approval_date_time,
      feedback_by_approval_body !== undefined ? feedback_by_approval_body : oldBooking.feedback_by_approval_body,
        finalApprovedBy,
        id]
    );

    // Rebuild trims booking items if items are passed in request body
    if (items) {
      // Delete old items
      await db.runExec("DELETE FROM trims_booking_items WHERE booking_id=?", [id]);

      // Insert new items
      for (let it of items) {
        const woQty = parseFloat(it.work_order_qty || 0);
        const excess = parseInt(it.excess_pct || 0);
        const finalQty = woQty * (1 + excess / 100);
        const calculatedAmount = finalQty * parseFloat(it.rate || 0);

        await db.runExec(
          `INSERT INTO trims_booking_items (booking_id, po_id, garments_color, item_color, item_name,
            item_desc, required_qty, prev_booked_qty, work_order_qty, excess_pct, final_wo_qty, rate, amount,
            buyer, style_no, po_no, garments_item, garments_shipment_date, item_booking_date, item_delivery_date,
            supplier, sensitivity, short_booking_qty, uom, payment_mode, source, booking_by, rmg_quantity, contrast_color, remarks, garments_cert)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, it.po_id, it.garments_color, it.item_color, it.item_name, it.item_desc,
            it.required_qty, it.prev_booked_qty || 0, woQty, excess, finalQty,
            it.rate, calculatedAmount, it.buyer, it.style_no, it.po_no, it.garments_item, it.garments_shipment_date,
            it.item_booking_date, it.item_delivery_date, it.supplier, it.sensitivity, it.short_booking_qty || 0,
            it.uom, it.payment_mode, it.source, it.booking_by, it.rmg_quantity || 0, it.contrast_color || '', it.remarks || '', it.garments_cert || 'Oeko-Tex 100']
        );
      }
    }


    // Update budget actual spend if status is Approved and was not approved before
    if (status === 'Approved' && oldBooking.status !== 'Approved') {
      const itemsQuery = await db.runQuery("SELECT SUM(rate * final_wo_qty) as total FROM trims_booking_items WHERE booking_id=?", [id]);
      const bookingCost = parseFloat(itemsQuery[0].total || 0);

      const budgetResult = await db.runQuery("SELECT id, actual_spend, total_budget_amount FROM budgets WHERE id=?", [oldBooking.budget_id]);
      if (budgetResult.length > 0) {
        const budget = budgetResult[0];
        const newSpend = parseFloat(budget.actual_spend || 0) + bookingCost;
        const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
        await db.runExec(
          "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
          [newSpend, overBudgetStatus, budget.id]
        );
      }
    }

    res.json({ message: "Trims booking status updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/trims-bookings/:id");
  }
});

app.delete('/api/trims-bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookingResult = await db.runQuery("SELECT * FROM trims_bookings WHERE id=?", [id]);
    if (bookingResult.length === 0) return res.status(404).json({ error: "Booking not found" });
    const booking = bookingResult[0];

    // Deduct actual spend on budget if status was Approved
    if (booking.status === 'Approved') {
      const itemsQuery = await db.runQuery("SELECT SUM(rate * final_wo_qty) as total FROM trims_booking_items WHERE booking_id=?", [id]);
      const bookingCost = parseFloat(itemsQuery[0].total || 0);

      const budgetResult = await db.runQuery("SELECT id, actual_spend, total_budget_amount FROM budgets WHERE id=?", [booking.budget_id]);
      if (budgetResult.length > 0) {
        const budget = budgetResult[0];
        const newSpend = Math.max(0, parseFloat(budget.actual_spend || 0) - bookingCost);
        const overBudgetStatus = newSpend > parseFloat(budget.total_budget_amount) ? 'Over Budget' : 'Approved';
        await db.runExec(
          "UPDATE budgets SET actual_spend=?, status=? WHERE id=?",
          [newSpend, overBudgetStatus, budget.id]
        );
      }
    }

    await db.runExec("DELETE FROM trims_booking_items WHERE booking_id=?", [id]);
    await db.runExec("DELETE FROM trims_bookings WHERE id=?", [id]);

    res.json({ message: "Trims booking deleted successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/trims-bookings/:id");
  }
});


// 10. Dashboard & Report Analytics Endpoints
app.get('/api/analytics/sales-target-vs-achieved', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // First: backfill missing month rows for any old-style targets for current year
    const oldTargets = await db.runQuery(
      `SELECT st.id FROM sales_targets st WHERE st.year = ? AND NOT EXISTS (
             SELECT 1 FROM sales_target_months WHERE sales_target_id = st.id
           )`, [currentYear]);
    for (const t of oldTargets) {
      const MONTHS_ORDERED = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      for (const month of MONTHS_ORDERED) {
        try {
          await db.runExec(
            `INSERT INTO sales_target_months (sales_target_id, month) VALUES (?, ?)`,
            [t.id, month]
          );
        } catch (e) { /* ignore duplicate */ }
      }
    }

    // Aggregate per month for current year
    const rows = await db.runQuery(`
          SELECT m.month,
                 SUM(m.target_basic_qty + m.target_casual_qty + m.target_fashion_qty) as total_target_qty,
                 SUM(m.target_basic_val + m.target_casual_val + m.target_fashion_val) as total_target_val,
                 SUM(m.confirm_qty) as total_confirm_qty,
                 SUM(m.confirm_value) as total_confirm_val,
                 SUM(m.achieve_basic_qty + m.achieve_casual_qty + m.achieve_fashion_qty) as total_achieve_qty,
                 SUM(m.achieve_basic_val + m.achieve_casual_val + m.achieve_fashion_val) as total_achieve_val
          FROM sales_target_months m
          JOIN sales_targets st ON m.sales_target_id = st.id
          WHERE st.year = ?
          GROUP BY m.month
        `, [currentYear]);

    // Build a full 12-month scaffold so chart always has bars
    const MONTHS_ORDERED_MAP = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthMap = {};
    rows.forEach((r) => { monthMap[r.month] = r; });

    const chartData = MONTHS_ORDERED_MAP.map(mn => ({
      month: mn.substring(0, 3), // Jan, Feb, etc.
      total_target_qty: parseFloat(monthMap[mn]?.total_target_qty || 0),
      total_target_val: parseFloat(monthMap[mn]?.total_target_val || 0),
      total_confirm_qty: parseFloat(monthMap[mn]?.total_confirm_qty || 0),
      total_confirm_val: parseFloat(monthMap[mn]?.total_confirm_val || 0),
      total_achieve_qty: parseFloat(monthMap[mn]?.total_achieve_qty || 0),
      total_achieve_val: parseFloat(monthMap[mn]?.total_achieve_val || 0),
    }));

    res.json(chartData);
  } catch (e) {
    handleError(res, e, "GET /api/analytics/sales-target-vs-achieved");
  }
});

app.get('/api/analytics/budget-spend', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT b.id, b.budget_reference, b.total_budget_amount, b.actual_spend, b.status, o.style_no
      FROM budgets b
      JOIN orders o ON b.order_id = o.id
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/analytics/budget-spend");
  }
});

// Report: MIS Sales Target Vs Target Achieved (only show Submitted and Approved targets)
app.get('/api/reports/sales-target-mis', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT st.*, COALESCE(b.name, st.buyer_name) as buyer_name, b.code as buyer_code
      FROM sales_targets st
      LEFT JOIN buyers b ON st.buyer_id = b.id
      WHERE st.status IN ('Submitted', 'Approved')
      ORDER BY st.year DESC, st.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/reports/sales-target-mis");
  }
});

// PUT update status of sales target
app.put('/api/sales-targets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.runExec("UPDATE sales_targets SET status=? WHERE id=?", [status, id]);
    res.json({ message: `Sales target status updated to ${status} successfully` });
  } catch (e) {
    handleError(res, e, "PUT /api/sales-targets/:id/status");
  }
});


// Report: T&A Progress Tracking Report
app.get('/api/reports/ta-progress', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT o.id as order_id, o.style_no, o.buyer, o.season, o.dealing_merchant,
        qi.inquiry_date, qi.sub_date,
        (SELECT MIN(ship_date) FROM order_pos WHERE order_id = o.id) as first_ship_date,
        (SELECT SUM(po_qty) FROM order_pos WHERE order_id = o.id) as total_qty,
        (SELECT booking_date FROM fabric_bookings fb WHERE fb.budget_id = (SELECT id FROM budgets WHERE order_id = o.id LIMIT 1) LIMIT 1) as fabric_booking_date,
        (SELECT booking_date FROM trims_bookings tb WHERE tb.budget_id = (SELECT id FROM budgets WHERE order_id = o.id LIMIT 1) LIMIT 1) as trims_booking_date
      FROM orders o
      LEFT JOIN quotation_inquiries qi ON o.inquiry_id = qi.id
      ORDER BY o.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/reports/ta-progress");
  }
});

// ==========================================================================
// Authentication Endpoints (Login / Signup)
// ==========================================================================
const crypto = require('crypto');
const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, role, company, unit, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    // Check if user already exists
    const existing = await db.runQuery("SELECT 1 FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const hashed = hashPassword(password);
    const result = await db.runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashed, role || 'unit_user', company || 'Metamorphosis Ltd.', unit || 'Demo Unit', email || null]
    );

    const userId = result.insertId;
    const user = { id: userId, username, role: role || 'unit_user', company: company || 'Metamorphosis Ltd.', unit: unit || 'Demo Unit', email: email || null };
    res.status(201).json({ success: true, user });
  } catch (e) {
    handleError(res, e, "POST /api/auth/signup");
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const hashed = hashPassword(password);
    const users = await db.runQuery("SELECT * FROM users WHERE username = ? AND password = ?", [username, hashed]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = users[0];
    if (user.disabled === 1) {
      return res.status(403).json({ error: "This account has been disabled." });
    }
    delete user.password;
    res.json({ success: true, user });
  } catch (e) {
    handleError(res, e, "POST /api/auth/login");
  }
});

// ==========================================================================
// User Management & Role Permissions Endpoints
// ==========================================================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.runQuery("SELECT id, username, role, company, unit, email, disabled, first_name, last_name, dob, phone, created_at FROM users ORDER BY id ASC");
    res.json(users);
  } catch (e) {
    handleError(res, e, "GET /api/users");
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, company, unit, email, first_name, last_name, dob, phone } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const existing = await db.runQuery("SELECT 1 FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const hashed = hashPassword(password);
    const result = await db.runExec(
      `INSERT INTO users (username, password, role, company, unit, email, disabled, first_name, last_name, dob, phone) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [username, hashed, role || 'unit_user', company || 'Metamorphosis Ltd.', unit || 'Demo Unit', email || null, first_name || null, last_name || null, dob || null, phone || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (e) {
    handleError(res, e, "POST /api/users");
  }
});

// Update a user (username, role, password, disabled)
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, company, unit, email, disabled, first_name, last_name, dob, phone } = req.body;

    const existing = await db.runQuery("SELECT * FROM users WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    if (username) {
      const duplicate = await db.runQuery("SELECT 1 FROM users WHERE username = ? AND id != ?", [username, id]);
      if (duplicate.length > 0) {
        return res.status(400).json({ error: "Username is already taken by another account." });
      }
    }

    let query = "UPDATE users SET username = ?, role = ?, company = ?, unit = ?, email = ?, disabled = ?, first_name = ?, last_name = ?, dob = ?, phone = ?";
    let params = [
      username || existing[0].username,
      role || existing[0].role,
      company !== undefined ? company : existing[0].company,
      unit !== undefined ? unit : existing[0].unit,
      email !== undefined ? email : existing[0].email,
      disabled !== undefined ? disabled : existing[0].disabled,
      first_name !== undefined ? first_name : existing[0].first_name,
      last_name !== undefined ? last_name : existing[0].last_name,
      dob !== undefined ? dob : existing[0].dob,
      phone !== undefined ? phone : existing[0].phone
    ];

    if (password) {
      query += ", password = ?";
      params.push(hashPassword(password));
    }

    query += " WHERE id = ?";
    params.push(id);

    await db.runExec(query, params);
    res.json({ success: true, message: "User updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/users/:id");
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.runExec("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/users/:id");
  }
});

// Get role permissions
app.get('/api/role-permissions', async (req, res) => {
  try {
    const perms = await db.runQuery("SELECT * FROM role_permissions");
    res.json(perms);
  } catch (e) {
    handleError(res, e, "GET /api/role-permissions");
  }
});

// Save role permissions
app.post('/api/role-permissions', async (req, res) => {
  try {
    const { role, allowed_pages } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }

    const pagesStr = Array.isArray(allowed_pages) ? JSON.stringify(allowed_pages) : allowed_pages;
    const existing = await db.runQuery("SELECT 1 FROM role_permissions WHERE role = ?", [role]);

    if (existing.length > 0) {
      await db.runExec("UPDATE role_permissions SET allowed_pages = ? WHERE role = ?", [pagesStr, role]);
    } else {
      await db.runExec("INSERT INTO role_permissions (role, allowed_pages) VALUES (?, ?)", [role, pagesStr]);
    }
    res.json({ success: true, message: "Permissions saved successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/role-permissions");
  }
});

// Get user permissions
app.get('/api/user-permissions', async (req, res) => {
  try {
    const perms = await db.runQuery("SELECT * FROM user_permissions");
    res.json(perms);
  } catch (e) {
    handleError(res, e, "GET /api/user-permissions");
  }
});

// Save user permissions
app.post('/api/user-permissions', async (req, res) => {
  try {
    const { username, allowed_pages } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }

    const pagesStr = Array.isArray(allowed_pages) ? JSON.stringify(allowed_pages) : allowed_pages;
    const existing = await db.runQuery("SELECT 1 FROM user_permissions WHERE username = ?", [username]);

    if (existing.length > 0) {
      await db.runExec("UPDATE user_permissions SET allowed_pages = ? WHERE username = ?", [pagesStr, username]);
    } else {
      await db.runExec("INSERT INTO user_permissions (username, allowed_pages) VALUES (?, ?)", [username, pagesStr]);
    }
    res.json({ success: true, message: "User permissions saved successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/user-permissions");
  }
});

// Delete user permissions override
app.delete('/api/user-permissions/:username', async (req, res) => {
  try {
    const { username } = req.params;
    await db.runExec("DELETE FROM user_permissions WHERE username = ?", [username]);
    res.json({ success: true, message: "User permissions reset successfully" });
  } catch (e) {
    handleError(res, e, "DELETE /api/user-permissions/:username");
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
