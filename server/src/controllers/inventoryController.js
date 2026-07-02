import { getPool } from '../config/database.js';

export const getSmartReorder = async (req, res) => {
    try {
        const pool = getPool();
        
        
        const result = await pool.request()
            .execute('sp_DemandForecastingAndReorder');
            
        res.status(200).json({
            success: true,
            data: result.recordset,
            message: 'Smart reorder forecasting fetched successfully'
        });
    } catch (error) {
        console.error('Error in smart reorder fetching:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inventory forecasts',
            error: error.message
        });
    }
};
