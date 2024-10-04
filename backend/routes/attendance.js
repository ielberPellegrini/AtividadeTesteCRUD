const express = require('express');
const router = express.Router();
const db = require('../models');

// Rota para registrar ponto
router.post('/register', async (req, res) => {
    const { nomeCompleto, tipo, data } = req.body;

  // Define a hora atual se ela não for fornecida
    const hora = req.body.hora || new Date().toTimeString().split(' ')[0];

    try {
        const newAttendance = await db.Attendance.create({
            nomeCompleto,
            tipo,
            data,
            hora,
        });
        res.json(newAttendance);
    } catch (error) {
        console.error("Erro ao registrar ponto:", error.message); // Para debug
        res.status(500).json({ error: error.message });
    }
});

    // Rota para buscar o histórico de uma pessoa específica
    router.get('/history', async (req, res) => {
    const { nomecompleto } = req.query;

    try {
        if (!nomecompleto) {
        return res.status(400).json({ error: 'Nome completo é necessário' });
        }

        const historico = await db.Attendance.findAll({
        where: { nomeCompleto: nomecompleto },
        attributes: ['nomeCompleto', 'data'],
        group: ['data', 'nomeCompleto'],
        });

        const historicoComHoras = historico.map(async (registro) => {
        const pontos = await db.Attendance.findAll({
            where: { data: registro.data, nomeCompleto: registro.nomeCompleto },
            order: [['hora', 'ASC']],
        });

        // Cálculo das horas trabalhadas
        let totalHoras = 0;
        for (let i = 0; i < pontos.length; i += 2) {
            const entrada = pontos[i];
            const saida = pontos[i + 1];
            if (saida) {
            const horasTrabalhadas =
                (new Date(`1970-01-01T${saida.hora}`) - new Date(`1970-01-01T${entrada.hora}`)) /
                (1000 * 60 * 60);
            totalHoras += horasTrabalhadas;
            }
        }

        return { ...registro, totalHoras };
        });

        res.json(await Promise.all(historicoComHoras));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    });

    module.exports = router;
