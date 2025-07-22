import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getUserAnalytics, createActiveUser } from "../services/database";
import {
  testDatabaseConnection,
  testDatabaseOperations,
  quickHealthCheck,
} from "../utils/dbTest";

const AuthTest = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState([]);
  const [testResults, setTestResults] = useState({});
  const [dbTestResults, setDbTestResults] = useState(null);
  const [isRunningDbTest, setIsRunningDbTest] = useState(false);

  const addDebugLog = useCallback((message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [...prev, { message, type, timestamp }]);
    console.log(`[AuthTest ${type.toUpperCase()}] ${message}`);
  }, []);

  const runDatabaseTest = useCallback(async () => {
    if (!user) {
      addDebugLog("No user available for database test", "error");
      return;
    }

    try {
      addDebugLog("Testing getUserAnalytics...");
      const analyticsResult = await getUserAnalytics(user.id);

      setTestResults((prev) => ({
        ...prev,
        getUserAnalytics: {
          success: analyticsResult.success,
          hasData: !!analyticsResult.data,
          error: analyticsResult.error || null,
        },
      }));

      if (analyticsResult.success) {
        addDebugLog(
          `getUserAnalytics SUCCESS: ${analyticsResult.data ? "Has data" : "No data"}`,
          "success",
        );
      } else {
        addDebugLog(
          `getUserAnalytics FAILED: ${analyticsResult.error}`,
          "error",
        );
      }

      // Test createActiveUser if no analytics data
      if (!analyticsResult.data) {
        addDebugLog("Testing createActiveUser...");
        const createResult = await createActiveUser(user.id, "Test User");

        setTestResults((prev) => ({
          ...prev,
          createActiveUser: {
            success: createResult.success,
            hasData: !!createResult.data,
            error: createResult.error || null,
          },
        }));

        if (createResult.success) {
          addDebugLog("createActiveUser SUCCESS", "success");
        } else {
          addDebugLog(
            `createActiveUser FAILED: ${createResult.error}`,
            "error",
          );
        }
      }
    } catch (error) {
      addDebugLog(`Database test CRASHED: ${error.message}`, "error");
      setTestResults((prev) => ({
        ...prev,
        crash: error.message,
      }));
    }
  }, [user, addDebugLog]);

  const runFullDatabaseTest = useCallback(async () => {
    setIsRunningDbTest(true);
    addDebugLog("Starting comprehensive database test...", "info");

    try {
      const connectionResults = await testDatabaseConnection();

      let operationsResults = null;
      if (user) {
        operationsResults = await testDatabaseOperations(user.id);
      }

      const fullResults = {
        connection: connectionResults,
        operations: operationsResults,
        timestamp: new Date().toISOString(),
      };

      setDbTestResults(fullResults);

      const connectionPassed = connectionResults.summary.passed;
      const connectionFailed = connectionResults.summary.failed;
      const operationsPassed = operationsResults
        ? operationsResults.operations.filter((op) => op.success).length
        : 0;
      const operationsFailed = operationsResults
        ? operationsResults.operations.filter((op) => !op.success).length
        : 0;

      addDebugLog(
        `Database test completed - Connection: ${connectionPassed}/${connectionPassed + connectionFailed} passed`,
        connectionFailed > 0 ? "warning" : "success",
      );

      if (operationsResults) {
        addDebugLog(
          `Operations: ${operationsPassed}/${operationsPassed + operationsFailed} passed`,
          operationsFailed > 0 ? "warning" : "success",
        );
      }
    } catch (error) {
      addDebugLog(`Database test failed: ${error.message}`, "error");
      setDbTestResults({ error: error.message });
    } finally {
      setIsRunningDbTest(false);
    }
  }, [user, addDebugLog]);

  const runQuickHealthCheck = useCallback(async () => {
    addDebugLog("Running quick health check...", "info");

    try {
      const health = await quickHealthCheck();
      addDebugLog(
        `Health check: ${health.message}`,
        health.healthy ? "success" : "error",
      );
    } catch (error) {
      addDebugLog(`Health check failed: ${error.message}`, "error");
    }
  }, [addDebugLog]);

  useEffect(() => {
    addDebugLog("AuthTest component mounted");
    addDebugLog(`Auth loading state: ${loading}`);
    addDebugLog(`User: ${user ? "Present" : "Null"}`);
    addDebugLog(`UserProfile: ${userProfile ? "Present" : "Null"}`);
  }, [loading, user, userProfile, addDebugLog]);

  useEffect(() => {
    addDebugLog(
      `Auth state changed - Loading: ${loading}, User: ${!!user}, Profile: ${!!userProfile}`,
    );

    if (!loading && user) {
      addDebugLog("User is authenticated, running database tests...");
      runDatabaseTest();
    }
  }, [loading, user, userProfile, runDatabaseTest, addDebugLog]);

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Authentication Debug Test</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Auth Loading</h3>
              <p
                className={`text-lg ${loading ? "text-yellow-600" : "text-green-600"}`}
              >
                {loading ? "Loading..." : "Complete"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">User Status</h3>
              <p
                className={`text-lg ${user ? "text-green-600" : "text-red-600"}`}
              >
                {user ? "Authenticated" : "Not Authenticated"}
              </p>
              {user && (
                <p className="text-sm text-gray-600 mt-1">
                  ID: {user.id.substring(0, 8)}...
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">User Profile</h3>
              <p
                className={`text-lg ${userProfile ? "text-green-600" : "text-red-600"}`}
              >
                {userProfile ? "Loaded" : "Not Loaded"}
              </p>
              {userProfile && (
                <p className="text-sm text-gray-600 mt-1">
                  {userProfile.username}
                </p>
              )}
            </div>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">Auth Database Test Results</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          {dbTestResults && (
            <div className="bg-blue-50 p-4 rounded mb-6">
              <h3 className="font-semibold mb-2">
                Comprehensive Database Test Results
              </h3>
              <div className="space-y-2 text-sm">
                {dbTestResults.connection && (
                  <div>
                    <strong>Connection Tests:</strong>{" "}
                    {dbTestResults.connection.summary.passed}/
                    {dbTestResults.connection.summary.total} passed
                    {dbTestResults.connection.summary.failed > 0 && (
                      <div className="text-red-600 ml-2">
                        Failures:{" "}
                        {dbTestResults.connection.summary.errors.join(", ")}
                      </div>
                    )}
                  </div>
                )}
                {dbTestResults.operations && (
                  <div>
                    <strong>Operations Tests:</strong>{" "}
                    {
                      dbTestResults.operations.operations.filter(
                        (op) => op.success,
                      ).length
                    }
                    /{dbTestResults.operations.operations.length} passed
                    {dbTestResults.operations.errors.length > 0 && (
                      <div className="text-red-600 ml-2">
                        Failures: {dbTestResults.operations.errors.join(", ")}
                      </div>
                    )}
                  </div>
                )}
                {dbTestResults.error && (
                  <div className="text-red-600">
                    <strong>Error:</strong> {dbTestResults.error}
                  </div>
                )}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  View Full Results
                </summary>
                <pre className="text-xs overflow-auto mt-2 bg-white p-2 rounded border max-h-64">
                  {JSON.stringify(dbTestResults, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={!user || !userProfile}
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => navigate("/auth")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Auth
            </button>

            <button
              onClick={runDatabaseTest}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!user}
            >
              Rerun Auth DB Test
            </button>

            <button
              onClick={runFullDatabaseTest}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isRunningDbTest}
            >
              {isRunningDbTest ? "Running..." : "Full DB Test"}
            </button>

            <button
              onClick={runQuickHealthCheck}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Health Check
            </button>

            <button
              onClick={() => {
                setDebugInfo([]);
                setTestResults({});
                setDbTestResults(null);
              }}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500 italic">No logs yet...</p>
            ) : (
              debugInfo.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm font-mono"
                >
                  <span className="text-gray-400 text-xs">{log.timestamp}</span>
                  <span
                    className={`font-semibold uppercase text-xs ${getLogColor(log.type)}`}
                  >
                    [{log.type}]
                  </span>
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
