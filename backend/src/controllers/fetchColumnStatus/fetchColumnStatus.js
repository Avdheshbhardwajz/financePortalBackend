const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchColumnStatus = async (req, res) => {
    try {
        const { table_name } = req.body;

        // Validate input
        if (!table_name) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Provide table_name.',
            });
        }

        // Query to fetch column_list
        const queryFetch = `
            SELECT column_list 
            FROM app.column_permission
            WHERE table_name = $1;
        `;

        // Execute the query
        const result = await client_update.query(queryFetch, [table_name]);

        // Check if the row exists
        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No matching record found for the provided table_name.',
            });
        }

        // Return column_list
        res.status(200).json({
            success: true,
            data: result.rows[0].column_list,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the data',
            error: error.message,
        });
    }
};