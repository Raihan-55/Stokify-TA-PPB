import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPengeluaranByKategori } from "../lib/database";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6699"];

export default function ChartPengeluaran() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const hasil = await getPengeluaranByKategori();

      const arr = Object.keys(hasil).map((kategori) => ({
        name: kategori,
        value: hasil[kategori],
      }));

      setData(arr);
      setIsLoading(false);
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 py-8">
        Loading...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        Belum ada data pengeluaran
      </div>
    );
  }

  return (
    <div className="chart-container w-full" style={{ height: '350px' }}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            //label={({ value }) => `Rp ${value.toLocaleString("id-ID")}`}
            labelLine={false}
            isAnimationActive={true}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              padding: "6px 10px",
            }}
          />
          <Legend verticalAlign="bottom" height={24} iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}