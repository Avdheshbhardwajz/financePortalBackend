const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.requestData = async (req, res) => {
    // const userId = uuidv4();
    const {
        request_id,
       
        table_name,
        row_id,
        old_values,
        new_values,
        status,
        maker_id,
        checker_id,
        created_at,
        updated_at,
        comments,
    } = req.body;

    if (!table_name || !maker_id) {
        return res.status(400).json({
            success: false,
            message: 'table_name and maker are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        const insertQuery = `
            INSERT INTO app.change_tracker (
                request_id,
               
                table_name,
                row_id,
                old_data,
                new_data,
                status,
                maker,
                checker,
                created_at,
                updated_at,
                comments
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ,  NOW(), NOW(), $9)
            RETURNING *;
        `;

        const values = [
            request_id || uuidv4(),
            table_name,
            row_id || null,
            old_values ? JSON.stringify(old_values) : null,
            new_values ? JSON.stringify(new_values) : null,
            status || 'pending',
            maker_id,
            checker_id || null,
            comments || null
        ];

        const result = await client_update.query(insertQuery, values);

        res.status(201).json({
            success: true,
            message: 'Data inserted successfully',
            data: result.rows[0],
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