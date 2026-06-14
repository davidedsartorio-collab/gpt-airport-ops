import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PALETTE as C, MONO } from "../sim/constants";
import { clock } from "../sim/selectors";
import { Panel } from "./Panel";

export function ChartPanel({ history }) {
  return (
    <Panel title="Trend operativo" icon={<TrendingUp size={14} color={C.dim} />} right="throughput vs coda">
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 6, right: 6, bottom: 0, left: -28 }}>
            <XAxis dataKey="t" hide />
            <YAxis tick={{ fill: C.dim2, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8, fontFamily: MONO, fontSize: 11 }} labelStyle={{ color: C.dim }} formatter={(v, n) => [v, n === "thru" ? "pax/h" : "coda"]} labelFormatter={(l) => clock(l)} />
            <Line type="monotone" dataKey="thru" stroke={C.teal} dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="queue" stroke={C.amber} dot={false} strokeWidth={1.5} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
