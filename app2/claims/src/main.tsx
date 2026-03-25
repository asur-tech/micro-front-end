import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClaimsDetail from "./routes/claims-detail";
import "./styles.css";

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId/claims" element={<ClaimsDetail />} />
          <Route path="*" element={<div className="text-muted-foreground">Claims remote — standalone mode</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<StandaloneApp />);
}
