import { Route, Routes } from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainSignup from "./pages/CaptainSignup";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/captain-login" element={<CaptainLogin />} />
      <Route path="/captain-signup" element={<CaptainSignup />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;
