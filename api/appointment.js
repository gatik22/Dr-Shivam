const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
// These variables must be set in your Vercel Dashboard -> Settings -> Environment Variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = async function handler(req, res) {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { fullName, email, phone, service, message } = req.body;

        // Basic validation
        if (!fullName || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }

        if (!supabase) {
            return res.status(500).json({
                error: 'Supabase configuration is missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel.'
            });
        }

        // Insert data into Supabase
        const { data, error } = await supabase
            .from('appointments')
            .insert([
                {
                    full_name: fullName,
                    email: email,
                    phone: phone,
                    service: service,
                    message: message
                }
            ]);

        if (error) {
            console.error('Supabase DB error:', error);
            throw error;
        }

        return res.status(200).json({ success: true, message: 'Appointment requested successfully.', data });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Failed to save appointment. Please try again later.' });
    }
}
