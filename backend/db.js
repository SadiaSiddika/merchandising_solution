const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite'; // fallback default
let pgClient = null;
let sqliteDb = null;

// Config for local PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // connect to default to create database first
  password: 'admin',
  port: 5432
};

async function initDb() {
  try {
    console.log("Checking local PostgreSQL connection...");
    const client = new Client(pgConfig);
    await client.connect();
    console.log("PostgreSQL server found.");
    
    // Create database if not exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='metamorphosis'");
    if (res.rowCount === 0) {
      console.log("Creating database 'metamorphosis'...");
      await client.query("CREATE DATABASE metamorphosis");
    }
    await client.end();
    
    // Reconnect to metamorphosis database
    const appPgConfig = { ...pgConfig, database: 'metamorphosis' };
    pgClient = new Client(appPgConfig);
    await pgClient.connect();
    dbType = 'postgres';
    console.log("Connected to PostgreSQL database 'metamorphosis'.");
  } catch (e) {
    console.log(`PostgreSQL connection failed (${e.message}). Falling back to SQLite...`);
    const dbPath = path.join(__dirname, 'metamorphosis.db');
    sqliteDb = new sqlite3.Database(dbPath);
    dbType = 'sqlite';
    console.log(`Connected to SQLite database at ${dbPath}`);
  }

  // Initialize Schema
  await createTables();
  await runMigrations();
  await seedData();
}

async function runQuery(sql, params = []) {
  if (dbType === 'postgres') {
    let pgSql = sql;
    let index = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${index}`);
      index++;
    }
    const res = await pgClient.query(pgSql, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

async function runExec(sql, params = []) {
  if (dbType === 'postgres') {
    let pgSql = sql;
    if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }
    let index = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${index}`);
      index++;
    }
    const res = await pgClient.query(pgSql, params);
    return { insertId: res.rows && res.rows[0] ? res.rows[0].id : null, rowsAffected: res.rowCount };
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ insertId: this.lastID, rowsAffected: this.changes });
      });
    });
  }
}

