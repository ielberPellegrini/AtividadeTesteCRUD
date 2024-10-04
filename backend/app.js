const express = require('express');
const db = require('./models'); // Importando o db
const attendanceRoutes = require('./routes/attendance');

const app = express();

// Middleware para usar JSON
app.use(express.json());

// Sincroniza as tabelas no banco de dados
db.sequelize.sync()
    .then(() => {
        console.log('Tabelas sincronizadas com sucesso.');
    })
    .catch((error) => {
        console.error('Erro ao sincronizar tabelas:', error);
    });

// Importa e usa as rotas
app.use('/attendance', attendanceRoutes);

// Configura o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
