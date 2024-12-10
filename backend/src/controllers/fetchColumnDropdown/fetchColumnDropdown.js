const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchColumnDropdown = async (req, res) => {
    try {
        const { table_name, column_name } = req.body;

        if (!table_name || !column_name) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Provide both table_name and column_name.',
            });
        }

        const queryFetch = `
            SELECT dropdown_options 
            FROM app.dynamic_dropdowns
            WHERE table_name = $1 AND column_name = $2;
        `;

        const result = await client_update.query(queryFetch, [table_name, column_name]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No matching record found.',
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0].dropdown_options,
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