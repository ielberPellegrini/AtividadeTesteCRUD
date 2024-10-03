const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const { Ponto } = require('./src/models');
const moment = require('moment-timezone');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Página inicial
app.get('/', (req, res) => {
    res.render('home');
});

// Rota para exibir o formulário de registro de ponto
app.get('/bater-ponto', (req, res) => {
    res.render('formPonto');
});

// Registro de ponto (Entrada, Intervalo, Saída)
app.post('/ponto', async (req, res) => {
    try {
        const { nomeCompleto, tipo } = req.body;
        const now = moment().tz('America/Bahia');

        if (!['Entrada', 'Intervalo', 'Saida'].includes(tipo)) {
            return res.status(400).send('Tipo de ponto inválido.');
        }

        await Ponto.create({
            nomeCompleto,
            hora: now.format('HH:mm:ss'),
            data: now.toISOString(),
            tipo
        });

        res.redirect('/bater-ponto');
    } catch (error) {
        console.error('Erro ao registrar ponto:', error);
        res.status(500).send('Erro ao registrar ponto');
    }
});

// Listagem de todos os pontos
app.get('/pontos', async (req, res) => {
    try {
        const pontos = await Ponto.findAll();
        const formattedPontos = pontos.map(ponto => ({
            ...ponto.toJSON(),
            data: moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD'),
            hora: moment(ponto.hora, 'HH:mm:ss').format('HH:mm:ss')
        }));
        res.render('listPontos', { pontos: formattedPontos });
    } catch (error) {
        console.error('Erro ao buscar pontos:', error);
        res.status(500).send('Erro ao buscar pontos');
    }
});

// Formulário para editar ponto
app.get('/ponto/:id/edit', async (req, res) => {
    try {
        const ponto = await Ponto.findByPk(req.params.id);
        if (ponto) {
            ponto.data = moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD');
            res.render('editPonto', { ponto });
        } else {
            res.status(404).send('Ponto não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar ponto para edição:', error);
        res.status(500).send('Erro ao buscar ponto para edição');
    }
});

// Atualizar ponto
app.put('/ponto/:id', async (req, res) => {
    try {
        const { nomeCompleto, hora, data, tipo } = req.body;
        const formattedDate = moment.tz(data, 'America/Bahia').toISOString();

        if (!moment(formattedDate).isValid()) {
            throw new Error('Data inválida');
        }
        if (!['Entrada', 'Intervalo', 'Saida'].includes(tipo)) {
            return res.status(400).send('Tipo de ponto inválido.');
        }

        await Ponto.update(
            {
                nomeCompleto,
                hora,
                data: formattedDate,
                tipo
            },
            { where: { id: req.params.id } }
        );
        res.redirect('/pontos');
    } catch (error) {
        console.error('Erro ao atualizar ponto:', error);
        res.status(500).send('Erro ao atualizar ponto');
    }
});

// Excluir ponto
app.delete('/ponto/:id', async (req, res) => {
    try {
        await Ponto.destroy({ where: { id: req.params.id } });
        res.redirect('/pontos');
    } catch (error) {
        console.error('Erro ao excluir ponto:', error);
        res.status(500).send('Erro ao excluir ponto');
    }
});

// Relatório de pontos
app.get('/relatorio-pontos', async (req, res) => {
    try {
        const pontos = await Ponto.findAll();
        
        const doc = new PDFDocument();

        res.setHeader('Content-disposition', 'attachment; filename=relatorio_pontos.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório de Pontos', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text('ID | Nome Completo | Hora | Data | Tipo');
        doc.moveDown();

        pontos.forEach(ponto => {
            doc.text(`${ponto.id} | ${ponto.nomeCompleto} | ${ponto.hora} | ${moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD')} | ${ponto.tipo}`);
        });

        doc.end();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).send('Erro ao gerar relatório');
    }
});

// Histórico de pontos batidos com cálculo de horas trabalhadas
app.get('/historico', async (req, res) => {
    try {
        const { nomeCompleto } = req.query;

        const historicoPontos = await Ponto.findAll({
            where: { nomeCompleto },
            order: [['data', 'ASC'], ['hora', 'ASC']]
        });

        if (historicoPontos.length === 0) {
            return res.render('histPonto', { nomeCompleto, historico: [] });
        }

        let historico = {};

        historicoPontos.forEach(ponto => {
            const chave = `${ponto.nomeCompleto}-${ponto.data}`;
            
            if (!historico[chave]) {
                historico[chave] = {
                    nomeCompleto: ponto.nomeCompleto,
                    data: ponto.data,
                    pontos: [],
                    horasTrabalhadas: 0,
                    minutosTrabalhados: 0,
                    cargaHorariaExcedida: null
                };
            }
            
            historico[chave].pontos.push(ponto);
        });

        for (const chave in historico) {
            const pontos = historico[chave].pontos;

            const entrada = pontos.find(p => p.tipo === 'Entrada');
            const saida = pontos.find(p => p.tipo === 'Saida');
            const intervalos = pontos.filter(p => p.tipo === 'Intervalo');

            if (!entrada || !saida) {
                continue;
            }

            let totalIntervalo = 0;
            for (let i = 0; i < intervalos.length; i += 2) {
                const inicioIntervalo = moment(intervalos[i].hora, 'HH:mm:ss');
                const fimIntervalo = intervalos[i + 1] ? moment(intervalos[i + 1].hora, 'HH:mm:ss') : moment();

                totalIntervalo += fimIntervalo.diff(inicioIntervalo, 'minutes');
            }

            const inicioJornada = moment(entrada.hora, 'HH:mm:ss');
            const fimJornada = moment(saida.hora, 'HH:mm:ss');
            const tempoTrabalhado = fimJornada.diff(inicioJornada, 'minutes') - totalIntervalo;

            const horasTrabalhadas = Math.floor(tempoTrabalhado / 60);
            const minutosTrabalhados = tempoTrabalhado % 60;
            const cargaHorariaExcedida = horasTrabalhadas > 8 ? `${horasTrabalhadas - 8}h excedentes` : null;

            historico[chave].horasTrabalhadas = horasTrabalhadas;
            historico[chave].minutosTrabalhados = minutosTrabalhados;
            historico[chave].cargaHorariaExcedida = cargaHorariaExcedida;
        }

        const historicoArray = Object.values(historico);

        res.render('histPonto', { nomeCompleto, historico: historicoArray });
    } catch (error) {
        console.error('Erro ao exibir o histórico:', error);
        res.status(500).send('Erro ao exibir o histórico');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando na porta http://localhost:${PORT}/`);
});
