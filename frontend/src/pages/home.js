import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-8">Sistema de Ponto</h1>
        <div className="space-y-4">
            <Link to="/baterponto">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Bater Ponto
            </button>
            </Link>
            <Link to="/historico">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Histórico de Pontos
            </button>
            </Link>
            <Link to="/gerenciar">
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Gerenciar Pontos
            </button>
            </Link>
        </div>
        </div>
    );
    };

export default Home;
