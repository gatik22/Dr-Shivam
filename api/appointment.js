const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
    // ── CORS Headers ──
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight (browser sends this before the real POST)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // ── Check environment variables first ──
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
        return res.status(500).json({
            error: 'Server configuration error. SUPABASE_URL and SUPABASE_ANON_KEY must be set in Vercel Environment Variables.'
        });
    }

    // ── Initialize Supabase client inside handler (safe for serverless) ──
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { fullName, email, phone, service, message } = req.body;

        // ── Validate required fields ──
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ error: 'Full name is required.' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email address is required.' });
        }

        console.log('Inserting appointment for:', fullName, email);

        // ── Insert into Supabase — chain .select() so we get the row back ──
        const { data, error } = await supabase
            .from('appointments')
            .insert([{
                full_name: fullName.trim(),
                email: email.trim(),
                phone: phone ? phone.trim() : null,
                service: service || null,
                message: message ? message.trim() : null
            }])
            .select();

        if (error) {
            console.error('Supabase insert error:', JSON.stringify(error, null, 2));
            return res.status(500).json({
                error: 'Database error: ' + (error.message || 'Unknown error'),
                code: error.code,
                hint: error.hint,
                details: error.details
            });
        }

        console.log('Appointment saved successfully:', data);
        return res.status(200).json({
            success: true,
            message: 'Appointment requested successfully.',
            id: data[0]?.id
        });

    } catch (err) {
        console.error('Unexpected server error:', err);
        return res.status(500).json({
            error: 'An unexpected error occurred. Please try again later.'
        });
    }
};
