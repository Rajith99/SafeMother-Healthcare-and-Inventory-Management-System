import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, TrendingUp, Package, Activity, Info } from 'lucide-react';

const SmartReorderDashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventoryForecast();
  }, []);

  const fetchInventoryForecast = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('http://localhost:3000/api/inventory/smart-reorder', {
        withCredentials: true 
      });
      
      if (response.data.success) {
        setInventoryData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 flex items-center rounded-lg bg-red-50 p-4 text-red-800 shadow-sm border border-red-200">
        <AlertCircle className="mr-3 h-5 w-5" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <Activity className="mr-3 h-8 w-8 text-blue-600" />
            Smart Reorder & Forecasting
          </h1>
          <p className="mt-2 text-gray-500 max-w-2xl">
            AI-driven demand forecasting powered by moving averages over the last 90 days. Identifies critical stock levels and automatically recommends reorder quantities to maintain safety thresholds.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <TrendingUp className="mr-1 h-4 w-4" /> BI Engine Active
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">Medicine</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">Current Stock</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">Safety Threshold</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">Forecasted Demand (Monthly)</th>
                <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-6 py-4 text-right font-semibold text-gray-900">Recommended Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {inventoryData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No reorder recommendations at this time.</p>
                    <p className="text-sm">Stock levels are optimal across all categories.</p>
                  </td>
                </tr>
              ) : (
                inventoryData.map((item) => {
                  const isCritical = item.CurrentStock < item.MinSafetyThreshold;
                  
                  return (
                    <tr key={item.MedicineID} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {item.MedicineName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${isCritical ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {item.CurrentStock}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {item.MinSafetyThreshold}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {Math.ceil(item.ForecastedDemand)} units
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {isCritical ? (
                          <span className="flex items-center text-red-600 font-medium">
                            <AlertCircle className="mr-1.5 h-4 w-4" />
                            Critical Stock
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600 font-medium">
                            <Info className="mr-1.5 h-4 w-4" />
                            High Demand
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                          Order {Math.ceil(item.RecommendedOrderQuantity)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SmartReorderDashboard;
