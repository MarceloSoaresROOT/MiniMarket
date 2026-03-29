import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const host = 'localhost';
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(cookieParser());
app.use(express.static('.'));

let produtos = [];

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).send('Você precisa fazer login primeiro.');
}

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/cadastro');
    } else {
        res.sendFile('login.html', { root: '.' });
    }
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === 'admin') {
        req.session.user = usuario;
        res.cookie('ultimoAcesso', new Date().toLocaleString());
        res.redirect('/cadastro');
    } else {
        res.send('Credenciais inválidas');
    }
});

app.get('/cadastro', ensureAuthenticated, (req, res) => {
        res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Produtos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-light">
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/cadastro">MiniMarket</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link active" href="/cadastro">Cadastro</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/produtos">Produtos</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div class="container mt-5">
                <div class="text-center mb-4">
                    <img src="Imagens/loogo.png" alt="Logo" class="img-fluid" style="max-width: 200px;">
                </div>
                <div class="card shadow-lg border-0">
                    <div class="card-header bg-primary text-white">
                        <h1 class="h4 mb-0">Cadastro de Produtos</h1>
                    </div>
                    <div class="card-body">
                        <form action='/cadastro' method='POST'>
                            <div class="mb-3">
                                <label for="codigo" class="form-label">Código de barras</label>
                                <input type='text' name='codigo' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="descricao" class="form-label">Descrição</label>
                                <input type='text' name='descricao' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="precoCusto" class="form-label">Preço de custo</label>
                                <input type='number' step='0.01' name='precoCusto' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="precoVenda" class="form-label">Preço de venda</label>
                                <input type='number' step='0.01' name='precoVenda' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="dataValidade" class="form-label">Data de validade</label>
                                <input type='date' name='dataValidade' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="qtdEstoque" class="form-label">Qtd em estoque</label>
                                <input type='number' name='qtdEstoque' class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="fabricante" class="form-label">Nome do fabricante</label>
                                <input type='text' name='fabricante' class="form-control" required>
                            </div>
                            <button type='submit' class="btn btn-success">Cadastrar</button>
                        </form>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        `);
});

app.post('/cadastro', ensureAuthenticated, (req, res) => {
    const produto = req.body;
    produtos.push(produto);
    res.redirect('/produtos');
});

app.get('/produtos', ensureAuthenticated, (req, res) => {
        const ultimoAcesso = req.cookies.ultimoAcesso || 'N/A';
        let tabela = '<table class="table table-striped table-bordered"><thead class="table-dark"><tr><th>Código de Barras</th><th>Descrição</th><th>Preço Custo</th><th>Preço Venda</th><th>Data Validade</th><th>Qtd Estoque</th><th>Fabricante</th></tr></thead><tbody>';
        produtos.forEach(p => {
            tabela += `<tr><td>${p.codigo}</td><td>${p.descricao}</td><td>${p.precoCusto}</td><td>${p.precoVenda}</td><td>${p.dataValidade}</td><td>${p.qtdEstoque}</td><td>${p.fabricante}</td></tr>`;
        });
        tabela += '</tbody></table>';
        res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Produtos Cadastrados</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-light">
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/cadastro">MiniMarket</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="/cadastro">Cadastro</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" href="/produtos">Produtos</a>
                            </li>
                        </ul>
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Logout</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div class="container mt-5">
                <div class="text-center mb-4">
                    <img src="Imagens/loogo.png" alt="Logo" class="img-fluid" style="max-width: 200px;">
                </div>
                <div class="card shadow-lg border-0">
                    <div class="card-header bg-primary text-white">
                        <h1 class="h4 mb-0">Produtos Cadastrados</h1>
                    </div>
                    <div class="card-body">
                        <p class="alert alert-info">Último acesso: ${ultimoAcesso}</p>
                        <div class="table-responsive">
                            ${tabela}
                        </div>
                        <div class="mt-3">
                            <a href='/cadastro' class="btn btn-primary">Cadastrar Novo Produto</a>
                        </div>
                    </div>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
        `);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});