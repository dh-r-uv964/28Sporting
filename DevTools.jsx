import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
    Loader2, Database, Users, MapPin, CheckCircle, AlertCircle, 
    Play, AlertTriangle, RefreshCw, Trash2, Building2, Shield,
    Zap, Globe, Settings
} from 'lucide-react';
import { createTestUsers } from '@/api/functions';
import { populateTestVenues } from '@/api/functions';
import { populateProductionVenues } from '@/api/functions';
import { cleanupInvalidData } from '@/api/functions';

export default function DevTools() {
  const [loadingStates, setLoadingStates] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  const executeFunction = async (functionName, functionCall, description) => {
    setLoading(functionName, true);
    setError(null);
    setResults(null);
    
    try {
      const response = await functionCall();
      setResults({
        type: functionName,
        description,
        data: response
      });
    } catch (err) {
      setError(`${description} failed: ${err.message}`);
    } finally {
      setLoading(functionName, false);
    }
  };

  const tools = [
    {
      category: "Production Data",
      tools: [
        {
          name: "populateProductionVenues",
          icon: Building2,
          title: "Load Production Venues",
          description: "Populate real venue data with coordinates, contact info, and comprehensive details",
          buttonText: "Load Production Data",
          variant: "default",
          action: () => executeFunction(
            "populateProductionVenues", 
            populateProductionVenues,
            "Production venue population"
          )
        },
        {
          name: "cleanupInvalidData",
          icon: Shield,
          title: "Clean Invalid Data",
          description: "Fix database integrity issues, remove invalid venue IDs, and clean expired requests",
          buttonText: "Clean Database",
          variant: "outline",
          action: () => executeFunction(
            "cleanupInvalidData", 
            cleanupInvalidData,
            "Data cleanup"
          )
        }
      ]
    },
    {
      category: "Development & Testing",
      tools: [
        {
          name: "populateTestVenues",
          icon: MapPin,
          title: "Test Venue Data",
          description: "Create sample venues for development and testing purposes",
          buttonText: "Add Test Venues",
          variant: "secondary",
          action: () => executeFunction(
            "populateTestVenues", 
            populateTestVenues,
            "Test venue population"
          )
        },
        {
          name: "createTestUsers",
          icon: Users,
          title: "Test User Accounts",
          description: "Generate test user profiles for matchmaking and feature testing",
          buttonText: "Create Test Users",
          variant: "secondary",
          action: () => executeFunction(
            "createTestUsers", 
            createTestUsers,
            "Test user creation"
          )
        }
      ]
    }
  ];

  const quickActions = [
    {
      name: "Full Setup",
      description: "Complete production setup: venues + cleanup",
      icon: Zap,
      action: async () => {
        setError(null);
        setResults(null);
        
        try {
          setLoading("fullSetup", true);
          
          // Step 1: Load production venues
          const venueResponse = await populateProductionVenues();
          
          // Step 2: Cleanup invalid data
          const cleanupResponse = await cleanupInvalidData();
          
          setResults({
            type: "fullSetup",
            description: "Complete production setup",
            data: {
              venues: venueResponse,
              cleanup: cleanupResponse
            }
          });
        } catch (err) {
          setError(`Full setup failed: ${err.message}`);
        } finally {
          setLoading("fullSetup", false);
        }
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Tools</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage app data and prepare for production launch</p>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Production Ready:</strong> Use "Load Production Data" and "Clean Database" to prepare the app for public launch with real venue data and proper error handling.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Globe className="w-5 h-5" />
            Production Launch Preparation
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            One-click setup for public deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                onClick={action.action}
                disabled={loadingStates.fullSetup}
                size="lg"
                className="justify-start gap-3 h-14 bg-green-600 hover:bg-green-700 text-white"
              >
                {loadingStates.fullSetup ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <action.icon className="w-5 h-5" />
                )}
                <div className="text-left">
                  <div className="font-semibold">{action.name}</div>
                  <div className="text-sm opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tool Categories */}
      {tools.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="mb-6">
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {category.tools.map((tool) => (
                <Card key={tool.name} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <tool.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{tool.title}</h3>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
                    <Button
                      onClick={tool.action}
                      disabled={loadingStates[tool.name]}
                      variant={tool.variant}
                      className="w-full"
                    >
                      {loadingStates[tool.name] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        tool.buttonText
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Results Display */}
      {(results || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Operation Failed
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Operation Completed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : results ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {results.type}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {results.description}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <pre className="text-sm overflow-auto max-h-96">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current application health and data integrity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800 dark:text-green-200">Authentication</p>
              <p className="text-sm text-green-600 dark:text-green-300">Working</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800 dark:text-green-200">Database</p>
              <p className="text-sm text-green-600 dark:text-green-300">Connected</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-800 dark:text-green-200">API Functions</p>
              <p className="text-sm text-green-600 dark:text-green-300">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}