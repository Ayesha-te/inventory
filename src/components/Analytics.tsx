import React from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Package, Store, DollarSign } from 'lucide-react';
import type { Product, Supermarket } from '../types/Product';

interface AnalyticsProps {
  products: Product[];
  supermarkets: Supermarket[];
}

const Analytics: React.FC<AnalyticsProps> = ({ products, supermarkets }) => {
  // Calculate analytics data
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const averagePrice = totalValue / products.reduce((sum, p) => sum + p.quantity, 0);
  
  // Category distribution
  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Supermarket distribution
  const supermarketStats = products.reduce((acc, product) => {
    const supermarket = supermarkets.find(s => s.id === product.supermarketId);
    const name = supermarket?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Expiry analysis
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredProducts = products.filter(p => new Date(p.expiryDate) <= now).length;
  const expiringProducts = products.filter(p => {
    const expiry = new Date(p.expiryDate);
    return expiry <= thirtyDaysFromNow && expiry > now;
  }).length;
  const freshProducts = products.filter(p => new Date(p.expiryDate) > thirtyDaysFromNow).length;

  // Monthly trends (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', products: 45, value: 12500 },
    { month: 'Feb', products: 52, value: 14200 },
    { month: 'Mar', products: 48, value: 13800 },
    { month: 'Apr', products: 61, value: 16900 },
    { month: 'May', products: 58, value: 15600 },
    { month: 'Jun', products: 65, value: 18200 }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-[#020617] rounded-[40px] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B7F000] opacity-5 blur-[100px] -mr-32 -mt-32"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-5 rounded-2xl mr-8 rotate-3 shadow-[0_0_30px_rgba(183,240,0,0.3)]">
              <BarChart3 className="w-12 h-12 text-[#020617]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#B7F000]/10 text-[#B7F000] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#B7F000]/20">System Stats</span>
              </div>
              <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Inventory Reports</h2>
              <p className="text-gray-400 mt-4 font-medium uppercase text-sm tracking-widest max-w-md">Real-time inventory data and store performance.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#1e293b] border border-gray-800 p-4 rounded-3xl">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">System Health</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#B7F000] animate-pulse"></div>
                <span className="text-white font-bold tracking-tighter">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#020617] p-8 rounded-[40px] border border-gray-800 hover:border-[#B7F000]/50 transition-all duration-500 group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-gray-900 rounded-2xl group-hover:bg-[#B7F000]/10 transition-colors">
                <Package className="w-6 h-6 text-[#B7F000]" />
              </div>
              <span className="text-[10px] font-bold text-[#B7F000] uppercase tracking-widest bg-[#B7F000]/10 px-2 py-1 rounded">+12.4%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Items</p>
              <p className="text-5xl font-black text-white tracking-tighter mb-2">{totalProducts}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Growth</p>
            </div>
          </div>
        </div>

        <div className="bg-[#020617] p-8 rounded-[40px] border border-gray-800 hover:border-[#B7F000]/50 transition-all duration-500 group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-gray-900 rounded-2xl group-hover:bg-[#B7F000]/10 transition-colors">
                <DollarSign className="w-6 h-6 text-[#B7F000]" />
              </div>
              <span className="text-[10px] font-bold text-[#B7F000] uppercase tracking-widest bg-[#B7F000]/10 px-2 py-1 rounded">+8.2%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Money Value</p>
              <p className="text-5xl font-black text-white tracking-tighter mb-2">${totalValue.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Good Status</p>
            </div>
          </div>
        </div>

        <div className="bg-[#020617] p-8 rounded-[40px] border border-gray-800 hover:border-[#B7F000]/50 transition-all duration-500 group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-gray-900 rounded-2xl group-hover:bg-[#B7F000]/10 transition-colors">
                <TrendingUp className="w-6 h-6 text-[#B7F000]" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-800 px-2 py-1 rounded">STABLE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Average Item Price</p>
              <p className="text-5xl font-black text-white tracking-tighter mb-2">${averagePrice.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Stable</p>
            </div>
          </div>
        </div>

        <div className="bg-[#020617] p-8 rounded-[40px] border border-gray-800 hover:border-[#B7F000]/50 transition-all duration-500 group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="p-3 bg-gray-900 rounded-2xl group-hover:bg-[#B7F000]/10 transition-colors">
                <Store className="w-6 h-6 text-[#B7F000]" />
              </div>
              <span className="text-[10px] font-bold text-[#B7F000] uppercase tracking-widest bg-[#B7F000]/10 px-2 py-1 rounded">SECURE</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stores</p>
              <p className="text-5xl font-black text-white tracking-tighter mb-2">{supermarkets.length}</p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Store List</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden">
          <div className="p-10 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Item Types</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">How items are grouped</p>
            </div>
            <PieChart className="w-8 h-8 text-[#B7F000]" />
          </div>
          <div className="p-10 space-y-8">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => {
                const percentage = (count / totalProducts * 100).toFixed(1);
                
                return (
                  <div key={category} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-white uppercase tracking-widest group-hover:text-[#B7F000] transition-colors">{category}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{count} UNITS</span>
                        <span className="text-lg font-black text-white">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-900 rounded-full overflow-hidden p-1">
                      <div 
                        className="h-full bg-[#B7F000] rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Expiry Status */}
        <div className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden">
          <div className="p-10 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Expiry Tracking</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Watching when items expire</p>
            </div>
            <Calendar className="w-8 h-8 text-[#B7F000]" />
          </div>
          <div className="p-10 space-y-4">
            <div className="bg-gray-900/50 p-6 rounded-3xl border-l-4 border-[#B7F000] flex items-center justify-between group hover:bg-gray-900 transition-colors">
              <div>
                <p className="text-[10px] font-black text-[#B7F000] uppercase tracking-widest mb-1">Status: OK</p>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Good Items</h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white group-hover:text-[#B7F000] transition-colors">{freshProducts}</span>
                <p className="text-xs font-bold text-gray-500">{(freshProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-3xl border-l-4 border-yellow-500 flex items-center justify-between group hover:bg-gray-900 transition-colors">
              <div>
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Status: Warning</p>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Expiring Soon</h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white group-hover:text-yellow-500 transition-colors">{expiringProducts}</span>
                <p className="text-xs font-bold text-gray-500">{(expiringProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-3xl border-l-4 border-red-500 flex items-center justify-between group hover:bg-gray-900 transition-colors">
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Status: Bad</p>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Expired Items</h4>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white group-hover:text-red-500 transition-colors">{expiredProducts}</span>
                <p className="text-xs font-bold text-gray-500">{(expiredProducts / totalProducts * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supermarket Performance */}
      <div className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden">
        <div className="p-10 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Store Performance</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">How stores are doing</p>
          </div>
          <Store className="w-8 h-8 text-[#B7F000]" />
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(supermarketStats)
            .sort(([,a], [,b]) => b - a)
            .map(([name, count]) => {
              const supermarket = supermarkets.find(s => s.name === name);
              const supermarketProducts = products.filter(p => p.supermarketId === supermarket?.id);
              const totalValue = supermarketProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
              
              return (
                <div key={name} className="bg-gray-900/30 border border-gray-800 p-8 rounded-[32px] hover:border-[#B7F000]/50 transition-all group">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-[#B7F000] transition-colors">{name}</h4>
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-[#B7F000]" />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Item Count</span>
                      <span className="text-lg font-black text-white">{count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Value</span>
                      <span className="text-lg font-black text-[#B7F000]">${totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Average Price</span>
                      <span className="text-sm font-bold text-white">
                        ${supermarketProducts.length > 0 ? (totalValue / supermarketProducts.reduce((sum, p) => sum + p.quantity, 0)).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-[#020617] rounded-[40px] border border-gray-800 overflow-hidden">
        <div className="p-10 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Sales Trends</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Monthly sales data</p>
          </div>
          <TrendingUp className="w-8 h-8 text-[#B7F000]" />
        </div>
        <div className="p-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 items-end">
            {monthlyData.map((data) => (
              <div key={data.month} className="text-center group">
                <div className="relative mb-6 h-64 bg-gray-900/50 rounded-2xl flex items-end p-2 border border-gray-800/50">
                   <div 
                    className="w-full bg-[#B7F000] rounded-xl transition-all duration-700 ease-out shadow-[0_0_20px_rgba(183,240,0,0.2)] group-hover:shadow-[0_0_30px_rgba(183,240,0,0.4)]" 
                    style={{
                      height: `${(data.products / 70) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-widest mb-2 group-hover:text-[#B7F000] transition-colors">{data.month}</p>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{data.products} ITEMS</p>
                  <p className="text-[10px] font-black text-[#B7F000] uppercase tracking-tighter">${(data.value / 1000).toFixed(1)}K MONEY</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;