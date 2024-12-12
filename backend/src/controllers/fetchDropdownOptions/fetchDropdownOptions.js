const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchDropdownOptions = async (req, res) => {
    try {
        const { table_name } = req.body;

        if (!table_name) {
            return res.status(400).json({
                success: false,
                message: 'table_name is required in the request body.',
            });
        }

        // Query to fetch dropdown_options from the database
        const query = `SELECT dropdown_options FROM app.dynamic_dropdowns WHERE table_name = $1`;
        const values = [table_name];

        // Execute the query using the database client
        const result = await client_update.query(query, values);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: `No dropdown options found for table_name: ${table_name}`,
            });
        }

        // Return the fetched dropdown options
        res.status(200).json({
            success: true,
            data: result.rows[0].dropdown_options,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the data.',
            error: error.message,
        });
    }
};