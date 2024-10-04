import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NameSearch() {
    const [nomeCompleto, setNomeCompleto] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nomeCompleto) {
        // Redireciona para a rota de histórico com o nome completo
        navigate(`/historico?nomecompleto=${encodeURIComponent(nomeCompleto)}`);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Buscar Histórico de Pontos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="text"
            placeholder="Nome Completo"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
            <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded"
            >
            Ver Histórico
            </button>
        </form>
        </div>
    );
    }

export default NameSearch;
