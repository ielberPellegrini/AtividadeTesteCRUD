const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const { PontoEnt, PontoSai } = require('./src/models');
const moment = require('moment-timezone');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.engine('handlebars', engine({
    handlebars: require('handlebars'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/ponto-ent', (req, res) => {
    res.render('formPontoEnt');
});

app.post('/ponto-ent', async (req, res) => {
    try {
        const { nomeCompleto } = req.body;
        const now = moment().tz('America/Bahia');
        await PontoEnt.create({
            nomeCompleto,
            horaEnt: now.format('HH:mm:ss'),
            data: now.toISOString() // Usa o formato ISO para garantir precisão
        });
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao registrar entrada:', error);
        res.status(500).send('Erro ao registrar entrada');
    }
});

// Formulário para registrar ponto de saída
app.get('/ponto-sai', (req, res) => {
    res.render('formPontoSai');
});

app.post('/ponto-sai', async (req, res) => {
    try {
        const { nomeCompleto } = req.body;
        const now = moment().tz('America/Bahia');
        await PontoSai.create({
            nomeCompleto,
            horaSai: now.format('HH:mm:ss'),
            data: now.toISOString() // Usa o formato ISO para garantir precisão
        });
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao registrar saída:', error);
        res.status(500).send('Erro ao registrar saída');
    }
});

// Listagem de pontos de entrada
app.get('/pontos-ent', async (req, res) => {
    try {
        const pontosEnt = await PontoEnt.findAll();
        const formattedPontosEnt = pontosEnt.map(ponto => ({
            ...ponto.toJSON(),
            data: moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD'),
            horaEnt: moment(ponto.horaEnt, 'HH:mm:ss').format('HH:mm:ss')
        }));
        res.render('listPontoEnt', { pontosEnt: formattedPontosEnt });
    } catch (error) {
        console.error('Erro ao buscar entradas:', error);
        res.status(500).send('Erro ao buscar entradas');
    }
});

// Listagem de pontos de saída
app.get('/pontos-sai', async (req, res) => {
    try {
        const pontosSai = await PontoSai.findAll();
        const formattedPontosSai = pontosSai.map(ponto => ({
            ...ponto.toJSON(),
            data: moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD'),
            horaSai: moment(ponto.horaSai, 'HH:mm:ss').format('HH:mm:ss')
        }));
        res.render('listPontoSai', { pontosSai: formattedPontosSai });
    } catch (error) {
        console.error('Erro ao buscar saídas:', error);
        res.status(500).send('Erro ao buscar saídas');
    }
});

// Formulário para editar ponto de entrada
app.get('/ponto-ent/:id/edit', async (req, res) => {
    try {
        const pontoEnt = await PontoEnt.findByPk(req.params.id);
        if (pontoEnt) {
            pontoEnt.data = moment(pontoEnt.data).tz('America/Bahia').format('YYYY-MM-DD'); // Ajusta o formato da data
            res.render('editPontoEnt', { pontoEnt });
        } else {
            res.status(404).send('Entrada não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar entrada para edição:', error);
        res.status(500).send('Erro ao buscar entrada para edição');
    }
});

app.put('/ponto-ent/:id', async (req, res) => {
    try {
        const { nomeCompleto, horaEnt, data } = req.body;
        const formattedDate = moment.tz(data, 'America/Bahia').toISOString(); // Usa o formato ISO

        if (!moment(formattedDate).isValid()) {
            throw new Error('Data inválida');
        }
        await PontoEnt.update(
            {
                nomeCompleto,
                horaEnt,
                data: formattedDate // Usa o formato ISO
            },
            { where: { id: req.params.id } }
        );
        res.redirect('/pontos-ent');
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
        res.status(500).send('Erro ao atualizar entrada');
    }
});

// Formulário para editar ponto de saída
app.get('/ponto-sai/:id/edit', async (req, res) => {
    try {
        const pontoSai = await PontoSai.findByPk(req.params.id);
        if (pontoSai) {
            pontoSai.data = moment(pontoSai.data).tz('America/Bahia').format('YYYY-MM-DD'); // Ajusta o formato da data
            res.render('editPontoSai', { pontoSai });
        } else {
            res.status(404).send('Saída não encontrada');
        }
    } catch (error) {
        console.error('Erro ao buscar saída para edição:', error);
        res.status(500).send('Erro ao buscar saída para edição');
    }
});

app.put('/ponto-sai/:id', async (req, res) => {
    try {
        const { nomeCompleto, horaSai, data } = req.body;
        const formattedDate = moment.tz(data, 'America/Bahia').toISOString(); // Usa o formato ISO

        if (!moment(formattedDate).isValid()) {
            throw new Error('Data inválida');
        }
        await PontoSai.update(
            {
                nomeCompleto,
                horaSai,
                data: formattedDate // Usa o formato ISO
            },
            { where: { id: req.params.id } }
        );
        res.redirect('/pontos-sai');
    } catch (error) {
        console.error('Erro ao atualizar saída:', error);
        res.status(500).send('Erro ao atualizar saída');
    }
});

// Excluir ponto de entrada
app.delete('/ponto-ent/:id', async (req, res) => {
    try {
        await PontoEnt.destroy({ where: { id: req.params.id } });
        res.redirect('/pontos-ent');
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        res.status(500).send('Erro ao excluir entrada');
    }
});

// Excluir ponto de saída
app.delete('/ponto-sai/:id', async (req, res) => {
    try {
        await PontoSai.destroy({ where: { id: req.params.id } });
        res.redirect('/pontos-sai');
    } catch (error) {
        console.error('Erro ao excluir saída:', error);
        res.status(500).send('Erro ao excluir saída');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta http://localhost:${PORT}/`);
});
