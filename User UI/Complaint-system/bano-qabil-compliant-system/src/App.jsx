import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage";
import CreateComplaint from "./components/CreateComplaint";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create-complaint" element={<CreateComplaint />} />
    </Routes>
  );
}

export default App;
