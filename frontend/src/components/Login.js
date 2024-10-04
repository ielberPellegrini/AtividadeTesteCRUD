import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica de autenticação
        if (username === 'admin' && password === 'admin123') {
        navigate(`/gerenciando?nome=${username}`);
        } else {
        alert('Credenciais inválidas');
        }
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Login do Gestor</h1>
        <form onSubmit={handleLogin} className="space-y-4">
            <input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border py-2 px-4 rounded w-full"
            />
            <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border py-2 px-4 rounded w-full"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
            Entrar
            </button>
        </form>
        </div>
    );
    };

export default Login;
