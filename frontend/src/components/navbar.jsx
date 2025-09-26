import { Link } from "react-router-dom";
import logo from './images/logo.png';


export default function Navbar() {
    return (
        <div className="flex justify-around items-center shadow-lg py-3 bg-white relative z-10 border-b border-gray-100">

            <div className="flex items-center">

                <img src={logo} alt="" className="h-17 " />

                <div>
                    <p className="font-bold text-2xl text-[#0a5614]">CodeVeda</p>
                    <p className="text-sm text-[#e6ce78]">Traditional • Modern • Unified</p>
                </div>
            </div>

            <div className="flex gap-10 text-[#0a5614] *:cursor-pointer">
                <Link to="/">Home</Link>
                <Link to="/mapping">Find Codes</Link>
                <Link to="/ehr">EHR</Link>
                <span>About Us</span>
                <span>Contact</span>
            </div>

            <div className="flex gap-4 items-center">
                <i className="fa-sharp fa-solid fa-moon text-[#0a5614] cursor-pointer"></i>

                <span className="text-white bg-black px-6 py-3 rounded-full bg-gradient-to-r from-[#0a5614] to-[#0157a9] cursor-pointer">Sign In</span>
            </div>
        </div>
    )
}