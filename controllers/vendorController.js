import pool from '../config/db.js';

const listVendors = async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT *, (SELECT COUNT(*) FROM vehicles WHERE vendor_id = vendors.id) as total_vehicles FROM vendors WHERE 1=1';
    const queryParams = [];

    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND company LIKE ?';
      queryParams.push(`%${search}%`);
    }

    const [totalResult] = await pool.query(query.replace('SELECT *, (SELECT COUNT(*) FROM vehicles WHERE vendor_id = vendors.id) as total_vehicles', 'SELECT COUNT(*) as total'), queryParams);
    const total = totalResult[0].total;
    
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [vendors] = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: vendors,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      message: 'Vendors retrieved successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
  }
};

const getVendorById = async (req, res) => {
    const { id } = req.params;
    try {
        const [vendors] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
        if (vendors.length === 0) {
            return res.status(404).json({ success: false, error: 'Vendor not found', statusCode: 404 });
        }
        const vendor = vendors[0];
        const [vehicles] = await pool.query('SELECT id, license_plate, brand, model, year, status FROM vehicles WHERE vendor_id = ?', [id]);
        vendor.vehicles = vehicles;
        res.json({ success: true, data: vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const createVendor = async (req, res) => {
    const { company, contact_person, email, phone, address, city, country, registration_number, tax_id, vehicles } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO vendors (company, contact_person, email, phone, address, city, country, registration_number, tax_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company, contact_person, email, phone, address, city, country, registration_number, tax_id]
        );
        const vendorId = result.insertId;

        if (vehicles && vehicles.length > 0) {
            for (const vehicle of vehicles) {
                await connection.query(
                    'INSERT INTO vehicles (vendor_id, vehicle_class, brand, model, year, license_plate, seating_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [vendorId, vehicle.vehicle_class, vehicle.brand, vehicle.model, vehicle.year, vehicle.license_plate, vehicle.seating_capacity]
                );
            }
        }
        await connection.commit();
        res.status(201).json({
            success: true,
            data: { id: vendorId, company, contact_person, email, status: 'Inactive' },
            message: 'Vendor created successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    } finally {
        connection.release();
    }
};

const updateVendor = async (req, res) => {
    const { id } = req.params;
    const { contact_person, email, phone } = req.body;
    try {
        await pool.query('UPDATE vendors SET contact_person = ?, email = ?, phone = ? WHERE id = ?', [contact_person, email, phone, id]);
        const [vendors] = await pool.query('SELECT id, company, contact_person, email, updated_at FROM vendors WHERE id = ?', [id]);
        res.json({
            success: true,
            data: vendors[0],
            message: 'Vendor updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const updateVendorStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE vendors SET status = ? WHERE id = ?', [status, id]);
        const [vendors] = await pool.query('SELECT id, status, updated_at FROM vendors WHERE id = ?', [id]);
        res.json({
            success: true,
            data: vendors[0],
            message: 'Vendor status updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteVendor = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete is not implemented yet in the schema. I'll do a hard delete for now.
        // To implement soft delete, I would add a `deleted_at` column to the vendors table.
        await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
        res.json({ success: true, message: 'Vendor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


export { listVendors, getVendorById, createVendor, updateVendor, updateVendorStatus, deleteVendor };
