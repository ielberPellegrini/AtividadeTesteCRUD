import React, { useState } from 'react';
import axios from 'axios';

const PointRegistration = () => {
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [tipo, setTipo] = useState('entrada'); // Pode ser 'entrada', 'intervalo', ou 'saida'

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Obter data e hora atuais automaticamente
        const dataAtual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour12: false }); // Formato HH:MM:SS

        try {
        await axios.post('http://localhost:3000/attendance/register', {
            nomeCompleto,
            tipo,
            data: dataAtual,
            hora: horaAtual,
        });
        alert('Ponto registrado com sucesso!');
        } catch (error) {
        console.error('Erro ao registrar ponto', error);
        alert('Falha ao registrar ponto');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Bater Ponto</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block mb-2">Nome Completo:</label>
            <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
                className="border py-2 px-4"
            />
            </div>

            <div>
            <label className="block mb-2">Tipo de Ponto:</label>
            <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="border py-2 px-4"
            >
                <option value="entrada">Entrada</option>
                <option value="intervalo">Intervalo</option>
                <option value="saida">Saída</option>
            </select>
            </div>

            {/* Data e Hora automáticas não são mais exibidas ao usuário */}
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
            Registrar Ponto
            </button>
        </form>
        </div>
    );
    };

export default PointRegistration;
