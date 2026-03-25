import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PayrollDetail from "./routes/payroll-detail";
import "./styles.css";

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId/payroll" element={<PayrollDetail />} />
          <Route path="*" element={<div className="text-muted-foreground">Payroll remote — standalone mode</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<StandaloneApp />);
}
