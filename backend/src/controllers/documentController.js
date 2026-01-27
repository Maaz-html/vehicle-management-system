const pool = require('../utils/database');
const supabase = require('../utils/supabaseClient');

const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'DOCUMENTS';

// Upload documents to Supabase Storage
const uploadDocuments = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ error: 'Vehicle ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    for (const file of req.files) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${vehicle_id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // Save to Database
      // Note: We store the relative path for easy deletion later, 
      // but we return the public URL for the frontend.
      await pool.query(
        'INSERT INTO documents (vehicle_id, file_path, original_filename, file_size) VALUES ($1, $2, $3, $4)',
        [vehicle_id, filePath, file.originalname, file.size]
      );
    }

    res.status(201).json({ message: 'Documents uploaded successfully' });
  } catch (err) {
    console.error('Supabase upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get documents by vehicle ID
const getDocumentsByVehicleId = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    console.log(`Fetching documents for vehicleId: ${vehicleId}`);

    const result = await pool.query(
      'SELECT * FROM documents WHERE vehicle_id = $1',
      [vehicleId]
    );

    console.log(`Found ${result.rows.length} documents for vehicle ${vehicleId}`);

    const documents = result.rows.map(doc => {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(doc.file_path);

      return {
        ...doc,
        url: publicUrl
      };
    });

    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete document from Supabase and Database
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.file_path]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError);
    }

    // Delete from Database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadDocuments,
  getDocumentsByVehicleId,
  deleteDocument,
};
