import Header from "./components/Home/Header";
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { Route, Routes, useLocation } from 'react-router-dom';
function App() {
    const location = useLocation();

    // Ẩn header ở /login và /register
    const hideHeader =
        location.pathname === "/login" || location.pathname === "/register";

    return (
        <div>
            {!hideHeader && <Header />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </div>
    );
}

export default App;
