import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader,
  Download,
  Trash2,
  Upload,
  RefreshCw,
  AlertCircle,
  Clock,
  FileText,
  Database,
} from "lucide-react";
import { toast } from "react-toastify";

interface Backup {
  _id?: string;
  id?: string;
  filename: string;
  createdAt: string;
  size?: number;
  data: unknown;
}

const BackupManager = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [forceRefresh, setForceRefresh] = useState(false);
  const fetchBackups = async () => {
    const controller = new AbortController();
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/get-backups", {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Filter out backups older than 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Subtract 1 month from the current date

      const filteredBackups = data.filter((backup: Backup) => {
        const backupDate = new Date(backup.createdAt);
        return backupDate >= oneMonthAgo; // Keep backups created within the last month
      });

      setBackups(filteredBackups);
      setLastRefresh(new Date());
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") return;
        setError(`Failed to fetch backups: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  };
  const deleteOldBackups = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all backups
      const response = await fetch("/api/get-backups");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Identify backups older than 1 month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); // Subtract 1 month from the current date

      const oldBackups = data.filter((backup: Backup) => {
        const backupDate = new Date(backup.createdAt);
        return backupDate < oneMonthAgo; // Backups older than 1 month
      });

      // Delete each old backup
      for (const backup of oldBackups) {
        await fetch(`/api/get-backups?id=${backup._id || backup.id}`, {
          method: "DELETE",
        });
      }

      // Refresh the backups list
      setRefreshKey((prev) => prev + 1);
      toast.success("Old backups deleted successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to delete old backups: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      setError(null);
      const response = await fetch("/api/save-backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: await collectBackupData(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to create backup: ${err.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (isDeleting) return;

    try {
      setIsDeleting(backupId);
      setError(null);
      const response = await fetch(`/api/get-backups?id=${backupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setRefreshKey((prev) => prev + 1); // Refresh the list after deletion
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to delete backup: ${err.message}`);
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const importBackup = async (backupId: string) => {
    if (isImporting) return;

    try {
      setIsImporting(backupId);
      setError(null);
      setIsImporting(backupId);

      // Fetch backup data
      const backupRes = await fetch(`/api/get-backups?download=${backupId}`);
      const backupData = await backupRes.json();

      // Apply backup
      await applyBackupData(backupData);

      // Force refresh of all data
      setForceRefresh((prev) => !prev);
      toast.success("Database restored successfully!");
      // Fetch backup data
      // const backupRes = await fetch(`/api/get-backups?download=${backupId}`);
      // if (!backupRes.ok) throw new Error("Failed to fetch backup");
      // const backupData = await backupRes.json();

      // Restore database
      await applyBackupData(backupData);

      // Refresh UI
      setRefreshKey((prev) => prev + 1);
      // toast.success("Database restored successfully!");
      //
      toast.success("Database restored successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setIsImporting(null);
    }
  };

  const downloadBackup = async (backup: Backup) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/get-backups?download=${backup._id || backup.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Download failed");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch
        ? filenameMatch[1]
        : `backup-${new Date().toISOString()}.json`;

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(
        `Failed to download backup: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Invalid date";
    }
  }, []);

  const getTimeSinceRefresh = useCallback(() => {
    const seconds = Math.floor(
      (new Date().getTime() - lastRefresh.getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }, [lastRefresh]);

  useEffect(() => {
    fetchBackups();
  }, [refreshKey]);

  // Mock functions - implement these based on your needs
  const collectBackupData = async () => ({
    /* Collect your backup data */
  });
  const applyBackupData = async (backupData: any) => {
    // const db = await getDbConnection(); // Define the db object
    // const books = await db.collection("books").find({}).toArray();
    // const users = await db.collection("users").find({}).toArray();
    // const rentals = await db.collection("rentals").find({}).toArray();

    // Transform into the required format
    // const transformedBackupData = {
    //   books,
    //   users,
    //   rentals,
    // };

    try {
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      });

      if (response.ok) {
        console.log("Database restored successfully!");
      } else {
        console.error("Failed to restore database:", await response.json());
      }
      // Refresh all data
      await fetchBackups();
      window.location.reload(); // Force full state refresh
    } catch (err) {
      console.error("Restore failed:", err);
      throw err;
    }
  };
  return (
    <div className=" text-white  p-4">
      <Card className="w-full max-w-4xl mx-auto bg-gray-800 border-b border-gray-800">
        <CardHeader className="border-b border-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5 text-gray-300" />
                <span>Backup Management</span>
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                <Clock className="w-4 h-4 inline mr-1 text-gray-500" />
                Last updated: {getTimeSinceRefresh()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                variant="outline"
                size="icon"
                className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                onClick={createBackup}
                disabled={isCreating || isLoading}
                className="bg-blue-800 text-white hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Backup"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 bg-gray-800 ">
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-900 border-red-800"
            >
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {backups.map((backup) => (
              <div
                key={backup._id || backup.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-800 hover:bg-gray-900 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-white">
                      {backup.filename || "Unnamed Backup"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Created: {formatDate(backup.createdAt)}
                  </p>
                  {backup.size && (
                    <p className="text-sm text-gray-400">
                      Size: {(backup.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadBackup(backup)}
                    variant="outline"
                    size="icon"
                    className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                    title="Download backup"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteBackup(backup._id || backup.id || "")}
                    variant="outline"
                    size="icon"
                    className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                    disabled={isDeleting === (backup._id || backup.id)}
                    title="Delete backup"
                  >
                    {isDeleting === (backup._id || backup.id) ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  {/* <Button
                    onClick={() => importBackup(backup._id || backup.id || "")}
                    variant="outline"
                    size="icon"
                    className="bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
                    disabled={isImporting === (backup._id || backup.id)}
                    title="Import backup"
                  >
                    {isImporting === (backup._id || backup.id) ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button> */}
                </div>
              </div>
            ))}

            {!isLoading && backups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No backups found. Create your first backup!
              </div>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <Loader className="w-6 h-6 animate-spin mx-auto text-gray-500" />
                <p className="mt-2 text-gray-500">Loading backups...</p>
              </div>
            )}
          </div>
        </CardContent>
        <Button
          onClick={deleteOldBackups}
          disabled={isLoading}
          className="bg-red-800 w-30 m-10 text-white hover:bg-red-700"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Backups Older Than 1 Month"
          )}
        </Button>
      </Card>
    </div>
  );
};

export default BackupManager;
