const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

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

// 3. Sales Target Endpoints
app.get('/api/sales-targets', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT st.*, b.name as buyer_name, b.code as buyer_code 
      FROM sales_targets st
      LEFT JOIN buyers b ON st.buyer_id = b.id
      ORDER BY st.year DESC, st.month DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/sales-targets");
  }
});

app.post('/api/sales-targets', async (req, res) => {
  try {
    const {
      buyer_id, team_leader, season, year, month, target_qty, target_value, status,
      brand, buying_agent, buying_agent_merchant,
      target_basic_qty, target_basic_val, target_casual_qty, target_casual_val, target_fashion_qty, target_fashion_val
    } = req.body;
    const result = await db.runExec(
      `INSERT INTO sales_targets (buyer_id, team_leader, season, year, month, target_qty, target_value, status,
        brand, buying_agent, buying_agent_merchant,
        target_basic_qty, target_basic_val, target_casual_qty, target_casual_val, target_fashion_qty, target_fashion_val)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [buyer_id, team_leader, season, year, month, target_qty, target_value, status || 'Draft',
       brand, buying_agent, buying_agent_merchant,
       target_basic_qty, target_basic_val, target_casual_qty, target_casual_val, target_fashion_qty, target_fashion_val]
    );
    res.status(201).json({ id: result.insertId, message: "Sales target created successfully" });
  } catch (e) {
    handleError(res, e, "POST /api/sales-targets");
  }
});

app.put('/api/sales-targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { target_qty, target_value, confirm_qty, confirm_value, status } = req.body;
    await db.runExec(
      "UPDATE sales_targets SET target_qty=?, target_value=?, confirm_qty=?, confirm_value=?, status=? WHERE id=?",
      [target_qty, target_value, confirm_qty, confirm_value, status, id]
    );
    res.json({ message: "Sales target updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/sales-targets");
  }
});

// 4. Quotation Inquiry Endpoints
app.get('/api/inquiries', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT qi.*, b.name as buyer_name,
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
      id, buyer_id, style_no, style_desc, item_group, brand, season,
      team_leader, dealing_merchant, inquiry_date, sub_date, ship_date,
      offer_qty, uom, costing_per, department, sample_req, remarks, image_url,
      garments_item, status, fabrics, yarns, company, quoted_by
    } = req.body;

    // Generate automatic ID matching TD-001-2023-Aug-07
    let finalId = id;
    if (!finalId) {
      const buyerResult = await db.runQuery("SELECT code FROM buyers WHERE id=?", [buyer_id]);
      const buyerCode = buyerResult[0] ? buyerResult[0].code : "ZR";
      
      const d = new Date(inquiry_date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateFormatted = `${d.getFullYear()}-${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
      
      const countResult = await db.runQuery("SELECT COUNT(*) as count FROM quotation_inquiries WHERE buyer_id=?", [buyer_id]);
      const count = parseInt(countResult[0].count) + 1;
      
      finalId = `${buyerCode}-${String(count).padStart(3, '0')}-${dateFormatted}`;
    }

    await db.runExec(
      `INSERT INTO quotation_inquiries (id, buyer_id, style_no, style_desc, item_group, brand, season,
        team_leader, dealing_merchant, inquiry_date, sub_date, ship_date, offer_qty, uom, costing_per,
        department, sample_req, remarks, image_url, garments_item, status, company, quoted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalId, buyer_id, style_no, style_desc, item_group, brand, season,
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
      style_no, style_desc, item_group, brand, season, team_leader, dealing_merchant,
      inquiry_date, sub_date, ship_date, offer_qty, uom, costing_per, department,
      sample_req, remarks, image_url, garments_item, status, fabrics, yarns, company, quoted_by
    } = req.body;

    await db.runExec(
      `UPDATE quotation_inquiries SET style_no=?, style_desc=?, item_group=?, brand=?, season=?, 
        team_leader=?, dealing_merchant=?, inquiry_date=?, sub_date=?, ship_date=?, offer_qty=?, 
        uom=?, costing_per=?, department=?, sample_req=?, remarks=?, image_url=?, garments_item=?, status=?, company=?, quoted_by=? WHERE id=?`,
      [style_no, style_desc, item_group, brand, season, team_leader, dealing_merchant,
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
      SELECT pq.*, qi.buyer_id, b.name as buyer_name, qi.season 
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

    const result = await db.runExec(
      `INSERT INTO price_quotations (
        inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inquiry_id, style_no, buyer, garments_category, brand, style_desc, item_group,
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

    const quotationId = result.insertId;

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

app.post('/api/fabric-bookings', async (req, res) => {
  try {
    const {
      booking_reference, budget_id, basis, main_booking_id, booking_date, supplier_name,
      delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
      collar_cuff_info, terms_conditions, status, company, unit, booking_by, items
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

    // VALIDATION 2: For Short Booking, verify main booking exists and is fully approved
    if (basis === 'Short') {
      if (!main_booking_id) {
        return res.status(400).json({ error: "Booking Blocked: Short booking requires reference to a Main Booking ID." });
      }
      
      const mainBooking = await db.runQuery("SELECT status FROM fabric_bookings WHERE id=?", [main_booking_id]);
      if (mainBooking.length === 0 || mainBooking[0].status !== 'Approved') {
        return res.status(400).json({ error: "Booking Blocked: Referenced Main Booking is not approved." });
      }
    }

    // VALIDATION 3: BUDGET LIMIT QUANTITY & VALUE CHECK (based on work_order_quantity)
    let newBookingTotalAmount = 0;
    if (items) {
      items.forEach(it => {
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

    // Create the booking
    const result = await db.runExec(
      `INSERT INTO fabric_bookings (booking_reference, budget_id, basis, main_booking_id, booking_date,
        supplier_name, delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
        collar_cuff_info, terms_conditions, status, company, unit, booking_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_reference, budget_id, basis, main_booking_id || null, booking_date, supplier_name,
       delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
       JSON.stringify(collar_cuff_info), terms_conditions, status || 'Pending', company, unit, booking_by]
    );
    const bookingId = result.insertId;

    // Save booking items
    if (items && items.length > 0) {
      for (let it of items) {
        await db.runExec(
          `INSERT INTO fabric_booking_items (booking_id, po_id, po_no, color, size, item_size, garments_qty,
            excess_pct, total_qty, rate, amount, buyer, style_no, garments_item, body_parts, fabric_color,
            yarn_type, embellishment_type, embellishment_name, fabric_type, fabric_composition, gsm,
            fabric_dia, lab_dip, garments_quantity, total_fabric_quantity, uom, budget_quantity, work_order_quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, it.po_id, it.po_no, it.color, it.size, it.item_size, it.garments_qty,
           it.excess_pct, it.total_qty, it.rate, it.amount, it.buyer, it.style_no, it.garments_item, it.body_parts,
           it.fabric_color, it.yarn_type, it.embellishment_type, it.embellishment_name, it.fabric_type,
           it.fabric_composition, it.gsm, it.fabric_dia, it.lab_dip, it.garments_quantity, it.total_fabric_quantity,
           it.uom, it.budget_quantity, it.work_order_quantity]
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
      collar_cuff_info, terms_conditions, company, unit, booking_by, items } = req.body;

    const booking = await db.runQuery("SELECT * FROM fabric_bookings WHERE id=?", [id]);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    // Status toggle update
    if (status && !items) {
      await db.runExec("UPDATE fabric_bookings SET status=? WHERE id=?", [status, id]);

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

    // Full booking record update
    await db.runExec(
      `UPDATE fabric_bookings SET 
        booking_reference=?, budget_id=?, basis=?, main_booking_id=?, booking_date=?,
        supplier_name=?, delivery_date=?, inhouse_date=?, pay_mode=?, source=?, currency=?,
        attention=?, remarks=?, collar_cuff_info=?, terms_conditions=?, status=?, company=?, unit=?, booking_by=?
      WHERE id=?`,
      [booking_reference, budget_id, basis, main_booking_id || null, booking_date, supplier_name,
       delivery_date, inhouse_date, pay_mode, source, currency, attention, remarks,
       JSON.stringify(collar_cuff_info), terms_conditions, status || 'Pending', company, unit, booking_by, id]
    );

    // Re-create booking items
    await db.runExec("DELETE FROM fabric_booking_items WHERE booking_id=?", [id]);

    if (items && items.length > 0) {
      for (let it of items) {
        await db.runExec(
          `INSERT INTO fabric_booking_items (booking_id, po_id, po_no, color, size, item_size, garments_qty,
            excess_pct, total_qty, rate, amount, buyer, style_no, garments_item, body_parts, fabric_color,
            yarn_type, embellishment_type, embellishment_name, fabric_type, fabric_composition, gsm,
            fabric_dia, lab_dip, garments_quantity, total_fabric_quantity, uom, budget_quantity, work_order_quantity)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, it.po_id, it.po_no, it.color, it.size, it.item_size, it.garments_qty,
           it.excess_pct, it.total_qty, it.rate, it.amount, it.buyer, it.style_no, it.garments_item, it.body_parts,
           it.fabric_color, it.yarn_type, it.embellishment_type, it.embellishment_name, it.fabric_type,
           it.fabric_composition, it.gsm, it.fabric_dia, it.lab_dip, it.garments_quantity, it.total_fabric_quantity,
           it.uom, it.budget_quantity, it.work_order_quantity]
        );
      }
    }

    res.json({ message: "Fabric booking updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/fabric-bookings/:id");
  }
});

// 9. Trims Booking Endpoints (with BUDGET LIMIT CHECK validation)
app.get('/api/trims-bookings', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT tb.*, b.budget_reference, o.style_no, o.buyer 
      FROM trims_bookings tb
      LEFT JOIN budgets b ON tb.budget_id = b.id
      LEFT JOIN orders o ON b.order_id = o.id
      ORDER BY tb.id DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/trims-bookings");
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
      booking_label, terms_conditions, status, items
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
        newBookingTotalAmount += parseFloat(it.rate || 0) * parseFloat(it.final_wo_qty || 0);
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
    const result = await db.runExec(
      `INSERT INTO trims_bookings (booking_reference, budget_id, basis, main_booking_id, booking_date,
        source, supplier_name, delivery_date, inhouse_date, pay_mode, currency, attention, remarks,
        booking_label, terms_conditions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking_reference, budget_id, basis, main_booking_id || null, booking_date, source, supplier_name,
       delivery_date, inhouse_date, pay_mode, currency, attention, remarks,
       booking_label, terms_conditions, status || 'Pending']
    );
    const bookingId = result.insertId;

    if (items && items.length > 0) {
      for (let it of items) {
        await db.runExec(
          `INSERT INTO trims_booking_items (booking_id, po_id, garments_color, item_color, item_name,
            item_desc, required_qty, prev_booked_qty, work_order_qty, excess_pct, final_wo_qty, rate, amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [bookingId, it.po_id, it.garments_color, it.item_color, it.item_name, it.item_desc,
           it.required_qty, it.prev_booked_qty || 0, it.work_order_qty, it.excess_pct, it.final_wo_qty,
           it.rate, it.amount]
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
    const { status } = req.body;

    const booking = await db.runQuery("SELECT * FROM trims_bookings WHERE id=?", [id]);
    if (booking.length === 0) return res.status(404).json({ error: "Booking not found" });

    await db.runExec("UPDATE trims_bookings SET status=? WHERE id=?", [status, id]);

    // If approved, update the budget actual spend
    if (status === 'Approved' && booking[0].status !== 'Approved') {
      const items = await db.runQuery("SELECT SUM(rate * final_wo_qty) as total FROM trims_booking_items WHERE booking_id=?", [id]);
      const bookingCost = parseFloat(items[0].total || 0);

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

    res.json({ message: "Trims booking status updated successfully" });
  } catch (e) {
    handleError(res, e, "PUT /api/trims-bookings/:id");
  }
});

// 10. Dashboard & Report Analytics Endpoints
app.get('/api/analytics/sales-target-vs-achieved', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const rows = await db.runQuery(`
      SELECT st.month, st.year, 
             SUM(st.target_qty) as total_target_qty, 
             SUM(st.target_value) as total_target_val,
             SUM(st.confirm_qty) as total_confirm_qty, 
             SUM(st.confirm_value) as total_confirm_val
      FROM sales_targets st
      WHERE st.year = ? AND st.status = 'Approved'
      GROUP BY st.month, st.year
    `, [currentYear]);
    
    res.json(rows);
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

// Report: MIS Sales Target Vs Target Achieved
app.get('/api/reports/sales-target-mis', async (req, res) => {
  try {
    const rows = await db.runQuery(`
      SELECT st.*, b.name as buyer_name, b.code as buyer_code
      FROM sales_targets st
      LEFT JOIN buyers b ON st.buyer_id = b.id
      ORDER BY st.year DESC, st.month DESC
    `);
    res.json(rows);
  } catch (e) {
    handleError(res, e, "GET /api/reports/sales-target-mis");
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
