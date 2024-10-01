const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const { PontoEnt, PontoSai } = require('../src/models');
const moment = require('moment-timezone');
const request = require('supertest');

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
            data: now.toISOString()
        });
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao registrar entrada:', error);
        res.status(500).send('Erro ao registrar entrada');
    }
});


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
            data: now.toISOString()
        });
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao registrar saída:', error);
        res.status(500).send('Erro ao registrar saída');
    }
});


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


app.get('/ponto-ent/:id/edit', async (req, res) => {
    try {
        const pontoEnt = await PontoEnt.findByPk(req.params.id);
        if (pontoEnt) {
            pontoEnt.data = moment(pontoEnt.data).tz('America/Bahia').format('YYYY-MM-DD');
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
        const formattedDate = moment.tz(data, 'America/Bahia').toISOString();

        if (!moment(formattedDate).isValid()) {
            throw new Error('Data inválida');
        }
        await PontoEnt.update(
            {
                nomeCompleto,
                horaEnt,
                data: formattedDate
            },
            { where: { id: req.params.id } }
        );
        res.redirect('/pontos-ent');
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
        res.status(500).send('Erro ao atualizar entrada');
    }
});


app.get('/ponto-sai/:id/edit', async (req, res) => {
    try {
        const pontoSai = await PontoSai.findByPk(req.params.id);
        if (pontoSai) {
            pontoSai.data = moment(pontoSai.data).tz('America/Bahia').format('YYYY-MM-DD');
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
        const formattedDate = moment.tz(data, 'America/Bahia').toISOString();

        if (!moment(formattedDate).isValid()) {
            throw new Error('Data inválida');
        }
        await PontoSai.update(
            {
                nomeCompleto,
                horaSai,
                data: formattedDate
            },
            { where: { id: req.params.id } }
        );
        res.redirect('/pontos-sai');
    } catch (error) {
        console.error('Erro ao atualizar saída:', error);
        res.status(500).send('Erro ao atualizar saída');
    }
});


app.delete('/ponto-ent/:id', async (req, res) => {
    try {
        await PontoEnt.destroy({ where: { id: req.params.id } });
        res.redirect('/pontos-ent');
    } catch (error) {
        console.error('Erro ao excluir entrada:', error);
        res.status(500).send('Erro ao excluir entrada');
    }
});

app.delete('/ponto-sai/:id', async (req, res) => {
    try {
        await PontoSai.destroy({ where: { id: req.params.id } });
        res.redirect('/pontos-sai');
    } catch (error) {
        console.error('Erro ao excluir saída:', error);
        res.status(500).send('Erro ao excluir saída');
    }
});

app.get('/relatorio-pontos-ent', async (req, res) => {
    try {
        const pontosEnt = await PontoEnt.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-disposition', 'attachment; filename=relatorio_pontos_ent.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório de Pontos de Entrada', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text('ID | Nome Completo | Hora de Entrada | Data');
        doc.moveDown();

        pontosEnt.forEach(ponto => {
            doc.text(`${ponto.id} | ${ponto.nomeCompleto} | ${ponto.horaEnt} | ${moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD')}`);
        });

        doc.end();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).send('Erro ao gerar relatório');
    }
});

app.get('/relatorio-pontos-sai', async (req, res) => {
    try {
        const pontosEnt = await PontoSai.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-disposition', 'attachment; filename=relatorio_pontos_ent.pdf');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório de Pontos de Entrada', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text('ID | Nome Completo | Hora de Saida | Data');
        doc.moveDown();

        pontosEnt.forEach(ponto => {
            doc.text(`${ponto.id} | ${ponto.nomeCompleto} | ${ponto.horaSai} | ${moment(ponto.data).tz('America/Bahia').format('YYYY-MM-DD')}`);
        });

        doc.end();
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).send('Erro ao gerar relatório');
    }
});



describe('Testes da Aplicação Express', function () {

    it('Deve carregar a página inicial', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200, done);
    });

    it('Deve registrar um ponto de entrada', function (done) {
        request(app)
            .post('/ponto-ent')
            .send({ nomeCompleto: 'teste' })
            .expect('Location', '/')
            .expect(302, done);
    });

    it('Deve registrar um ponto de saida', function (done) {
        request(app)
            .post('/ponto-sai')
            .send({ nomeCompleto: 'teste' })
            .expect('Location', '/')
            .expect(302, done);
    });


});