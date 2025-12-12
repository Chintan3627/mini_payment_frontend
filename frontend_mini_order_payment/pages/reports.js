import { useEffect, useState } from "react";
import API from "../lib/api";

export default function Reports() {
  const [data, setData] = useState({});

  useEffect(() => {
    API.get("api/reports/").then((res) => setData(res.data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Reports</h1>

      <p>Total Orders: {data.total_orders}</p>
      <p>Total Revenue: ₹{data.total_revenue}</p>
      <p>Paid Orders: {data.number_of_paid_orders}</p>
      <p>Pending Orders: {data.number_of_pending_orders}</p>
    </div>
  );
}
