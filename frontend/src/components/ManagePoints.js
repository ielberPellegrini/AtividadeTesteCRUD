import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ManagePoints = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const nomeCompleto = params.get('nome');
    const [attendanceData, setAttendanceData] = useState([]);

    const fetchAttendance = async () => {
        try {
        const response = await axios.get(`/attendance?nomeCompleto=${nomeCompleto}`);
        setAttendanceData(response.data);
        } catch (error) {
        console.error('Erro ao buscar dados de pontos:', error);
        }
    };

    const handleEdit = (id) => {
        // Adicionar a lógica de edição aqui
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Gerenciando Pontos de {nomeCompleto}</h1>
        <button onClick={fetchAttendance} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Carregar Pontos
        </button>
        <div className="mt-4">
            {attendanceData.map((attendance) => (
            <div key={attendance.id} className="border p-4 mb-2">
                <p>{attendance.tipo} - {attendance.data} - {attendance.hora}</p>
                <button onClick={() => handleEdit(attendance.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
                Editar
                </button>
            </div>
            ))}
        </div>
        </div>
    );
    };

export default ManagePoints;
