import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Filter, Check, LineChart, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { getMarketInsights, getLatestMandiPrices } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { getAllStates, getDistricts } from 'india-state-district';

const COLORS = {
  wheat: { stroke: '#84cc16', fill: '#84cc16' },
  paddy: { stroke: '#10b981', fill: '#10b981' },
  sugarcane: { stroke: '#f59e0b', fill: '#f59e0b' },
  potato: { stroke: '#d97706', fill: '#d97706' },
  tomato: { stroke: '#ef4444', fill: '#ef4444' },
  onion: { stroke: '#a855f7', fill: '#a855f7' },
  maize: { stroke: '#eab308', fill: '#eab308' },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-green-300 p-4 rounded-xl shadow-xl min-w-[150px]">
        <p className="text-gray-600 text-xs uppercase tracking-wider mb-2 font-semibold">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="capitalize font-medium text-sm" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="text-green-900 font-semibold text-sm">
                ₹{entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MarketTrends() {
  const [timeframe, setTimeframe] = useState<'yearly' | 'monthly'>('yearly');
  const [gap, setGap] = useState<number>(0); // 0 = every month, 1 = skip 1, 2 = skip 2 (quarterly)
  
  const [activeCrops, setActiveCrops] = useState({
    wheat: true,
    paddy: true,
    sugarcane: false,
    potato: false,
    tomato: false,
    onion: false,
    maize: false,
  });

  const [serverData, setServerData] = useState<any[]>([]);
  const [insights, setInsights] = useState({ prediction: '', alert: '' });
  const [isLoading, setIsLoading] = useState(false);

  const allStates = useMemo(() => getAllStates(), []);
  
  const [selectedStateCode, setSelectedStateCode] = useState("UP");
  const [selectedStateName, setSelectedStateName] = useState("Uttar Pradesh");
  
  const districts = useMemo(() => getDistricts(selectedStateCode) || [], [selectedStateCode]);
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0] || "Lucknow");
  
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [isLoadingMandi, setIsLoadingMandi] = useState(false);

  // Fetch AI generated Mandi Prices
  useEffect(() => {
    let isMounted = true;
    const fetchMandi = async () => {
      setIsLoadingMandi(true);
      try {
        const res = await getLatestMandiPrices(selectedStateName, selectedDistrict);
        if (isMounted && res.success) {
          setMandiPrices(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch mandi prices', error);
      } finally {
        if (isMounted) setIsLoadingMandi(false);
      }
    };
    fetchMandi();
    return () => { isMounted = false; };
  }, [selectedStateName, selectedDistrict]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getMarketInsights(timeframe);
        if (isMounted && res.success) {
          setServerData(res.data);
          setInsights(res.insights);
        }
      } catch (error) {
        console.error('Failed to fetch market insights', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [timeframe]);

  const toggleCrop = (crop: keyof typeof activeCrops) => {
    setActiveCrops(prev => ({ ...prev, [crop]: !prev[crop] }));
  };

  const chartData = useMemo(() => {
    let data = [...serverData];
    
    if (timeframe === 'monthly' && gap > 0) {
      // Apply gap filter for monthly
      // gap 1 = indices 0, 2, 4...
      // gap 2 = indices 0, 3, 6...
      data = data.filter((_, i) => i % (gap + 1) === 0);
    }
    
    return data;
  }, [serverData, timeframe, gap]);

  return (
    <div className="p-4 md:p-8 min-h-full relative overflow-hidden flex flex-col items-center">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="relative z-10 w-full max-w-5xl space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-green-950 mb-2">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-600">Trends & AI Insights</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-base">Real-time mandi prices and ML-based forecasting.</p>
          </div>
        </motion.div>

        {/* Latest Mandi Prices Section */}
        <motion.div variants={itemVariants} className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-green-950 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-700" /> Latest Mandi Prices
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={selectedStateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedStateCode(code);
                  const stateObj = allStates.find(s => s.code === code);
                  if (stateObj) setSelectedStateName(stateObj.name);
                  
                  const newDistricts = getDistricts(code);
                  if (newDistricts && newDistricts.length > 0) {
                    setSelectedDistrict(newDistricts[0]);
                  } else {
                    setSelectedDistrict("");
                  }
                }}
                className="bg-white border border-green-200 text-green-800 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-40"
              >
                {allStates.map((state) => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-white border border-green-200 text-green-800 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-40"
                disabled={districts.length === 0}
              >
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoadingMandi ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-700" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mandiPrices.map((item, idx) => (
                <Card key={idx} className="bg-white/40 backdrop-blur-xl border-green-200/50 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors" />
                  <CardContent className="p-5">
                    <h3 className="font-bold text-emerald-400 text-lg mb-1">{item.crop}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1 mb-4">
                      <MapPin className="h-3 w-3" /> {item.mandi}
                    </p>
                    <div className="bg-green-50/50 rounded-lg p-3 flex justify-between items-center border border-green-200/50">
                      <span className="text-gray-600 text-xs font-medium">Modal Price</span>
                      <div className="flex items-center gap-2">
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-700" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        ) : (
                          <div className="h-1 w-3 bg-zinc-500 rounded-full" />
                        )}
                        <span className="text-green-900 font-bold">₹{item.price}<span className="text-gray-500 text-xs font-normal">/{item.unit}</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Controls Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Crop Selector */}
          <Card className="bg-white/40 backdrop-blur-xl border-green-200/50 lg:col-span-2">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                <Filter className="h-4 w-4" /> Compare Crops
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(activeCrops) as Array<keyof typeof activeCrops>).map((crop) => (
                  <button
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all flex items-center gap-2 capitalize ${
                      activeCrops[crop] 
                      ? `bg-green-50 text-green-950 border-[${COLORS[crop].stroke}]` 
                      : 'bg-green-50/50 text-gray-500 border-green-200 hover:border-green-300'
                    }`}
                    style={{ borderColor: activeCrops[crop] ? COLORS[crop].stroke : '' }}
                  >
                    {activeCrops[crop] && <Check className="h-3 w-3" style={{ color: COLORS[crop].stroke }} />}
                    {crop}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeframe & Gap Selector */}
          <Card className="bg-white/40 backdrop-blur-xl border-green-200/50">
            <CardContent className="p-4 space-y-4">
              <div className="flex rounded-lg overflow-hidden border border-green-200 p-1 bg-green-50/50">
                <button
                  onClick={() => setTimeframe('yearly')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${timeframe === 'yearly' ? 'bg-green-50 text-green-950 shadow' : 'text-gray-500 hover:text-green-800'}`}
                >
                  5 Years
                </button>
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${timeframe === 'monthly' ? 'bg-green-50 text-green-950 shadow' : 'text-gray-500 hover:text-green-800'}`}
                >
                  Monthly (1Y)
                </button>
              </div>

              <AnimatePresence>
                {timeframe === 'monthly' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <Label className="text-gray-600 text-xs">Interval Gap</Label>
                    <div className="flex gap-2">
                      {[
                        { val: 0, label: 'None' },
                        { val: 1, label: '1 Mo' },
                        { val: 2, label: 'Quarterly' }
                      ].map((g) => (
                        <button
                          key={g.val}
                          onClick={() => setGap(g.val)}
                          className={`flex-1 py-1 border rounded-md text-xs font-medium transition-all ${
                            gap === g.val ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white border-green-200 text-gray-500 hover:border-green-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* The Chart */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/40 backdrop-blur-xl border-green-200/50 shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-950 flex items-center gap-2 text-lg">
                <LineChart className="h-5 w-5 text-green-700" />
                Commodity Price Aggregation (₹ per Quintal)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {Object.keys(activeCrops).map(crop => (
                        <linearGradient key={crop} id={`color${crop}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[crop as keyof typeof COLORS].fill} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={COLORS[crop as keyof typeof COLORS].fill} stopOpacity={0}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="label" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} tickMargin={10} />
                    <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} domain={['auto', 'auto']} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {(Object.keys(activeCrops) as Array<keyof typeof activeCrops>).map((crop) => (
                      activeCrops[crop] && (
                        <Area 
                          key={crop}
                          type="monotone" 
                          dataKey={crop} 
                          name={crop}
                          stroke={COLORS[crop].stroke} 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill={`url(#color${crop})`} 
                          animationDuration={1000}
                        />
                      )
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Advisory Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-lime-950/20 border-lime-900/30">
            <CardContent className="p-5 flex gap-4">
              <div className="p-3 bg-lime-900/30 rounded-full h-fit">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-green-600 font-semibold mb-1 text-sm flex items-center gap-2">
                  Market Forecast (AI)
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {isLoading ? "Analyzing market trends..." : (insights.prediction || "Select timeframe to see AI market predictions.")}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-950/20 border-orange-900/30">
            <CardContent className="p-5 flex gap-4">
              <div className="p-3 bg-orange-900/30 rounded-full h-fit">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-orange-500 font-semibold mb-1 text-sm flex items-center gap-2">
                  Smart Spoilage Alert
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {isLoading ? "Generating risk assessment..." : (insights.alert || "Select timeframe to see AI spoilage alerts.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}