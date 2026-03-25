import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PolicyDetail from "./routes/policy-detail";
import "./styles.css";

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId" element={<PolicyDetail />} />
          <Route
            path="*"
            element={
              <div className="text-muted-foreground">
                Policy remote — standalone mode
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<StandaloneApp />);
}
