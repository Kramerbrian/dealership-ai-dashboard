/**
 * Secure API Proxy for API Keys Management
 * Protects Supabase credentials by keeping them server-side only
 */

const { supabaseAdmin } = require('../lib/supabase');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;

    // GET - Retrieve API keys
    if (method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('*')
        .eq('active', true)
        .eq('environment', 'production')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Never expose raw keys - return masked versions
      const sanitizedData = data.map(item => ({
        id: item.id,
        name: item.name,
        key_preview: item.api_key ? `${item.api_key.substring(0, 8)}...` : null,
        platform: item.platform,
        active: item.active,
        environment: item.environment,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      res.status(200).json(sanitizedData);
      return;
    }

    // POST - Save new API keys
    if (method === 'POST') {
      const { keys } = req.body;

      if (!keys || typeof keys !== 'object') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
      }

      // Insert or update API keys
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .upsert(keys, { onConflict: 'platform,environment' });

      if (error) throw error;

      res.status(200).json({ success: true, message: 'API keys saved successfully' });
      return;
    }

    // PUT - Update specific API key
    if (method === 'PUT') {
      const { id, updates } = req.body;

      if (!id || !updates) {
        res.status(400).json({ error: 'Missing id or updates' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'API key updated successfully' });
      return;
    }

    // DELETE - Remove API key
    if (method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }

      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'API key deleted successfully' });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Keys Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
