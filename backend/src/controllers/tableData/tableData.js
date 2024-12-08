// const { client } = require('../../configuration/database/database.js');

// exports.tableData = async (req, res) => {
//     const tableName = req.params.name;
//     const { page = 1, pageSize = 10 } = req.query;

//     const pageNumber = parseInt(page, 10);
//     const size = parseInt(pageSize, 10);

//     if (isNaN(pageNumber) || pageNumber < 1 || isNaN(size) || size < 1) {
//         return res.status(400).json({ error: "Invalid pagination parameters." });
//     }

//     if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
//         return res.status(400).json({ error: "Invalid table name." });
//     }

//     const offset = (pageNumber - 1) * size;

//     try {
//         const query = `
//             SELECT * 
//             FROM ${tableName} 
//             LIMIT $1 OFFSET $2;
//         `;
//         const countQuery = `SELECT COUNT(*) AS total FROM ${tableName};`;

//         const [dataResult, countResult] = await Promise.all([
//             client.query(query, [size, offset]), 
//             client.query(countQuery)
//         ]);

//         const total = parseInt(countResult.rows[0].total, 10);
//         const totalPages = Math.ceil(total / size);

//         res.status(200).json({
//             data: dataResult.rows,
//             pagination: {
//                 total,
//                 totalPages,
//                 currentPage: pageNumber,
//                 pageSize: size,
//             }
//         });
//     } catch (error) {
//         console.error(`Error fetching data from table ${tableName}:`, error);
//         res.status(500).json({ error: `Failed to fetch data from table ${tableName}.` });
//     }
// };
const { client } = require('../../configuration/database/database.js');

exports.tableData = async (req, res) => {
    const tableName = req.params.name;
    const { page = 1, pageSize = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(size) || size < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters." });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return res.status(400).json({ error: "Invalid table name." });
    }

    const offset = (pageNumber - 1) * size;

    try {
        // First check if the table exists
        const checkTableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            );
        `;
        const tableExists = await client.query(checkTableQuery, [tableName]);
        
        if (!tableExists.rows[0].exists) {
            return res.status(404).json({ 
                error: `Table ${tableName} does not exist in the public schema.` 
            });
        }

        const query = `
            SELECT * 
            FROM public.${tableName} 
            LIMIT $1 OFFSET $2;
        `;
        const countQuery = `SELECT COUNT(*) AS total FROM public.${tableName};`;

        const [dataResult, countResult] = await Promise.all([
            client.query(query, [size, offset]), 
            client.query(countQuery)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        const totalPages = Math.ceil(total / size);

        res.status(200).json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total,
                totalPages,
                currentPage: pageNumber,
                pageSize: size,
            }
        });
    } catch (error) {
        console.error(`Error fetching data from table ${tableName}:`, error);
        res.status(500).json({ 
            success: false,
            error: `Failed to fetch data from table ${tableName}.`,
            details: error.message
        });
    }
};