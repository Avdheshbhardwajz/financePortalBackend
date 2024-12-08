const { client } = require('../../configuration/database/database.js');

exports.fetchChangeTrackerData = async (req, res) => {
    try {

        const query = `
            SELECT *
            FROM app.change_tracker
            ORDER BY created_at DESC;
        `;
        const result = await client.query(query);

        res.status(200).json({
            success: true,
            message: 'Successfully fetched change tracker data',
            data: result.rows,
        });
    } catch (error) {
        console.error('Error fetching change tracker data:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch change tracker data',
            error: error.message,
            stack: error.stack,
        });
    }
};

