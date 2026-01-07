// frontend/editor-ui/src/features/campaigns/SummaryStrip.jsx
import React, { useMemo } from "react";
import { Card } from "antd";

export default function SummaryStrip({ rows = [] }) {
  const stats = useMemo(() => {
    const count = (s) => rows.filter((r) => r.status === s).length;
    return {
      total: rows.length || 0,
      draft: count("Draft"),
      waiting: count("Waiting_for_approval"),
      ready: count("Ready_to_go"),
      running: count("Running"),
      completed: count("Completed"),
      aborted: count("Aborted"),
    };
  }, [rows]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
      {[
        ["Total", stats.total],
        ["Draft", stats.draft],
        ["Waiting", stats.waiting],
        ["Ready", stats.ready],
        ["Running", stats.running],
        ["Completed", stats.completed],
      ].map(([label, value]) => (
        <Card key={label}>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
