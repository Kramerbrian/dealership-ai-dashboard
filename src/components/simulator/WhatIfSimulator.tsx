"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Users,
  Car,
  BarChart3,
  RefreshCw,
  Save,
  Share2,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    seoInvestment: number;
    adSpend: number;
    inventoryIncrease: number;
    staffIncrease: number;
    priceAdjustment: number;
    reviewResponseRate: number;
  };
  results: {
    aivChange: number;
    revenueChange: number;
    costChange: number;
    roi: number;
    timeframe: string;
  };
  confidence: number;
}

interface SimulationData {
  month: string;
  baseline: number;
  scenario: number;
  difference: number;
}

export default function WhatIfSimulator() {
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>({
    id: '1',
    name: 'Current Scenario',
    description: 'Baseline performance metrics',
    parameters: {
      seoInvestment: 0,
      adSpend: 0,
      inventoryIncrease: 0,
      staffIncrease: 0,
      priceAdjustment: 0,
      reviewResponseRate: 78
    },
    results: {
      aivChange: 0,
      revenueChange: 0,
      costChange: 0,
      roi: 0,
      timeframe: '3 months'
    },
    confidence: 100
  });

  const [simulationData, setSimulationData] = useState<SimulationData[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<SimulationScenario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate mock simulation data
    const mockData: SimulationData[] = [
      { month: 'Jan', baseline: 125000, scenario: 125000, difference: 0 },
      { month: 'Feb', baseline: 132000, scenario: 138000, difference: 6000 },
      { month: 'Mar', baseline: 140000, scenario: 152000, difference: 12000 },
      { month: 'Apr', baseline: 135000, scenario: 148000, difference: 13000 },
      { month: 'May', baseline: 142000, scenario: 158000, difference: 16000 },
      { month: 'Jun', baseline: 138000, scenario: 155000, difference: 17000 }
    ];
    setSimulationData(mockData);
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      // Simulate API call to run what-if analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate results based on parameters
      const { parameters } = currentScenario;
      
      // Simple calculation logic (in production, this would be more sophisticated)
      const aivChange = (parameters.seoInvestment * 0.1) + (parameters.adSpend * 0.05) + (parameters.inventoryIncrease * 0.08);
      const revenueChange = aivChange * 1500; // $1500 per AIV point
      const costChange = parameters.seoInvestment + parameters.adSpend + (parameters.staffIncrease * 5000);
      const roi = costChange > 0 ? ((revenueChange - costChange) / costChange) * 100 : 0;
      
      const updatedScenario = {
        ...currentScenario,
        results: {
          aivChange: Math.round(aivChange * 100) / 100,
          revenueChange: Math.round(revenueChange),
          costChange: Math.round(costChange),
          roi: Math.round(roi * 100) / 100,
          timeframe: '3 months'
        },
        confidence: Math.max(60, 100 - Math.abs(parameters.priceAdjustment) * 2)
      };
      
      setCurrentScenario(updatedScenario);
      
      // Update simulation data
      const newData = simulationData.map(item => ({
        ...item,
        scenario: item.baseline + (revenueChange / 6), // Distribute change across months
        difference: (revenueChange / 6)
      }));
      setSimulationData(newData);
      
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveScenario = () => {
    const newScenario = {
      ...currentScenario,
      id: Date.now().toString(),
      name: `Scenario ${savedScenarios.length + 1}`
    };
    setSavedScenarios([...savedScenarios, newScenario]);
  };

  const loadScenario = (scenario: SimulationScenario) => {
    setCurrentScenario(scenario);
  };

  const resetScenario = () => {
    setCurrentScenario({
      ...currentScenario,
      parameters: {
        seoInvestment: 0,
        adSpend: 0,
        inventoryIncrease: 0,
        staffIncrease: 0,
        priceAdjustment: 0,
        reviewResponseRate: 78
      },
      results: {
        aivChange: 0,
        revenueChange: 0,
        costChange: 0,
        roi: 0,
        timeframe: '3 months'
      },
      confidence: 100
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getROIColor = (roi: number) => {
    if (roi > 20) return 'text-green-600';
    if (roi > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            What-If Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Test different scenarios to see how changes in your business strategy might impact your AIV scores and revenue.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenario Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SEO Investment */}
              <div className="space-y-2">
                <Label htmlFor="seo-investment">SEO Investment ($)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="seo-investment"
                    min={0}
                    max={50000}
                    step={1000}
                    value={[currentScenario.parameters.seoInvestment]}
                    onValueChange={([value]) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, seoInvestment: value }
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentScenario.parameters.seoInvestment}
                    onChange={(e) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, seoInvestment: Number(e.target.value) }
                      })
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Ad Spend */}
              <div className="space-y-2">
                <Label htmlFor="ad-spend">Ad Spend ($)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="ad-spend"
                    min={0}
                    max={100000}
                    step={1000}
                    value={[currentScenario.parameters.adSpend]}
                    onValueChange={([value]) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, adSpend: value }
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentScenario.parameters.adSpend}
                    onChange={(e) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, adSpend: Number(e.target.value) }
                      })
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Inventory Increase */}
              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory Increase (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="inventory"
                    min={0}
                    max={50}
                    step={1}
                    value={[currentScenario.parameters.inventoryIncrease]}
                    onValueChange={([value]) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, inventoryIncrease: value }
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentScenario.parameters.inventoryIncrease}
                    onChange={(e) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, inventoryIncrease: Number(e.target.value) }
                      })
                    }
                    className="w-16"
                  />
                </div>
              </div>

              {/* Staff Increase */}
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Increase (people)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="staff"
                    min={0}
                    max={10}
                    step={1}
                    value={[currentScenario.parameters.staffIncrease]}
                    onValueChange={([value]) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, staffIncrease: value }
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentScenario.parameters.staffIncrease}
                    onChange={(e) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, staffIncrease: Number(e.target.value) }
                      })
                    }
                    className="w-16"
                  />
                </div>
              </div>

              {/* Price Adjustment */}
              <div className="space-y-2">
                <Label htmlFor="price">Price Adjustment (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="price"
                    min={-20}
                    max={20}
                    step={1}
                    value={[currentScenario.parameters.priceAdjustment]}
                    onValueChange={([value]) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, priceAdjustment: value }
                      })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={currentScenario.parameters.priceAdjustment}
                    onChange={(e) => 
                      setCurrentScenario({
                        ...currentScenario,
                        parameters: { ...currentScenario.parameters, priceAdjustment: Number(e.target.value) }
                      })
                    }
                    className="w-16"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={runSimulation} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                  Run Simulation
                </Button>
                <Button variant="outline" onClick={resetScenario}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Scenarios */}
          {savedScenarios.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Scenarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedScenarios.map((scenario) => (
                    <div key={scenario.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{scenario.name}</div>
                        <div className="text-xs text-gray-600">
                          ROI: <span className={getROIColor(scenario.results.roi)}>{scenario.results.roi}%</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => loadScenario(scenario)}
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Simulation Results</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveScenario}>
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentScenario.results.aivChange > 0 ? '+' : ''}{currentScenario.results.aivChange}
                  </div>
                  <div className="text-sm text-blue-600">AIV Change</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentScenario.results.revenueChange > 0 ? '+' : ''}{formatCurrency(currentScenario.results.revenueChange)}
                  </div>
                  <div className="text-sm text-green-600">Revenue Change</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    +{formatCurrency(currentScenario.results.costChange)}
                  </div>
                  <div className="text-sm text-red-600">Cost Change</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getROIColor(currentScenario.results.roi)}`}>
                    {currentScenario.results.roi > 0 ? '+' : ''}{currentScenario.results.roi}%
                  </div>
                  <div className="text-sm text-purple-600">ROI</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Confidence: {currentScenario.results.confidence}%</Badge>
                  <Badge variant="outline">Timeframe: {currentScenario.results.timeframe}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Projection Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'baseline' ? 'Baseline' : 
                        name === 'scenario' ? 'Scenario' : 'Difference'
                      ]}
                    />
                    <Bar dataKey="baseline" fill="#e5e7eb" name="baseline" />
                    <Bar dataKey="scenario" fill="#3b82f6" name="scenario" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        name === 'baseline' ? 'Baseline' : 'Scenario'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#6b7280" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scenario" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
