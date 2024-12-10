const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.updateColumnDropdown = async (req, res) => {
    try {
        const { table_name, column_name, dropdown_options } = req.body;

        if (!table_name || !column_name || !Array.isArray(dropdown_options)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Provide table_name, column_name, and dropdown_options as an array.',
            });
        }

        const queryCheck = `
            SELECT COUNT(*) 
            FROM app.dynamic_dropdowns
            WHERE table_name = $1 AND column_name = $2;
        `;

        const queryUpdate = `
            UPDATE app.dynamic_dropdowns
            SET dropdown_options = $1::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE table_name = $2 AND column_name = $3;
        `;

        const queryInsert = `
            INSERT INTO app.dynamic_dropdowns (table_name, column_name, dropdown_options, created_at, updated_at)
            VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        const result = await client_update.query(queryCheck, [table_name, column_name]);


        if (parseInt(result.rows[0].count) > 0) {
            await client_update.query(queryUpdate, [
                JSON.stringify(dropdown_options),
                table_name,
                column_name,
            ]);
        } else {
            await client_update.query(queryInsert, [
                table_name,
                column_name,
                JSON.stringify(dropdown_options),
            ]);
        }

        res.status(200).json({
            success: true,
            message: 'Dropdown options updated successfully.',
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};