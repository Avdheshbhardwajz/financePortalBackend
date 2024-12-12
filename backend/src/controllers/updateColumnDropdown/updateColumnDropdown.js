const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.updateColumnDropDown = async (req, res) => {
    try {
        const { table_name, dropdown_options } = req.body;

        if (!table_name || !Array.isArray(dropdown_options)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input. Provide table_name and dropdown_options as an array of objects.',
            });
        }

        const queryCheckTable = `
            SELECT dropdown_options 
            FROM app.dynamic_dropdowns 
            WHERE table_name = $1;
        `;

        const queryInsert = `
            INSERT INTO app.dynamic_dropdowns (table_name, dropdown_options, created_at, updated_at)
            VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;

        const queryUpdate = `
            UPDATE app.dynamic_dropdowns
            SET dropdown_options = $1::jsonb,
                updated_at = CURRENT_TIMESTAMP
            WHERE table_name = $2;
        `;

        // Check if the table exists
        const result = await client_update.query(queryCheckTable, [table_name]);

        if (result.rows.length > 0) {
            // Table exists, update its dropdown_options
            let existingOptions = result.rows[0].dropdown_options || [];

            // Merge incoming dropdown_options into existingOptions
            dropdown_options.forEach(newOption => {
                const existingIndex = existingOptions.findIndex(
                    item => item.columnName === newOption.columnName
                );

                if (existingIndex > -1) {
                    // Column exists, update its options
                    existingOptions[existingIndex].options = newOption.options;
                } else {
                    // Column does not exist, add new column
                    existingOptions.push(newOption);
                }
            });

            // Update the table with merged dropdown_options
            await client_update.query(queryUpdate, [
                JSON.stringify(existingOptions),
                table_name,
            ]);
        } else {
            // Table does not exist, insert new row
            await client_update.query(queryInsert, [
                table_name,
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