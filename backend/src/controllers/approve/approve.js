const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.approve = async (req, res) => {
    const { request_id, comments, checker } = req.body;

    if (!request_id || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_id" and "checker" are required fields.',
        });
    }

    try {
        // Start transaction
        await client_update.query('BEGIN');

        // Update query
        const updateQuery = `
            UPDATE app.change_tracker
            SET 
                status = $1,
                comments = $2,
                updated_at = NOW(),
                checker = $3
            WHERE request_id = $4
            RETURNING *;
        `;

        const values = ['approved', comments || null, checker, request_id];

        const appSchemaResult = await client_update.query(updateQuery, values);

        if (appSchemaResult.rowCount === 0) {
            throw new Error('No record found with the given request_id.');
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change request approved successfully',
            trackerData: appSchemaResult.rows[0],
        });
    } catch (error) {
        await client_update.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};