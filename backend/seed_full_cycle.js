const db = require('./db');

async function seed() {
  try {
    console.log("Initializing DB connection...");
    await db.initDb();
    
    console.log("Cleaning up old cycle mock data for style MS-POLO-777...");
    // Clean items and booking tables
    await db.runExec("DELETE FROM trims_booking_items WHERE po_no = 'PO-MS-777'");
    await db.runExec("DELETE FROM trims_bookings WHERE booking_reference = 'TB-MS-777'");
    await db.runExec("DELETE FROM fabric_booking_items WHERE po_no = 'PO-MS-777'");
    await db.runExec("DELETE FROM fabric_bookings WHERE booking_reference = 'FB-MS-777'");
    
    // Clean budget tables
    await db.runExec("DELETE FROM budget_fabric_consumption WHERE po_no = 'PO-MS-777'");
    await db.runExec("DELETE FROM budget_trims_consumption WHERE po_no = 'PO-MS-777'");
    
    // Retrieve budget ID if exists to clean costs
    const budgetQuery = await db.runQuery("SELECT id FROM budgets WHERE budget_reference = 'BG-MS-777'");
    if (budgetQuery && budgetQuery.length > 0) {
      const budgetId = budgetQuery[0].id;
      await db.runExec("DELETE FROM budget_fabric_costs WHERE budget_id = ?", [budgetId]);
      await db.runExec("DELETE FROM budget_trims_costs WHERE budget_id = ?", [budgetId]);
    }
    
    await db.runExec("DELETE FROM budgets WHERE budget_reference = 'BG-MS-777'");
    await db.runExec("DELETE FROM order_po_breakdown WHERE article_no = 'MS-POLO-777'");
    await db.runExec("DELETE FROM order_pos WHERE po_no = 'PO-MS-777'");
    await db.runExec("DELETE FROM orders WHERE style_no = 'MS-POLO-777'");
    await db.runExec("DELETE FROM price_quotations WHERE style_no = 'MS-POLO-777'");
    await db.runExec("DELETE FROM quotation_inquiries WHERE style_no = 'MS-POLO-777'");

    console.log("1. Seeding Quotation Inquiry 'INQ-MS-777'...");
    await db.runExec(
      `INSERT INTO quotation_inquiries (
        id, buyer_id, style_no, style_desc, item_group, brand, season, team_leader,
        dealing_merchant, inquiry_date, sub_date, ship_date, offer_qty, uom,
        costing_per, department, sample_req, remarks, garments_item, company, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'INQ-MS-777', 1, 'MS-POLO-777', 'Metamorphosis Premium Polo Shirt', 'Polo Shirt', 'Zara Brand', 'Summer 2026', 'John Doe',
        'Supervisor', '2026-07-01', '2026-07-02', '2026-09-30', 15000, 'Pcs',
        'Pcs', 'Mens', 'Yes', 'Full Cycle Seeding', 'Polo T-Shirt', 'Metamorphosis Ltd.', 'Approved'
      ]
    );

    console.log("2. Seeding Price Costing (Price Quotation) 'PQ-MS-777'...");
    await db.runExec(
      `INSERT INTO price_quotations (
        id, inquiry_id, style_no, buyer, status, desired_margin, total_cost, fob_price_pc, comments, mc_line, prod_line_hour
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'PQ-MS-777', 'INQ-MS-777', 'MS-POLO-777', 'Zara', 'Approved', 15.0, 8.5, 10.0, 'Approved costing for Metamorphosis Ltd.', 10, 120
      ]
    );

    console.log("3. Seeding Order Entry & PO Breakdown...");
    await db.runExec(
      `INSERT INTO orders (
        style_no, inquiry_id, buyer, style_desc, order_status, category, season, team_leader, dealing_merchant, currency, uom, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'MS-POLO-777', 'INQ-MS-777', 'Zara', 'Metamorphosis Premium Polo Shirt', 'Confirm', 'Polo Shirt', 'Summer 2026', 'John Doe', 'Supervisor', 'USD', 'Pcs', 'Approved'
      ]
    );
    
    const oIdQuery = await db.runQuery("SELECT id FROM orders WHERE style_no = 'MS-POLO-777' ORDER BY id DESC LIMIT 1");
    const orderId = oIdQuery[0].id;
    
    await db.runExec(
      `INSERT INTO order_pos (
        order_id, po_no, status, received_date, ship_date, lead_time, po_qty, fob_price, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, 'PO-MS-777', 'Approved', '2026-07-02', '2026-09-30', 90, 15000, 10.0, 'PO entry for Metamorphosis Ltd.'
      ]
    );
    
    const pIdQuery = await db.runQuery("SELECT id FROM order_pos WHERE po_no = 'PO-MS-777' ORDER BY id DESC LIMIT 1");
    const poId = pIdQuery[0].id;

    await db.runExec(
      `INSERT INTO order_po_breakdown (
        po_id, color, size, set_qty, pcs_qty, rate, ex_cut_pct, plan_cut_qty, article_no, amount, garments_item
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poId, 'Navy Blue', 'M', 15000, 15000, 10.0, 2, 15300, 'MS-POLO-777', 150000.0, 'Polo T-Shirt'
      ]
    );

    console.log("4. Seeding Cost Budget 'BG-MS-777'...");
    await db.runExec(
      `INSERT INTO budgets (
        order_id, budget_reference, total_fabric_budget, total_trims_budget,
        total_budget_amount, status, buyer, season, uom, costing_date, company, unit, quotation_id, style_no, style_desc, actual_spend
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        orderId, 'BG-MS-777', 60000.0, 99000.0, 159000.0, 'Approved', 'Zara', 'Summer 2026', 'Pcs', '2026-07-03',
        'Metamorphosis Ltd.', 'Demo Unit', 'PQ-MS-777', 'MS-POLO-777', 'Metamorphosis Premium Polo Shirt', 159000.0
      ]
    );
    
    const bIdQuery = await db.runQuery("SELECT id FROM budgets WHERE budget_reference = 'BG-MS-777'");
    const budgetId = bIdQuery[0].id;

    // Budget Fabric Cost and Consumption
    await db.runExec(
      `INSERT INTO budget_fabric_costs (
        budget_id, gmt_item, body_part, body_part_type, color_range, color_nature,
        composition, fabric_type, fabric_nature, code, fabric_source, n_supplier,
        gsm_oz, dia_type, color_size_sensitive, color, cons_basis, uom, grey_cons,
        rate, amount, total_qty, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        budgetId, 'Polo T-Shirt', 'Body', 'Shell Fabric', 'Solid Color', 'Solid',
        '100% Cotton Jersey', 'Knit', 'Knit', '101', 'Production', 'Montrims LTD.',
        220, 'Open Width', 'As per Garments Color', 'Navy Blue', 'Marker', 'Kg', 2.0,
        2.0, 4.0, 30000, 60000.0
      ]
    );
    
    const fcResult = await db.runQuery("SELECT id FROM budget_fabric_costs WHERE budget_id = ?", [budgetId]);
    if (fcResult.length > 0) {
      await db.runExec(
        `INSERT INTO budget_fabric_consumption (
          budget_fabric_cost_id, po_no, color, gmt_sizes, po_qty, dia_width,
          dia_fin_type, finish_cons, process_loss_pct, grey_cons, rate, amount,
          pcs, total_finish_qty, total_qty, sample_qty, total_amount, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fcResult[0].id, 'PO-MS-777', 'Navy Blue', 'M', 15000, 0,
          'Open', 2.0, 2, 2.0, 2.0, 60000.0,
          1, 30000, 30000, 20, 60000.0, 'Main Body Fabric'
        ]
      );
    }

    // Budget Trims Cost and Consumption
    await db.runExec(
      `INSERT INTO budget_trims_costs (
        budget_id, gmt_item, item_name, item_description, cons_uom, cons_unit_gmt,
        rate, amount, total_qty, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        budgetId, 'Polo T-Shirt', 'Sewing Thread', 'Standard polyester thread', 'Cone', 12.0,
        0.55, 6.6, 180000, 99000.0
      ]
    );
    
    const tcResult = await db.runQuery("SELECT id FROM budget_trims_costs WHERE budget_id = ?", [budgetId]);
    if (tcResult.length > 0) {
      await db.runExec(
        `INSERT INTO budget_trims_consumption (
          budget_trims_cost_id, po_no, color, gmt_sizes, po_qty, country,
          finish_cons, process_loss_pct, grey_cons, rate, amount, pcs,
          total_finish_qty, total_qty, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tcResult[0].id, 'PO-MS-777', 'Navy Blue', 'M', 15000, 'Bangladesh',
          12.0, 5, 12.0, 0.55, 6.6, 1,
          171420, 180000, 99000.0
        ]
      );
    }

    console.log("5. Seeding Fabric Booking 'FB-MS-777'...");
    await db.runExec(
      `INSERT INTO fabric_bookings (
        booking_reference, budget_id, basis, main_booking_id, booking_date,
        supplier_name, delivery_date, inhouse_date, pay_mode, source, currency,
        attention, remarks, collar_cuff_info, terms_conditions, company, unit,
        booking_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        'FB-MS-777', budgetId, 'Main', null, '2026-07-04',
        'Montrims LTD.', '2026-07-25', '2026-07-24', 'Credit', 'Non-Epz/Local', 'USD',
        'Mr. Rahman', 'Fabric booking for style MS-POLO-777', '[]',
        'Earliest Delivery Date (EDD):\n* Latest Delivery Date (EDD):\n* Partial Shipment : Not Allowed',
        'Metamorphosis Ltd.', 'Demo Unit', 'Supervisor', 'Approved'
      ]
    );

    const fbResult = await db.runQuery("SELECT id FROM fabric_bookings WHERE booking_reference = 'FB-MS-777'");
    if (fbResult.length > 0) {
      await db.runExec(
        `INSERT INTO fabric_booking_items (
          booking_id, po_id, po_no, color, size, item_size, garments_qty, excess_pct,
          total_qty, rate, amount, buyer, style_no, garments_item, body_parts,
          fabric_color, yarn_type, fabric_type, fabric_composition, gsm, garments_quantity,
          total_fabric_quantity, uom, budget_quantity, work_order_quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
          fbResult[0].id, poId, 'PO-MS-777', 'Navy Blue', 'M', 'M', 15000, 2,
          30000, 2.0, 60000.0, 'Zara', 'MS-POLO-777', 'Polo T-Shirt', 'Body',
          'Navy Blue', '100% Cotton, 30S', 'Knit', '100% Cotton Jersey', 220, 15000,
          30000, 'Kg', 30000, 30000
        ]
      );
    }

    console.log("6. Seeding Trims Booking 'TB-MS-777'...");
    await db.runExec(
      `INSERT INTO trims_bookings (
        booking_reference, budget_id, basis, main_booking_id, booking_date,
        supplier_name, delivery_date, inhouse_date, pay_mode, source, currency,
        attention, remarks, booking_label, terms_conditions, company, unit,
        booking_by, status, created_date, feedback_by_approval_body, approved_by, approval_date_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        'TB-MS-777', budgetId, 'Main', null, '2026-07-04',
        'Montrims LTD.', '2026-07-25', '2026-07-24', 'Credit', 'Non-Epz/Local', 'USD',
        'Mr. Rahman', 'Remarks For User', 'Style Label',
        'Earliest Delivery Date (EDD):\n* Latest Delivery Date (EDD):\n* Partial Shipment : Not Allowed',
        'Metamorphosis Ltd.', 'Demo Unit', 'Supervisor', 'Approved', '2026-07-04T12:00:00.000Z',
        'Approved, within budget limit.', 'Super Admin', '2026-07-04T14:00:00.000Z'
      ]
    );

    const tbResult = await db.runQuery("SELECT id FROM trims_bookings WHERE booking_reference = 'TB-MS-777'");
    if (tbResult.length > 0) {
      await db.runExec(
        `INSERT INTO trims_booking_items (
          booking_id, po_id, po_no, garments_color, item_color, item_name,
          item_desc, required_qty, prev_booked_qty, work_order_qty, excess_pct,
          final_wo_qty, rate, amount, buyer, style_no, garments_item,
          sensitivity, short_booking_qty, uom, payment_mode, source, booking_by,
          rmg_quantity, contrast_color, remarks, garments_cert
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
          tbResult[0].id, poId, 'PO-MS-777', 'Navy Blue', 'Navy Blue', 'Sewing Thread',
          'Standard polyester thread', 180000, 180000, 180000, 0.55, 99000.0,
          'Zara', 'MS-POLO-777', 'Polo T-Shirt', 'No Sensitive', 'Cone',
          'Credit', 'Non-Epz/Local', 'Supervisor', 15000, '', '', 'Oeko-Tex 100'
        ]
      );
    }

    console.log("Full merchandising cycle seeded successfully!");
    process.exit(0);
  } catch (e) {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  }
}

seed();
