import React, { useState, useEffect } from 'react';
import { Layers, Search, RefreshCw, Clock, User, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';

export const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemLogs(100);
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Activity Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of user operations, model executions, and data modifications.
          </p>
        </div>

        <Button onClick={loadLogs} icon={RefreshCw} variant="outline" size="sm">
          Refresh Logs
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Spinner size="lg" label="Retrieving audit records..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-sans">
                  <tr>
                    <th className="p-3.5 font-bold">Timestamp</th>
                    <th className="p-3.5 font-bold">Action</th>
                    <th className="p-3.5 font-bold">Entity</th>
                    <th className="p-3.5 font-bold">User</th>
                    <th className="p-3.5 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.created_at}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-sans">{log.entity}</td>
                      <td className="p-3.5 text-slate-800 font-sans font-medium">{log.user_name}</td>
                      <td className="p-3.5 text-slate-500 font-sans">{log.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