async function createTables() {
  const isPg = dbType === 'postgres';
  const autoIncrement = isPg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const textType = 'TEXT';
  const numType = isPg ? 'DOUBLE PRECISION' : 'REAL';

  const queries = [
    // 0. Users (Authentication & Authorization)
    `CREATE TABLE IF NOT EXISTS users (
      id ${autoIncrement},
      username ${textType} UNIQUE NOT NULL,
      password ${textType} NOT NULL,
      role ${textType} DEFAULT 'unit_user',
      company ${textType} DEFAULT 'Metamorphosis Ltd.',
      unit ${textType} DEFAULT 'Demo Unit',
      email ${textType},
      first_name ${textType},
      last_name ${textType},
      dob ${textType},
      phone ${textType},
      created_at ${textType} DEFAULT CURRENT_TIMESTAMP
    )`,

    // 1. Buyers
    `CREATE TABLE IF NOT EXISTS buyers (
      id ${autoIncrement},
      name ${textType} NOT NULL,
      code ${textType} UNIQUE,
      brand ${textType},
      buying_agent ${textType},
      team_leader ${textType},
      season ${textType},
      created_at ${textType} DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. Sales Targets
    `CREATE TABLE IF NOT EXISTS sales_targets (
      id ${autoIncrement},
      buyer_id INTEGER,
      team_leader ${textType},
      season ${textType},
      year INTEGER,
      month ${textType},
      target_qty ${numType},
      target_value ${numType},
      confirm_qty ${numType} DEFAULT 0,
      confirm_value ${numType} DEFAULT 0,
      status ${textType} DEFAULT 'Draft',
      brand ${textType},
      buying_agent ${textType},
      buying_agent_merchant ${textType},
      target_basic_qty ${numType} DEFAULT 0,
      target_basic_val ${numType} DEFAULT 0,
      target_casual_qty ${numType} DEFAULT 0,
      target_casual_val ${numType} DEFAULT 0,
      target_fashion_qty ${numType} DEFAULT 0,
      target_fashion_val ${numType} DEFAULT 0,
      created_at ${textType} DEFAULT CURRENT_TIMESTAMP
    )`,

    // 3. Items Master
    `CREATE TABLE IF NOT EXISTS items_master (
      id ${autoIncrement},
      item_name ${textType} NOT NULL,
      item_group ${textType},
      category ${textType},
      uom ${textType},
      smv ${numType},
      created_at ${textType} DEFAULT CURRENT_TIMESTAMP
    )`,

    // Price Quotations Table
    `CREATE TABLE IF NOT EXISTS price_quotations (
      id ${autoIncrement},
      inquiry_id ${textType},
      style_no ${textType},
      buyer ${textType},
      garments_category ${textType},
      brand ${textType},
      style_desc ${textType},
      item_group ${textType},
      department ${textType},
      season ${textType},
      offer_qty INTEGER,
      uom ${textType},
      costing_per ${textType},
      incoterm ${textType} DEFAULT 'FOB',
      team_leader ${textType},
      dealing_merchant ${textType},
      est_ship_date ${textType},
      size_group ${textType},
      mc_line INTEGER,
      prod_line_hour INTEGER,
      sewing_efficiency ${numType},
      cutting_efficiency ${numType},
      finishing_efficiency ${numType},
      qc_efficiency ${numType},
      prep_efficiency ${numType},
      yarn_cert ${textType},
      size_grading ${numType},
      country ${textType},
      buying_agent ${textType},
      buying_merchant ${textType},
      currency ${textType} DEFAULT 'USD',
      color_range ${textType},
      sustainable_material ${textType},
      garments_cert ${textType},
      emb_type ${textType},
      emb_name ${textType},
      confirm_date ${textType},
      quotation_date ${textType},
      order_place_date ${textType},
      emb_note ${textType},
      incoterm_place ${textType},
      exchange_rate ${numType},
      pcs_carton ${textType},
      cbm_carton ${textType},
      remarks ${textType},
      status ${textType} DEFAULT 'Draft',
      approved_by ${textType},
      image_url ${textType},
      files ${textType}
    )`,

    // Price Quotation Garments Table
    `CREATE TABLE IF NOT EXISTS price_quotation_garments (
      id ${autoIncrement},
      price_quotation_id ${textType},
      garments_item ${textType},
      set_ratio INTEGER,
      cutting_smv ${numType},
      sewing_smv ${numType},
      finishing_smv ${numType},
      total_smv ${numType}
    )`,

    // 4. Quotation Inquiries
    `CREATE TABLE IF NOT EXISTS quotation_inquiries (
      id ${textType} PRIMARY KEY,
      buyer_id INTEGER,
      buyer_name ${textType},
      style_no ${textType} NOT NULL,
      style_desc ${textType},
      item_group ${textType},
      brand ${textType},
      season ${textType},
      team_leader ${textType},
      dealing_merchant ${textType},
      inquiry_date ${textType},
      sub_date ${textType},
      ship_date ${textType},
      offer_qty INTEGER,
      uom ${textType},
      costing_per ${textType},
      department ${textType},
      sample_req ${textType},
      remarks ${textType},
      image_url ${textType},
      garments_item ${textType},
      approved_by ${textType},
      approve_date ${textType},
      company ${textType},
      quoted_by ${textType},
      status ${textType} DEFAULT 'Draft'
    )`,

    // 5. Inquiry Fabrics
    `CREATE TABLE IF NOT EXISTS inquiry_fabrics (
      id ${autoIncrement},
      inquiry_id ${textType},
      composition ${textType},
      fabric_type ${textType},
      gsm INTEGER,
      dia INTEGER,
      dia_type ${textType},
      uom ${textType},
      rate ${numType},
      required_qty ${numType}
    )`,

    // 6. Inquiry Yarns
    `CREATE TABLE IF NOT EXISTS inquiry_yarns (
      id ${autoIncrement},
      inquiry_id ${textType},
      composition ${textType},
      yarn_composition ${textType},
      yarn_count ${textType},
      yarn_type ${textType},
      certification ${textType}
    )`,

    // 7. Price Quotations
    `CREATE TABLE IF NOT EXISTS price_quotations (
      id ${textType} PRIMARY KEY,
      inquiry_id ${textType},
      style_no ${textType},
      buyer ${textType},
      status ${textType} DEFAULT 'Draft',
      desired_margin ${numType},
      commercial_pct ${numType},
      commission_pct ${numType},
      total_cost ${numType},
      fob_price_doz ${numType},
      fob_price_pc ${numType},
      cm_value ${numType},
      cmc_pct ${numType},
      approved_by ${textType},
      approve_date ${textType},
      comments ${textType},
      size_group ${textType},
      mc_line INTEGER,
      prod_line_hour INTEGER,
      sewing_efficiency ${numType},
      cutting_efficiency ${numType},
      finishing_efficiency ${numType},
      qc_efficiency ${numType},
      prep_efficiency ${numType},
      yarn_cert ${textType},
      size_grading ${numType},
      exchange_rate ${numType},
      pcs_per_carton INTEGER,
      cbm_per_carton ${numType},
      country ${textType},
      buying_agent ${textType},
      buying_house_merchant ${textType},
      currency ${textType},
      color_range ${textType},
      sustainable_material ${textType},
      garments_cert ${textType},
      emb_type ${textType},
      emb_name ${textType},
      confirm_date ${textType},
      quotation_date ${textType},
      order_placement_date ${textType},
      embellishment_note ${textType},
      incoterm_place ${textType},
      transport_cost ${numType},
      asking_profit ${numType},
      revised_price ${numType},
      confirm_price ${numType},
      commi_dzn ${numType},
      target_price ${numType}
    )`,

    // 7a. Price Quotation SMV Bulletin Items
    `CREATE TABLE IF NOT EXISTS quotation_smv_items (
      id ${autoIncrement},
      quotation_id ${textType},
      item_name ${textType},
      set_ratio INTEGER,
      cutting_smv ${numType},
      sewing_smv ${numType},
      finishing_smv ${numType}
    )`,

    // 7b. Price Quotation Yarn Costing
    `CREATE TABLE IF NOT EXISTS quotation_yarn_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      yarn_composition ${textType},
      yarn_count ${textType},
      yarn_type ${textType},
      percentage INTEGER,
      color ${textType},
      cons_qty ${numType},
      process_loss_pct ${numType},
      supplier ${textType},
      rate ${numType},
      amount ${numType}
    )`,

    // 8. Quotation Fabric Costs
    `CREATE TABLE IF NOT EXISTS quotation_fabric_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      item_name ${textType},
      body_part ${textType},
      part_type ${textType},
      color_range ${textType},
      color_nature ${textType},
      composition ${textType},
      fabric_type ${textType},
      source ${textType},
      supplier ${textType},
      gsm INTEGER,
      dia_type ${textType},
      cons_basis ${textType},
      uom ${textType},
      grey_cons ${numType},
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType},
      process_loss_pct ${numType}
    )`,

    // 9. Quotation Trims Costs
    `CREATE TABLE IF NOT EXISTS quotation_trims_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      item_name ${textType},
      item_desc ${textType},
      cons_uom ${textType},
      cons_unit ${numType},
      extra_pct ${numType},
      total_cons ${numType},
      rate ${numType},
      amount ${numType},
      supplier ${textType}
    )`,

    // 10. Quotation Embellishment Costs
    `CREATE TABLE IF NOT EXISTS quotation_emb_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      emb_type ${textType},
      emb_name ${textType},
      item_name ${textType},
      description ${textType},
      body_part ${textType},
      cons_unit ${numType},
      process_loss_pct ${numType},
      total_qty ${numType},
      rate ${numType},
      amount ${numType},
      supplier ${textType}
    )`,

    // 11. Quotation Wash Costs
    `CREATE TABLE IF NOT EXISTS quotation_wash_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      wash_type ${textType},
      wash_name ${textType},
      item_name ${textType},
      description ${textType},
      body_part ${textType},
      cons_unit ${numType},
      process_loss_pct ${numType},
      total_qty ${numType},
      rate ${numType},
      amount ${numType},
      supplier ${textType}
    )`,

    // 11b. Price Quotation Commercial Cost
    `CREATE TABLE IF NOT EXISTS quotation_comml_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      comml_type ${textType},
      rate_pct ${numType},
      amount ${numType},
      status ${textType}
    )`,

    // 11c. Price Quotation Other Cost
    `CREATE TABLE IF NOT EXISTS quotation_other_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      cost_details ${textType},
      amount ${numType}
    )`,

    // 11d. Price Quotation Transport Cost
    `CREATE TABLE IF NOT EXISTS quotation_transport_costs (
      id ${autoIncrement},
      quotation_id ${textType},
      rate ${numType},
      cbm ${numType},
      amount ${numType}
    )`,

    // 12. Orders (Order Entry)
    `CREATE TABLE IF NOT EXISTS orders (
      id ${autoIncrement},
      style_no ${textType} NOT NULL,
      inquiry_id ${textType},
      buyer ${textType},
      style_desc ${textType},
      order_status ${textType},
      category ${textType},
      season ${textType},
      team_leader ${textType},
      dealing_merchant ${textType},
      factory_merchant ${textType},
      currency ${textType},
      uom ${textType},
      smv ${numType},
      repeat_no ${textType},
      model_code INTEGER,
      garment_dept ${textType},
      embellishment_type ${textType},
      embellishment_name ${textType},
      ship_mode ${textType},
      quality_label ${textType},
      garment_weight ${numType},
      avg_weight ${numType},
      image_url ${textType},
      yarn_type ${textType},
      yarn_comp ${textType},
      yarn_cert ${textType},
      embellishment_notes ${textType},
      special_instruction ${textType},
      terms ${textType},
      approved_by ${textType},
      feedback_comments ${textType},
      status ${textType} DEFAULT 'Draft'
    )`,

    // 13. Order POs
    `CREATE TABLE IF NOT EXISTS order_pos (
      id ${autoIncrement},
      order_id INTEGER,
      po_no ${textType} NOT NULL,
      status ${textType},
      received_date ${textType},
      ex_factory_date ${textType},
      ship_date ${textType},
      week_no INTEGER,
      lead_time INTEGER,
      po_qty INTEGER,
      fob_price ${numType},
      carton_info ${textType},
      comm_file_no ${textType},
      packing_ratio ${textType},
      delay_for ${textType},
      po_status ${textType},
      remarks ${textType},
      delivery_country ${textType},
      code ${textType},
      area ${textType},
      pcs_per_pack INTEGER,
      fob_in_dzn ${numType},
      internal_ref_no ${textType},
      print_qty INTEGER,
      embroidery_qty INTEGER,
      area_code ${textType},
      cutoff_date ${textType},
      cutoff_val ${textType},
      division ${textType},
      country_ship_date ${textType},
      pack_type ${textType},
      port_of_discharge ${textType},
      product_type ${textType},
      req_hanger ${textType},
      matrix_type ${textType}
    )`,

    // 14. Order PO Breakdown
    `CREATE TABLE IF NOT EXISTS order_po_breakdown (
      id ${autoIncrement},
      po_id INTEGER,
      color ${textType},
      size ${textType},
      set_qty INTEGER,
      pcs_qty INTEGER,
      rate ${numType},
      ex_cut_pct INTEGER,
      plan_cut_qty INTEGER,
      article_no ${textType},
      amount ${numType},
      garments_item ${textType}
    )`,

    // 15. Budgets
    `CREATE TABLE IF NOT EXISTS budgets (
      id ${autoIncrement},
      order_id INTEGER,
      budget_reference ${textType} UNIQUE,
      total_fabric_budget ${numType},
      total_trims_budget ${numType},
      total_cm_budget ${numType},
      total_emb_budget ${numType},
      total_wash_budget ${numType},
      total_other_budget ${numType},
      total_commercial_budget ${numType},
      total_commission_budget ${numType},
      total_budget_amount ${numType},
      actual_spend ${numType} DEFAULT 0,
      buyer ${textType},
      season ${textType},
      uom ${textType},
      smv ${numType},
      incoterm ${textType},
      mc_line INTEGER,
      prod_line_hour INTEGER,
      country ${textType},
      currency ${textType},
      ship_mode ${textType},
      remarks ${textType},
      budget_minute ${textType},
      cutting_smv ${numType},
      sewing_smv ${numType},
      finishing_smv ${numType},
      sewing_efficiency ${numType},
      cutting_efficiency ${numType},
      finishing_efficiency ${numType},
      buying_agent ${textType},
      incoterm_place ${textType},
      costing_date ${textType},
      copy_from ${textType},
      file_no ${textType},
      internal_ref ${textType},
      budget_label ${textType},
      status ${textType} DEFAULT 'Draft',
      total_lab_test_budget ${numType} DEFAULT 0,
      total_inspection_budget ${numType} DEFAULT 0,
      total_sample_budget ${numType} DEFAULT 0,
      total_freight_budget ${numType} DEFAULT 0,
      total_courier_budget ${numType} DEFAULT 0,
      total_certif_budget ${numType} DEFAULT 0,
      total_common_oh_budget ${numType} DEFAULT 0,
      total_deffd_lc_budget ${numType} DEFAULT 0,
      total_design_budget ${numType} DEFAULT 0,
      total_studio_budget ${numType} DEFAULT 0,
      total_opert_exp_budget ${numType} DEFAULT 0,
      total_income_tax_budget ${numType} DEFAULT 0,
      company ${textType},
      unit ${textType},
      feedback_from_approval ${textType},
      approve_by ${textType},
      user_remarks ${textType},
      quotation_id ${textType},
      style_no ${textType},
      style_desc ${textType},
      department ${textType}
    )`,

    // 15b. Budget Items
    `CREATE TABLE IF NOT EXISTS budget_items (
      id ${autoIncrement},
      budget_id INTEGER,
      item_type ${textType},
      budget_qty ${numType},
      budget_rate ${numType},
      budget_amount ${numType},
      actual_qty ${numType} DEFAULT 0,
      actual_amount ${numType} DEFAULT 0
    )`,

    // 15c. Budget Fabric Costs detailed subform
    `CREATE TABLE IF NOT EXISTS budget_fabric_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      gmt_item ${textType},
      body_part ${textType},
      body_part_type ${textType},
      color_range ${textType},
      color_nature ${textType},
      composition ${textType},
      fabric_type ${textType},
      fabric_nature ${textType},
      code ${textType},
      fabric_source ${textType},
      n_supplier ${textType},
      gsm_oz INTEGER,
      dia_type ${textType},
      color_size_sensitive ${textType},
      color ${textType},
      cons_basis ${textType},
      uom ${textType},
      grey_cons ${numType},
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType}
    )`,

    // 15d. Budget Fabric Consumption Grid Detail
    `CREATE TABLE IF NOT EXISTS budget_fabric_consumption (
      id ${autoIncrement},
      budget_fabric_cost_id INTEGER,
      po_no ${textType},
      color ${textType},
      gmt_sizes ${textType},
      po_qty INTEGER,
      dia_width INTEGER,
      dia_fin_type ${textType},
      finish_cons ${numType},
      process_loss_pct INTEGER,
      grey_cons ${numType},
      rate ${numType},
      amount ${numType},
      pcs INTEGER,
      total_finish_qty ${numType},
      total_qty ${numType},
      sample_qty INTEGER,
      total_amount ${numType},
      remarks ${textType}
    )`,

    // 15e. Budget Yarn Costing Production Details
    `CREATE TABLE IF NOT EXISTS budget_yarn_costing (
      id ${autoIncrement},
      budget_fabric_cost_id INTEGER,
      yarn_composition ${textType},
      yarn_count ${textType},
      yarn_type ${textType},
      percentage INTEGER,
      color ${textType},
      cons_qty ${numType},
      process_loss_pct INTEGER,
      n_supplier ${textType},
      rate ${numType},
      amount ${numType}
    )`,

    // 15f. Budget Trims Cost templates subform
    `CREATE TABLE IF NOT EXISTS budget_trims_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      gmt_item ${textType},
      item_name ${textType},
      item_description ${textType},
      cons_uom ${textType},
      cons_unit_gmt ${numType},
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType}
    )`,

    // 15g. Budget Trims Consumption Grid Detail
    `CREATE TABLE IF NOT EXISTS budget_trims_consumption (
      id ${autoIncrement},
      budget_trims_cost_id INTEGER,
      po_no ${textType},
      color ${textType},
      gmt_sizes ${textType},
      po_qty INTEGER,
      country ${textType},
      finish_cons ${numType},
      process_loss_pct INTEGER,
      grey_cons ${numType},
      rate ${numType},
      amount ${numType},
      pcs INTEGER,
      total_finish_qty ${numType},
      total_qty ${numType},
      total_amount ${numType}
    )`,

    // 15h. Budget Embellishment Costs
    `CREATE TABLE IF NOT EXISTS budget_emb_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      emb_type ${textType},
      emb_name ${textType},
      gmt_item ${textType},
      description ${textType},
      body_part ${textType},
      cons_unit_gmt ${numType},
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType},
      supplier ${textType},
      image_url ${textType}
    )`,

    // 15i. Budget Embellishment Consumption
    `CREATE TABLE IF NOT EXISTS budget_emb_consumption (
      id ${autoIncrement},
      budget_emb_cost_id INTEGER,
      po_no ${textType},
      color ${textType},
      gmt_sizes ${textType},
      po_qty INTEGER,
      country ${textType},
      cons ${numType},
      process_loss_pct INTEGER,
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType},
      pcs INTEGER
    )`,

    // 15j. Budget Wash Costs
    `CREATE TABLE IF NOT EXISTS budget_wash_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      wash_type ${textType},
      wash_name ${textType},
      gmt_item ${textType},
      description ${textType},
      body_part ${textType},
      cons_unit_gmt ${numType},
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType},
      supplier ${textType},
      image_url ${textType}
    )`,

    // 15k. Budget Wash Consumption
    `CREATE TABLE IF NOT EXISTS budget_wash_consumption (
      id ${autoIncrement},
      budget_wash_cost_id INTEGER,
      po_no ${textType},
      color ${textType},
      gmt_sizes ${textType},
      po_qty INTEGER,
      country ${textType},
      cons ${numType},
      process_loss_pct INTEGER,
      rate ${numType},
      amount ${numType},
      total_qty ${numType},
      total_amount ${numType},
      pcs INTEGER
    )`,

    // 15l. Budget Commercial Costs
    `CREATE TABLE IF NOT EXISTS budget_comml_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      commercial_type ${textType},
      rate_pct ${numType},
      amount ${numType},
      status ${textType}
    )`,

    // 15m. Budget Commission Costs
    `CREATE TABLE IF NOT EXISTS budget_commission_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      particulars ${textType},
      comm_base ${textType},
      rate ${numType},
      amount ${numType},
      status ${textType}
    )`,

    // 15n. Budget Other Costs
    `CREATE TABLE IF NOT EXISTS budget_other_costs (
      id ${autoIncrement},
      budget_id INTEGER,
      cost_details ${textType},
      amount ${numType}
    )`,

    // 15o. Budget Templates
    `CREATE TABLE IF NOT EXISTS budget_templates (
      id ${autoIncrement},
      template_name ${textType},
      item_type ${textType},
      template_data ${textType}
    )`,

    // 16. Fabric Bookings
    `CREATE TABLE IF NOT EXISTS fabric_bookings (
      id ${autoIncrement},
      booking_reference ${textType} UNIQUE,
      budget_id INTEGER,
      basis ${textType},
      main_booking_id INTEGER,
      booking_date ${textType},
      supplier_name ${textType},
      delivery_date ${textType},
      inhouse_date ${textType},
      pay_mode ${textType},
      source ${textType},
      currency ${textType},
      attention ${textType},
      remarks ${textType},
      collar_cuff_info ${textType},
      terms_conditions ${textType},
      status ${textType} DEFAULT 'Pending'
    )`,

    // 17. Fabric Booking Items
    `CREATE TABLE IF NOT EXISTS fabric_booking_items (
      id ${autoIncrement},
      booking_id INTEGER,
      po_id INTEGER,
      po_no ${textType},
      color ${textType},
      size ${textType},
      item_size ${textType},
      garments_qty INTEGER,
      excess_pct INTEGER,
      total_qty ${numType},
      rate ${numType},
      amount ${numType}
    )`,

    // 18. Trims Bookings
    `CREATE TABLE IF NOT EXISTS trims_bookings (
      id ${autoIncrement},
      booking_reference ${textType} UNIQUE,
      budget_id INTEGER,
      basis ${textType},
      main_booking_id INTEGER,
      booking_date ${textType},
      source ${textType},
      supplier_name ${textType},
      delivery_date ${textType},
      inhouse_date ${textType},
      pay_mode ${textType},
      currency ${textType},
      attention ${textType},
      remarks ${textType},
      booking_label ${textType},
      terms_conditions ${textType},
      status ${textType} DEFAULT 'Pending',
      company ${textType},
      unit ${textType},
      booking_by ${textType},
      created_date ${textType},
      approval_date_time ${textType}
    )`,

    // 19. Trims Booking Items
    `CREATE TABLE IF NOT EXISTS trims_booking_items (
      id ${autoIncrement},
      booking_id INTEGER,
      po_id INTEGER,
      garments_color ${textType},
      item_color ${textType},
      item_name ${textType},
      item_desc ${textType},
      required_qty ${numType},
      prev_booked_qty ${numType} DEFAULT 0,
      work_order_qty ${numType},
      excess_pct INTEGER,
      final_wo_qty ${numType},
      rate ${numType},
      amount ${numType},
      buyer ${textType},
      style_no ${textType},
      po_no ${textType},
      garments_item ${textType},
      garments_shipment_date ${textType},
      item_booking_date ${textType},
      item_delivery_date ${textType},
      supplier ${textType},
      sensitivity ${textType},
      short_booking_qty ${numType},
      uom ${textType},
      payment_mode ${textType},
      source ${textType},
      booking_by ${textType},
      rmg_quantity ${numType},
      contrast_color ${textType},
      remarks ${textType}
    )`,

    // 22. Role Permissions
    `CREATE TABLE IF NOT EXISTS role_permissions (
      id ${autoIncrement},
      role ${textType} UNIQUE,
      allowed_pages ${textType}
    )`,

    // 23. User Permissions
    `CREATE TABLE IF NOT EXISTS user_permissions (
      id ${autoIncrement},
      username ${textType} UNIQUE,
      allowed_pages ${textType}
    )`
  ];

  for (let query of queries) {
    try {
      await runExec(query);
    } catch (e) {
      console.error("Error creating table. Query:", query, "Error:", e.message);
    }
  }
}

async function addCol(table, col, type) {
  try {
    await runQuery(`SELECT ${col} FROM ${table} LIMIT 1`);
  } catch (e) {
    console.log(`Column ${col} is missing in ${table}. Running migration...`);
    try {
      await runExec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      console.log(`Success: Added column ${col} to ${table}.`);
    } catch (err) {
      console.error(`Migration failed adding ${col} to ${table}:`, err.message);
    }
  }
}

async function runMigrations() {
  const textType = 'TEXT';
  const numType = dbType === 'postgres' ? 'DOUBLE PRECISION' : 'REAL';
  const intType = 'INTEGER';

  // Migrate sales_targets
  await addCol('sales_targets', 'brand', textType);
  await addCol('sales_targets', 'buying_agent', textType);
  await addCol('sales_targets', 'buying_agent_merchant', textType);
  await addCol('sales_targets', 'target_basic_qty', numType);
  await addCol('sales_targets', 'target_basic_val', numType);
  await addCol('sales_targets', 'target_casual_qty', numType);
  await addCol('sales_targets', 'target_casual_val', numType);
  await addCol('sales_targets', 'target_fashion_qty', numType);
  await addCol('sales_targets', 'target_fashion_val', numType);

  // Migrate quotation_inquiries
  await addCol('quotation_inquiries', 'garments_item', textType);
  await addCol('quotation_inquiries', 'approved_by', textType);
  await addCol('quotation_inquiries', 'approve_date', textType);
  await addCol('quotation_inquiries', 'company', textType);
  await addCol('quotation_inquiries', 'quoted_by', textType);
  await addCol('quotation_inquiries', 'buyer_name', textType);

  // Migrate price_quotations
  await addCol('price_quotations', 'size_group', textType);
  await addCol('price_quotations', 'mc_line', intType);
  await addCol('price_quotations', 'prod_line_hour', intType);
  await addCol('price_quotations', 'sewing_efficiency', numType);
  await addCol('price_quotations', 'cutting_efficiency', numType);
  await addCol('price_quotations', 'finishing_efficiency', numType);
  await addCol('price_quotations', 'qc_efficiency', numType);
  await addCol('price_quotations', 'prep_efficiency', numType);
  await addCol('price_quotations', 'yarn_cert', textType);
  await addCol('price_quotations', 'size_grading', numType);
  await addCol('price_quotations', 'exchange_rate', numType);
  await addCol('price_quotations', 'pcs_per_carton', intType);
  await addCol('price_quotations', 'cbm_per_carton', numType);
  await addCol('price_quotations', 'country', textType);
  await addCol('price_quotations', 'buying_agent', textType);
  await addCol('price_quotations', 'buying_house_merchant', textType);
  await addCol('price_quotations', 'buying_merchant', textType);
  await addCol('price_quotations', 'currency', textType);
  await addCol('price_quotations', 'color_range', textType);
  await addCol('price_quotations', 'sustainable_material', textType);
  await addCol('price_quotations', 'garments_cert', textType);
  await addCol('price_quotations', 'confirm_date', textType);
  await addCol('price_quotations', 'quotation_date', textType);
  await addCol('price_quotations', 'order_placement_date', textType);
  await addCol('price_quotations', 'order_place_date', textType);
  await addCol('price_quotations', 'embellishment_note', textType);
  await addCol('price_quotations', 'emb_note', textType);
  await addCol('price_quotations', 'incoterm_place', textType);
  await addCol('price_quotations', 'fabric_cost', numType);
  await addCol('price_quotations', 'trims_cost', numType);
  await addCol('price_quotations', 'emb_cost', numType);
  await addCol('price_quotations', 'wash_cost', numType);
  await addCol('price_quotations', 'comml_cost', numType);
  await addCol('price_quotations', 'lab_test', numType);
  await addCol('price_quotations', 'inspection_cost', numType);
  await addCol('price_quotations', 'cm_cost', numType);
  await addCol('price_quotations', 'sample_cost', numType);
  await addCol('price_quotations', 'freight_cost', numType);
  await addCol('price_quotations', 'other_cost', numType);
  await addCol('price_quotations', 'courier_cost', numType);
  await addCol('price_quotations', 'certif_cost', numType);
  await addCol('price_quotations', 'common_oh', numType);
  await addCol('price_quotations', 'deffd_lc', numType);
  await addCol('price_quotations', 'design_cost', numType);
  await addCol('price_quotations', 'studio_cost', numType);
  await addCol('price_quotations', 'opert_exp', numType);
  await addCol('price_quotations', 'income_tax', numType);
  await addCol('price_quotations', 'total_cost', numType);
  await addCol('price_quotations', 'transport_cost', numType);
  await addCol('price_quotations', 'asking_profit', numType);
  await addCol('price_quotations', 'revised_price', numType);
  await addCol('price_quotations', 'confirm_price', numType);
  await addCol('price_quotations', 'commi_dzn', numType);
  await addCol('price_quotations', 'target_price', numType);
  await addCol('price_quotations', 'buyer', textType);
  await addCol('price_quotations', 'garments_category', textType);
  await addCol('price_quotations', 'brand', textType);
  await addCol('price_quotations', 'style_desc', textType);
  await addCol('price_quotations', 'item_group', textType);
  await addCol('price_quotations', 'department', textType);
  await addCol('price_quotations', 'season', textType);
  await addCol('price_quotations', 'offer_qty', numType);
  await addCol('price_quotations', 'uom', textType);
  await addCol('price_quotations', 'costing_per', textType);
  await addCol('price_quotations', 'incoterm', textType);
  await addCol('price_quotations', 'team_leader', textType);
  await addCol('price_quotations', 'dealing_merchant', textType);
  await addCol('price_quotations', 'est_ship_date', textType);
  await addCol('price_quotations', 'pcs_carton', textType);
  await addCol('price_quotations', 'cbm_carton', textType);
  await addCol('price_quotations', 'remarks', textType);
  await addCol('price_quotations', 'image_url', textType);
  await addCol('price_quotations', 'files', textType);
  await addCol('price_quotations', 'emb_type', textType);
  await addCol('price_quotations', 'emb_name', textType);

  // Migrate quotation_trims_costs
  await addCol('quotation_trims_costs', 'gmt_item', textType);
  await addCol('quotation_trims_costs', 'status', textType);

  // Migrate quotation_emb_costs
  await addCol('quotation_emb_costs', 'status', textType);

  // Migrate quotation_wash_costs
  await addCol('quotation_wash_costs', 'status', textType);

  // Migrate orders
  await addCol('orders', 'yarn_type', textType);
  await addCol('orders', 'yarn_comp', textType);
  await addCol('orders', 'yarn_cert', textType);
  await addCol('orders', 'embellishment_notes', textType);
  await addCol('orders', 'special_instruction', textType);
  await addCol('orders', 'terms', textType);
  await addCol('orders', 'approved_by', textType);
  await addCol('orders', 'feedback_comments', textType);

  // Migrate order_pos
  await addCol('order_pos', 'fob_in_dzn', numType);
  await addCol('order_pos', 'internal_ref_no', textType);
  await addCol('order_pos', 'print_qty', intType);
  await addCol('order_pos', 'embroidery_qty', intType);
  await addCol('order_pos', 'area_code', textType);
  await addCol('order_pos', 'cutoff_date', textType);
  await addCol('order_pos', 'cutoff_val', textType);
  await addCol('order_pos', 'division', textType);
  await addCol('order_pos', 'country_ship_date', textType);
  await addCol('order_pos', 'pack_type', textType);
  await addCol('order_pos', 'port_of_discharge', textType);
  await addCol('order_pos', 'product_type', textType);
  await addCol('order_pos', 'req_hanger', textType);
  await addCol('order_pos', 'matrix_type', textType);

  // Migrate order_po_breakdown
  await addCol('order_po_breakdown', 'garments_item', textType);

  // Migrate budgets
  await addCol('budgets', 'buyer', textType);
  await addCol('budgets', 'season', textType);
  await addCol('budgets', 'uom', textType);
  await addCol('budgets', 'smv', numType);
  await addCol('budgets', 'incoterm', textType);
  await addCol('budgets', 'mc_line', intType);
  await addCol('budgets', 'prod_line_hour', intType);
  await addCol('budgets', 'country', textType);
  await addCol('budgets', 'currency', textType);
  await addCol('budgets', 'ship_mode', textType);
  await addCol('budgets', 'remarks', textType);
  await addCol('budgets', 'budget_minute', textType);
  await addCol('budgets', 'cutting_smv', numType);
  await addCol('budgets', 'sewing_smv', numType);
  await addCol('budgets', 'finishing_smv', numType);
  await addCol('budgets', 'sewing_efficiency', numType);
  await addCol('budgets', 'cutting_efficiency', numType);
  await addCol('budgets', 'finishing_efficiency', numType);
  await addCol('budgets', 'buying_agent', textType);
  await addCol('budgets', 'incoterm_place', textType);
  await addCol('budgets', 'costing_date', textType);
  await addCol('budgets', 'copy_from', textType);
  await addCol('budgets', 'file_no', textType);
  await addCol('budgets', 'internal_ref', textType);
  await addCol('budgets', 'budget_label', textType);
  await addCol('budgets', 'total_lab_test_budget', numType);
  await addCol('budgets', 'total_inspection_budget', numType);
  await addCol('budgets', 'total_sample_budget', numType);
  await addCol('budgets', 'total_freight_budget', numType);
  await addCol('budgets', 'total_courier_budget', numType);
  await addCol('budgets', 'total_certif_budget', numType);
  await addCol('budgets', 'total_common_oh_budget', numType);
  await addCol('budgets', 'total_deffd_lc_budget', numType);
  await addCol('budgets', 'total_design_budget', numType);
  await addCol('budgets', 'total_studio_budget', numType);
  await addCol('budgets', 'total_opert_exp_budget', numType);
  await addCol('budgets', 'total_income_tax_budget', numType);
  await addCol('budgets', 'company', textType);
  await addCol('budgets', 'unit', textType);
  await addCol('budgets', 'feedback_from_approval', textType);
  await addCol('budgets', 'approve_by', textType);
  await addCol('budgets', 'user_remarks', textType);
  await addCol('budgets', 'quotation_id', textType);
  await addCol('budgets', 'style_no', textType);
  await addCol('budgets', 'style_desc', textType);
  await addCol('budgets', 'department', textType);

  // Migrate bookings
  await addCol('fabric_bookings', 'collar_cuff_info', textType);
  await addCol('fabric_bookings', 'terms_conditions', textType);
  await addCol('fabric_bookings', 'company', textType);
  await addCol('fabric_bookings', 'unit', textType);
  await addCol('fabric_bookings', 'booking_by', textType);
  await addCol('fabric_bookings', 'linked_main_booking_ids', textType);
  await addCol('fabric_bookings', 'approved_by', textType);
  await addCol('fabric_bookings', 'approved_date', textType);
  await addCol('fabric_bookings', 'buyer', textType);
  await addCol('fabric_bookings', 'style_no', textType);
  await addCol('fabric_bookings', 'fabric_source', textType);
  await addCol('fabric_bookings', 'fabric_composition', textType);
  await addCol('fabric_bookings', 'dealing_merchant', textType);


  await addCol('fabric_booking_items', 'buyer', textType);
  await addCol('fabric_booking_items', 'style_no', textType);
  await addCol('fabric_booking_items', 'garments_item', textType);
  await addCol('fabric_booking_items', 'body_parts', textType);
  await addCol('fabric_booking_items', 'fabric_color', textType);
  await addCol('fabric_booking_items', 'yarn_type', textType);
  await addCol('fabric_booking_items', 'embellishment_type', textType);
  await addCol('fabric_booking_items', 'embellishment_name', textType);
  await addCol('fabric_booking_items', 'fabric_type', textType);
  await addCol('fabric_booking_items', 'fabric_composition', textType);
  await addCol('fabric_booking_items', 'gsm', intType);
  await addCol('fabric_booking_items', 'fabric_dia', textType);
  await addCol('fabric_booking_items', 'lab_dip', textType);
  await addCol('fabric_booking_items', 'garments_quantity', intType);
  await addCol('fabric_booking_items', 'total_fabric_quantity', numType);
  await addCol('fabric_booking_items', 'uom', textType);
  await addCol('fabric_booking_items', 'budget_quantity', numType);
  await addCol('fabric_booking_items', 'work_order_quantity', numType);
  await addCol('fabric_booking_items', 'rate', numType);
  await addCol('fabric_booking_items', 'amount', numType);
  await addCol('fabric_booking_items', 'yarn_tag', textType);
  await addCol('fabric_booking_items', 'garments_cert', textType);
  
  await addCol('trims_bookings', 'booking_label', textType);
  await addCol('trims_bookings', 'terms_conditions', textType);
  await addCol('trims_bookings', 'company', textType);
  await addCol('trims_bookings', 'unit', textType);
  await addCol('trims_bookings', 'booking_by', textType);
  await addCol('trims_bookings', 'created_date', textType);
  await addCol('trims_bookings', 'approval_date_time', textType);

  await addCol('trims_booking_items', 'buyer', textType);
  await addCol('trims_booking_items', 'style_no', textType);
  await addCol('trims_booking_items', 'po_no', textType);
  await addCol('trims_booking_items', 'garments_item', textType);
  await addCol('trims_booking_items', 'garments_shipment_date', textType);
  await addCol('trims_booking_items', 'item_booking_date', textType);
  await addCol('trims_booking_items', 'item_delivery_date', textType);
  await addCol('trims_booking_items', 'supplier', textType);
  await addCol('trims_booking_items', 'sensitivity', textType);
  await addCol('trims_booking_items', 'short_booking_qty', numType);
  await addCol('trims_booking_items', 'uom', textType);
  await addCol('trims_booking_items', 'payment_mode', textType);
  await addCol('trims_booking_items', 'source', textType);
  await addCol('trims_booking_items', 'booking_by', textType);
  await addCol('trims_booking_items', 'rmg_quantity', numType);
  await addCol('trims_booking_items', 'contrast_color', textType);
  await addCol('trims_booking_items', 'remarks', textType);
  await addCol('trims_bookings', 'feedback_by_approval_body', textType);
  await addCol('trims_bookings', 'approved_by', textType);
  await addCol('trims_booking_items', 'garments_cert', textType);
  await addCol('users', 'disabled', intType);
  await addCol('users', 'first_name', textType);
  await addCol('users', 'last_name', textType);
  await addCol('users', 'dob', textType);
  await addCol('users', 'phone', textType);



  // Seed NewYorker if missing
  const nykExists = await runQuery("SELECT 1 FROM buyers WHERE code='NYK'");
  if (nykExists.length === 0) {
    await runExec("INSERT INTO buyers (name, code, brand, buying_agent, team_leader, season) VALUES ('NewYorker', 'NYK', 'NewYorker Brand', 'NYK Agent', 'Demo User', 'winter')");
  }
}

async function seedData() {
  // Seed default users if empty
  await runExec("DELETE FROM users WHERE username IN ('admin', 'manager', 'user', 'production_manager', 'merchandiser', 'store_manager')");
  const existingUsers = await runQuery("SELECT COUNT(*) as count FROM users");
  const userCount = parseInt(existingUsers[0].count);
  if (userCount === 0) {
    console.log("Seeding default users...");
    const crypto = require('crypto');
    const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

    await runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', hashPassword('admin'), 'super_admin', 'Metamorphosis Ltd.', 'Demo Unit', 'admin@metamorphosis.com']
    );
    await runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      ['production_manager', hashPassword('production_manager'), 'production_manager', 'Metamorphosis Ltd.', 'Demo Unit', 'pm@metamorphosis.com']
    );
    await runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      ['merchandiser', hashPassword('merchandiser'), 'merchandiser', 'Metamorphosis Ltd.', 'Demo Unit', 'merch@metamorphosis.com']
    );
    await runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      ['store_manager', hashPassword('store_manager'), 'store_manager', 'Metamorphosis Ltd.', 'Demo Unit', 'store@metamorphosis.com']
    );
    await runExec(
      `INSERT INTO users (username, password, role, company, unit, email) VALUES (?, ?, ?, ?, ?, ?)`,
      ['user', hashPassword('user'), 'others', 'Metamorphosis Ltd.', 'Demo Unit', 'user@metamorphosis.com']
    );
    console.log("Seeding users complete.");
  }

  const existingBuyers = await runQuery("SELECT COUNT(*) as count FROM buyers");
  const count = parseInt(existingBuyers[0].count);
  if (count === 0) {
    console.log("Seeding initial master data...");
    
    // Seed Buyers
    await runExec("INSERT INTO buyers (name, code, brand, buying_agent, team_leader, season) VALUES (?, ?, ?, ?, ?, ?)",
      ['Zara', 'ZR', 'Zara Kids', 'Inditex Agent', 'John Doe', 'Summer 2026']);
    await runExec("INSERT INTO buyers (name, code, brand, buying_agent, team_leader, season) VALUES (?, ?, ?, ?, ?, ?)",
      ['H&M', 'HM', 'HM Basic', 'HM Agent', 'Jane Smith', 'Autumn 2026']);
    await runExec("INSERT INTO buyers (name, code, brand, buying_agent, team_leader, season) VALUES (?, ?, ?, ?, ?, ?)",
      ['Uniqlo', 'UQ', 'LifeWear', 'Fast Retailing', 'Ken Tanaka', 'Winter 2026']);

    // Seed Items Master
    await runExec("INSERT INTO items_master (item_name, item_group, category, uom, smv) VALUES (?, ?, ?, ?, ?)",
      ['Knit Basic T-Shirt', 'Basic', 'Jersey', 'Pcs', 8.5]);
    await runExec("INSERT INTO items_master (item_name, item_group, category, uom, smv) VALUES (?, ?, ?, ?, ?)",
      ['Knit Polo Shirt', 'Casual Basic', 'Jersey', 'Pcs', 14.0]);
    await runExec("INSERT INTO items_master (item_name, item_group, category, uom, smv) VALUES (?, ?, ?, ?, ?)",
      ['Girls Swimming Costume', 'Fashion', 'Lingerie', 'Pcs', 16.5]);
      
    console.log("Seeding complete.");
  }

  // Seed detailed mock budget if budgets is empty
  const existingBudgets = await runQuery("SELECT COUNT(*) as count FROM budgets");
  const budgetCount = parseInt(existingBudgets[0].count);
  if (budgetCount === 0) {
    console.log("Seeding detailed mock budget in db...");
    
    // Insert budget
    await runExec(
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        null, 'BG-ZR-polo-001', 8064, 97318, 89990, 63360, 222090, 0,
        0, 0, 480822, 'Approved',
        'Zara', 'Summer 2026', 'Pcs', 14.0, 'FOB', 12, 150, 'Bangladesh', 'USD',
        'Sea', 'Seeded simulation record 1', '12000', 1.5, 10.5, 2.0,
        65, 75, 80, 'Zara Agent',
        'Chittagong Port', '19th May 2026', '', 'FN-8891', 'IR-7721', 'Style Label',
        'Demo Factory Ltd.', 'Demo Unit', 'Looks perfectly within margins.', 'Super Admin', 'Verified',
        'QTN-001', 'test-style', 'Mock style description', 'Mens'
      ]
    );

    // Retrieve inserted budget id
    const seeded = await runQuery("SELECT id FROM budgets WHERE budget_reference = 'BG-ZR-polo-001'");
    if (seeded && seeded.length > 0) {
      const budgetId = seeded[0].id;
      
      // Seed fabric line
      await runExec(
        `INSERT INTO budget_fabric_costs (
          budget_id, gmt_item, body_part, body_part_type, color_range, color_nature,
          composition, fabric_type, fabric_nature, code, fabric_source, n_supplier,
          gsm_oz, dia_type, color_size_sensitive, color, cons_basis, uom, grey_cons,
          rate, amount, total_qty, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Polo Shirt', 'Body Fabric', 'Shell Fabric', 'Solid', 'Conventional',
          '100% Cotton Jersey', 'Jersey', 'Knit', '101', 'Production', 'Toma',
          180, 'Open Width', 'As per Garments Color', 'Conventional', 'Marker', 'Kg', 2.0,
          0.22, 0.44, 25200, 5544.0
        ]
      );
      
      // Get inserted fabric id
      const fSeeded = await runQuery("SELECT id FROM budget_fabric_costs WHERE budget_id = ?", [budgetId]);
      if (fSeeded && fSeeded.length > 0) {
        const fId = fSeeded[0].id;
        
        // Seed yarns
        await runExec(
          `INSERT INTO budget_yarn_costing (
            budget_fabric_cost_id, yarn_composition, yarn_count, yarn_type, percentage,
            color, cons_qty, process_loss_pct, n_supplier, rate, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fId, '100% Kashmir Yarn', '30S', 'Combed', 100,
            'Solid', 25200, 0, 'Toma', 0.22, 5544.0
          ]
        );
        
        // Seed fabric consumption
        await runExec(
          `INSERT INTO budget_fabric_consumption (
            budget_fabric_cost_id, po_no, color, gmt_sizes, po_qty, dia_width,
            dia_fin_type, finish_cons, process_loss_pct, grey_cons, rate, amount,
            pcs, total_finish_qty, total_qty, sample_qty, total_amount, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fId, 'PO-45577mu6', 'Conventional', 'M', 12000, 0,
            'Open', 2.0, 0, 2.0, 0.22, 0.44,
            1, 24000, 24000, 1200, 5280, 'Main body'
          ]
        );
      }

      // Seed trims
      await runExec(
        `INSERT INTO budget_trims_costs (
          budget_id, gmt_item, item_name, item_description, cons_uom, cons_unit_gmt,
          rate, amount, total_qty, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Polo Shirt', 'Sewing Thread', 'Standard polyester thread', 'Cone', 12.6,
          0.55, 6.93, 12600, 97318.0
        ]
      );
      
      const tSeeded = await runQuery("SELECT id FROM budget_trims_costs WHERE budget_id = ?", [budgetId]);
      if (tSeeded && tSeeded.length > 0) {
        const tId = tSeeded[0].id;
        await runExec(
          `INSERT INTO budget_trims_consumption (
            budget_trims_cost_id, po_no, color, gmt_sizes, po_qty, country,
            finish_cons, process_loss_pct, grey_cons, rate, amount, pcs,
            total_finish_qty, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tId, 'PO-45577mu6', 'Conventional', 'M', 12000, 'Bangladesh',
            12.6, 5, 13.23, 0.55, 7.2765, 1,
            151200, 158760, 87318
          ]
        );
      }

      // Seed embs
      await runExec(
        `INSERT INTO budget_emb_costs (
          budget_id, emb_type, emb_name, gmt_item, description, body_part,
          cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Print', 'Printing/Digital print', 'Polo Shirt', 'Front chest print', 'Body Part',
          12.0, 0.44, 5.28, 144000, 63360.0, 'Aman', ''
        ]
      );
      
      const eSeeded = await runQuery("SELECT id FROM budget_emb_costs WHERE budget_id = ?", [budgetId]);
      if (eSeeded && eSeeded.length > 0) {
        const eId = eSeeded[0].id;
        await runExec(
          `INSERT INTO budget_emb_consumption (
            budget_emb_cost_id, po_no, color, gmt_sizes, po_qty, country,
            cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            eId, 'PO-45577mu6', 'Conventional', 'M', 12000, 'Bangladesh',
            12.0, 0, 0.44, 5.28, 144000, 63360, 1
          ]
        );
      }

      // Seed washes
      await runExec(
        `INSERT INTO budget_wash_costs (
          budget_id, wash_type, wash_name, gmt_item, description, body_part,
          cons_unit_gmt, rate, amount, total_qty, total_amount, supplier, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Wet Process', 'Gmts Dyeing/PIGMENT DYEING', 'Polo Shirt', 'Pigment wash', 'Body Part',
          122.0, 0.22, 26.84, 1464000, 222090.0, 'Aman', ''
        ]
      );
      
      const wSeeded = await runQuery("SELECT id FROM budget_wash_costs WHERE budget_id = ?", [budgetId]);
      if (wSeeded && wSeeded.length > 0) {
        const wId = wSeeded[0].id;
        await runExec(
          `INSERT INTO budget_wash_consumption (
            budget_wash_cost_id, po_no, color, gmt_sizes, po_qty, country,
            cons, process_loss_pct, rate, amount, total_qty, total_amount, pcs
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            wId, 'PO-45577mu6', 'Conventional', 'M', 12000, 'Bangladesh',
            122.0, 0, 0.22, 26.84, 1464000, 222090, 1
          ]
        );
      }
    }
    console.log("Seeding detailed mock budget complete.");
  }

  // Seed specific PDF mockup demo data
  const specBudget = await runQuery("SELECT id FROM budgets WHERE budget_reference = 'DFL-BS-26-003264'");
  if (!specBudget || specBudget.length === 0) {
    console.log("Seeding PDF mockup demo budget DFL-BS-26-003264...");
    await runExec(
      `INSERT INTO budgets (
        order_id, budget_reference, total_fabric_budget, total_trims_budget,
        total_cm_budget, total_emb_budget, total_wash_budget, total_other_budget,
        total_commercial_budget, total_commission_budget, total_budget_amount, status,
        buyer, season, uom, smv, incoterm, mc_line, prod_line_hour, country, currency,
        ship_mode, remarks, budget_minute, cutting_smv, sewing_smv, finishing_smv,
        sewing_efficiency, cutting_efficiency, finishing_efficiency, buying_agent,
        incoterm_place, costing_date, copy_from, file_no, internal_ref, budget_label,
        total_lab_test_budget, total_inspection_budget, total_sample_budget,
        company, unit, feedback_from_approval, approve_by, user_remarks,
        quotation_id, style_no, style_desc, department
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , [
        null, 'DFL-BS-26-003264', 8064, 97318, 89990, 63360, 222090, 0,
        0, 0, 480822, 'Approved',
        'NewYorker', 'winter', 'Pcs', 14.0, 'FOB', 12, 150, 'Bangladesh', 'USD',
        'Sea', 'Mockup simulation record', '12000', 1.5, 10.5, 2.0,
        65, 75, 80, 'Zara Agent',
        'Chittagong Port', '10th May 2026', '', 'FN-8891', 'IR-7721', 'Style Label',
        'Demo Factory Ltd.', 'Demo Unit', 'Approved matching details.', 'Super Admin', 'Verified',
        'QTN-002', 'test', 'Mockup style description', 'Mens'
      ]
    );

    const newBudgetIdQuery = await runQuery("SELECT id FROM budgets WHERE budget_reference = 'DFL-BS-26-003264'");
    if (newBudgetIdQuery && newBudgetIdQuery.length > 0) {
      const budgetId = newBudgetIdQuery[0].id;
      
      // Seed fabric cost
      await runExec(
        `INSERT INTO budget_fabric_costs (
          budget_id, gmt_item, body_part, body_part_type, color_range, color_nature,
          composition, fabric_type, fabric_nature, code, fabric_source, n_supplier,
          gsm_oz, dia_type, color_size_sensitive, color, cons_basis, uom, grey_cons,
          rate, amount, total_qty, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Full polo', 'Body', 'Shell Fabric', 'White Color', 'Solid',
          '100%Cotton Jersey/Knit Fabric', 'Knit Fabric', 'Knit', '101', 'Production', 'Montrims LTD.',
          220, 'Open Width', 'As per Garments Color', 'blue', 'Marker', 'Kg', 2.0,
          0.22, 0.44, 25200, 5544.0
        ]
      );
      
      const newFabricIdQuery = await runQuery("SELECT id FROM budget_fabric_costs WHERE budget_id = ?", [budgetId]);
      if (newFabricIdQuery && newFabricIdQuery.length > 0) {
        const fId = newFabricIdQuery[0].id;
        
        // Seed yarns
        await runExec(
          `INSERT INTO budget_yarn_costing (
            budget_fabric_cost_id, yarn_composition, yarn_count, yarn_type, percentage,
            color, cons_qty, process_loss_pct, n_supplier, rate, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fId, '100% Kashmir Yarn', '30S', 'Combed', 100,
            'Solid', 25200, 0, 'Montrims LTD.', 0.22, 5544.0
          ]
        );
        
        // Seed fabric consumption
        await runExec(
          `INSERT INTO budget_fabric_consumption (
            budget_fabric_cost_id, po_no, color, gmt_sizes, po_qty, dia_width,
            dia_fin_type, finish_cons, process_loss_pct, grey_cons, rate, amount,
            pcs, total_finish_qty, total_qty, sample_qty, total_amount, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fId, '45577mu6', 'blue', 'M', 12000, 0,
            'Open', 2.0, 2, 2.0, 0.22, 5544.0,
            1, 25200, 25200, 20, 5544.0, 'Main body'
          ]
        );
      }

      // Seed budget trims cost matching the PDF layout
      await runExec(
        `INSERT INTO budget_trims_costs (
          budget_id, gmt_item, item_name, item_description, cons_uom, cons_unit_gmt,
          rate, amount, total_qty, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          budgetId, 'Full polo', 'Sewing Thread', 'Standard polyester thread', 'Cone', 12.6,
          0.55, 6.93, 158760, 87318.0
        ]
      );
      
      const newTrimsIdQuery = await runQuery("SELECT id FROM budget_trims_costs WHERE budget_id = ?", [budgetId]);
      if (newTrimsIdQuery && newTrimsIdQuery.length > 0) {
        const tId = newTrimsIdQuery[0].id;
        await runExec(
          `INSERT INTO budget_trims_consumption (
            budget_trims_cost_id, po_no, color, gmt_sizes, po_qty, country,
            finish_cons, process_loss_pct, grey_cons, rate, amount, pcs,
            total_finish_qty, total_qty, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tId, '45577rtu6', 'blue', 'M', 12600, 'Bangladesh',
            12.0, 5, 12.6, 0.55, 6.93, 1,
            151200, 158760, 87318
          ]
        );
      }
    }
  }


  // Seed mockup fabric booking
  const specBooking = await runQuery("SELECT id FROM fabric_bookings WHERE booking_reference = 'DFL-FB-26-000450'");
  if (!specBooking || specBooking.length === 0) {
    console.log("Seeding PDF mockup demo booking DFL-FB-26-000450...");
    const bQuery = await runQuery("SELECT id FROM budgets WHERE budget_reference = 'DFL-BS-26-003264'");
    if (bQuery && bQuery.length > 0) {
      const budgetId = bQuery[0].id;
      
      await runExec(
        `INSERT INTO fabric_bookings (
          booking_reference, budget_id, basis, main_booking_id, booking_date,
          supplier_name, delivery_date, inhouse_date, pay_mode, source, currency,
          attention, remarks, collar_cuff_info, terms_conditions, company, unit,
          booking_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
          'DFL-FB-26-000450', budgetId, 'Main', null, '2026-05-10',
          'Montrims LTD.', '2026-05-19', '2026-05-18', 'Credit', 'Non-Epz/Local', 'USD',
          'Mr. Attention', 'Remarks For User', '[]',
          'Yarn Type-\n* Yarn Certificate-\n* GSM Tolerance -3 % & + 3. If GSM is more the +3, then extra fabrics must be arranged with FOC basis.\n* Shrinkage: +-5%\n* Dimensional Stability: +-3%\n* CF To Rub (Wet)-\n* CF To Rub (Dry)-\n* Pilling Resistance-',
          'Demo Factory Ltd.', 'Demo Unit', 'Merchandiser Supervisor', 'Approved'
        ]
      );

      const bookingIdQuery = await runQuery("SELECT id FROM fabric_bookings WHERE booking_reference = 'DFL-FB-26-000450'");
      if (bookingIdQuery && bookingIdQuery.length > 0) {
        const bookingId = bookingIdQuery[0].id;
        
        await runExec(
          `INSERT INTO fabric_booking_items (
            booking_id, po_id, po_no, color, size, item_size, garments_qty, excess_pct,
            total_qty, rate, amount, buyer, style_no, garments_item, body_parts,
            fabric_color, yarn_type, embellishment_type, embellishment_name, fabric_type,
            fabric_composition, gsm, fabric_dia, lab_dip, garments_quantity,
            total_fabric_quantity, uom, budget_quantity, work_order_quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          , [
            bookingId, 1, '45577mu6', 'blue', 'M', 'M', 12000, 2,
            25200, 0.22, 5544.0, 'NewYorker', 'test', 'Full polo', 'Body',
            'blue', '100% Kashmir Yarn, 30S, Combed', 'Print', 'Digital Print', 'Knit Fabric',
            '100%Cotton Jersey/Knit Fabric', 220, '0', 'LD-991', 12000,
            25200, 'Kg', 25200, 25200
          ]
        );
      }
    }
  }

  // Seed mockup trims booking matching the PDF
  const specTrimsBooking = await runQuery("SELECT id FROM trims_bookings WHERE booking_reference = 'DFL-BG-26-003264'");
  if (!specTrimsBooking || specTrimsBooking.length === 0) {
    console.log("Seeding PDF mockup demo trims booking DFL-BG-26-003264...");
    const bQuery = await runQuery("SELECT id FROM budgets WHERE budget_reference = 'DFL-BS-26-003264'");
    if (bQuery && bQuery.length > 0) {
      const budgetId = bQuery[0].id;
      await runExec(
        `INSERT INTO trims_bookings (
          booking_reference, budget_id, basis, main_booking_id, booking_date,
          supplier_name, delivery_date, inhouse_date, pay_mode, source, currency,
          attention, remarks, booking_label, terms_conditions, company, unit,
          booking_by, status, created_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , [
          'DFL-BG-26-003264', budgetId, 'Main', null, '2026-05-10',
          'Montrims LTD.', '2026-05-19', '2026-05-18', 'Credit', 'Non-Epz/Local', 'USD',
          'Mr. Attention', 'Remarks For User', 'Style Label',
          'Earliest Delivery Date (EDD):\n* Latest Delivery Date (EDD):\n* Partial Shipment : Not Allowed\n* Allowance of the Qty :\n* Required Certifications :\n* Tests Requirement :\n* Supplier\'s Challan must have PN\'s ERP booking number with buyer, style, PO, Color; Otherwise goods will not be received.\n* Delivery must be within working hour & not on holiday\n* Claims Policies : 5%, 10%, 15% claims will be imposed on LC values if delivery is delayed 1-7 days, 8-13 days, 14-21 days consequently\n* Others (If Any) :\n* Multi shipment not allow',
          'Demo Factory Ltd.', 'Demo Unit', 'Supervisor', 'Approved', '2026-07-05T13:30:00.000Z'
        ]
      );

      const tbIdQuery = await runQuery("SELECT id FROM trims_bookings WHERE booking_reference = 'DFL-BG-26-003264'");
      if (tbIdQuery && tbIdQuery.length > 0) {
        const bookingId = tbIdQuery[0].id;
        await runExec(
          `INSERT INTO trims_booking_items (
            booking_id, po_id, po_no, garments_color, item_color, item_name,
            item_desc, required_qty, prev_booked_qty, work_order_qty, excess_pct,
            final_wo_qty, rate, amount, buyer, style_no, garments_item,
            sensitivity, short_booking_qty, uom, payment_mode, source, booking_by,
            rmg_quantity, contrast_color, remarks
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`
          , [
            bookingId, 1, '45577rtu6', 'blue', 'blue', 'Sewing Thread',
            'Standard polyester thread', 158760, 158760, 158760, 0.55, 87318.0,
            'NewYorker', 'test', 'Full polo', 'No Sensitive', 'Cone',
            'Credit', 'Non-Epz/Local', 'Supervisor', 12600, '', ''
          ]
        );
      }
    }
  }
}


module.exports = {
  initDb,
  runQuery,
  runExec,
  getDbType: () => dbType
};
