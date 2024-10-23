import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Lightbulb, Calculator, BookText, Trophy, LogOut, Leaf } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();

    return (
        <div
            className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out bg-gray-800 shadow-lg ${
                isOpen ? 'w-64' : 'w-16'
            }`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="flex items-center justify-center h-16 mb-2">
                <Leaf size={24} className="text-white mr-2" /> {/* Leaf icon always visible */}
                <h1 className={`text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                    Carbon Compass
                </h1>
            </div>
            <nav className="mt-4">
                <ul>
                    <li>
                        <Link to="/dashboard" className="flex items-center p-2 text-white hover:bg-gray-700">
                            <Home className="mr-2" />
                            {isOpen && 'Dashboard'}
                        </Link>
                    </li>
                    <li>
                        <Link to="/insights" className="flex items-center p-2 text-white hover:bg-gray-700">
                            <Lightbulb className="mr-2" />
                            {isOpen && 'Insights'}
                        </Link>
                    </li>
                    <li>
                        <Link to="/calculator" className="flex items-center p-2 text-white hover:bg-gray-700">
                            <Calculator className="mr-2" />
                            {isOpen && 'Calculator'}
                        </Link>
                    </li>
                    <li>
                        <Link to="/carbonform" className="flex items-center p-2 text-white hover:bg-gray-700">
                            <BookText className="mr-2" />
                            {isOpen && 'Carbon Form'}
                        </Link>
                    </li>
                    <li>
                        <Link to="/leaderboard" className="flex items-center p-2 text-white hover:bg-gray-700">
                            <Trophy className="mr-2" />
                            {isOpen && 'Leaderboard'}
                        </Link>
                    </li>
                    <li className="mt-auto">
                        <button
                            onClick={() => logout()}
                            className="flex items-center p-2 text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <LogOut size={24} />
                            <span className={`ml-2 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                Logout
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
