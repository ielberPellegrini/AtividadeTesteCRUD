import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

function PointHistory() {
    const [historico, setHistorico] = useState([]);
    const [searchParams] = useSearchParams();
    const nomeCompleto = searchParams.get('nomecompleto');

    useEffect(() => {
        const fetchHistory = async () => {
        if (nomeCompleto) {
            try {
            const response = await axios.get(
                `http://localhost:3000/attendance/history?nomecompleto=${nomeCompleto}`
            );
            setHistorico(response.data);
            } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            }
        }
        };

        fetchHistory();
    }, [nomeCompleto]);

    return (
        <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Histórico de Pontos</h1>
        <h2 className="text-xl font-semibold">Nome: {nomeCompleto}</h2>
        {historico.map((dia, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold">{dia.data}</h2>
            <p>Total de horas trabalhadas: {dia.totalHoras}</p>
            </div>
        ))}
        </div>
    );
    }

export default PointHistory;
