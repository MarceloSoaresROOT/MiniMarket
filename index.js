import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const host = '0.0.0.0';
const porta = 3000;

const app = express();

// Configurações de Middlewares
app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 } // 30 min
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Para carregar a imagem da pasta Imagens

var listaProdutos = [];

// Middleware de Autenticação
function estaAutenticado(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.send(`
            <html lang="pt-br">
                <head><meta charset="UTF-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"></head>
                <body class="container mt-5 text-center">
                    <div class="alert alert-danger">Acesso negado. Por favor, faça login primeiro.</div>
                    <a href="/login" class="btn btn-primary">Ir para Login</a>
                </body>
            </html>
        `);
    }
}

// Rota de Login (GET) - Exibe a sua tela personalizada
app.get("/login", (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || "Primeiro acesso no sistema.";
    
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="utf-8">
        <title>Login - MiniMarket</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container min-vh-100 d-flex justify-content-center align-items-center">
            <div class="card shadow-lg w-100" style="max-width: 420px;">
                <div class="card-body text-center">
                    <img src="/Imagens/loogo.png" alt="Logo" class="img-fluid mb-3" style="max-width: 150px;">
                    <h2 class="card-title mb-4">Autenticação</h2>
                    
                    <form action='/login' method='POST'>
                        <div class="mb-3 text-start">
                            <label for="usuario" class="form-label">Usuário:</label>
                            <input type="text" class="form-control" id="usuario" name="usuario" required>
                        </div>
                        <div class="mb-3 text-start">
                            <label for="senha" class="form-label">Senha:</label>
                            <input type="password" class="form-control" id="senha" name="senha" required>
                        </div>
                        <button class="btn btn-primary w-100" type="submit">Entrar</button>
                    </form>
                    
                    <div class="mt-4 border-top pt-3">
                        <small class="text-muted">Último acesso: ${ultimoAcesso}</small>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});

// Rota de Login (POST) - Processa a autenticação
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    // Login: admin / admin
    if (usuario === 'admin' && senha === 'admin') {
        req.session.logado = true;
        req.session.user = usuario;

        // Criando Cookie de último acesso (validade 1 dia)
        res.cookie("ultimoAcesso", new Date().toLocaleString(), { 
            maxAge: 1000 * 60 * 60 * 24, 
            httpOnly: true 
        });

        res.redirect("/");
    } else {
        res.send(`
            <script>
                alert('Usuário ou senha inválidos!');
                window.location.href = '/login';
            </script>
        `);
    }
});

// Rota Principal (Redireciona para cadastro se logado)
app.get('/', estaAutenticado, (req, res) => {
    res.redirect('/cadastrarProduto');
});

// Formulário de Cadastro de Produto
app.get("/cadastrarProduto", estaAutenticado, (req, res) => {
    gerarFormulario(res);
});

// Processar Cadastro
app.post("/cadastrarProduto", estaAutenticado, (req, res) => {
    const dados = req.body;

    if (dados.codigo && dados.descricao && dados.precoCusto && dados.precoVenda && dados.validade && dados.estoque && dados.fabricante) {
        listaProdutos.push(dados);
        res.redirect("/listarProdutos");
    } else {
        gerarFormulario(res, dados); // Validação de campos vazios
    }
});

// Listagem de Produtos (Tabela)
app.get("/listarProdutos", estaAutenticado, (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || "N/A";
    
    let html = `
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Produtos Cadastrados</title>
    </head>
    <body class="bg-light">
        <nav class="navbar navbar-dark bg-primary mb-4">
            <div class="container-fluid"><span class="navbar-brand">MiniMarket - Lista</span>
            <a href="/logout" class="btn btn-outline-light btn-sm">Sair</a></div>
        </nav>
        <div class="container">
            <div class="card shadow">
                <div class="card-header bg-primary text-white"><h5>Produtos Cadastrados</h5></div>
                <div class="card-body">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Cód.</th><th>Descrição</th><th>Custo</th><th>Venda</th><th>Validade</th><th>Qtd</th><th>Fabricante</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
    listaProdutos.forEach(p => {
        html += `<tr>
            <td>${p.codigo}</td><td>${p.descricao}</td><td>${p.precoCusto}</td>
            <td>${p.precoVenda}</td><td>${p.validade}</td><td>${p.estoque}</td><td>${p.fabricante}</td>
        </tr>`;
    });

    html += `           </tbody>
                    </table>
                    <div class="alert alert-info mt-3">Último acesso ao sistema: ${ultimoAcesso}</div>
                    <a href="/cadastrarProduto" class="btn btn-primary">Novo Cadastro</a>
                </div>
            </div>
        </div>
    </body>
    </html>`;
    res.send(html);
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Função para gerar o formulário de cadastro (com suporte a erros)
function gerarFormulario(res, dados = {}) {
    res.send(`
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Cadastro - MiniMarket</title>
    </head>
    <body class="bg-light">
        <div class="container mt-5">
            <div class="card shadow">
                <div class="card-header bg-primary text-white text-center">
                    <img src="/Imagens/loogo.png" style="max-width: 100px; filter: brightness(0) invert(1);">
                    <h3 class="mt-2">Cadastro de Produto</h3>
                </div>
                <div class="card-body">
                    <form method="POST" action="/cadastrarProduto" class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Código de Barras</label>
                            <input type="text" name="codigo" class="form-control" value="${dados.codigo || ''}">
                            ${dados.codigo === '' ? '<span class="text-danger small">Campo obrigatório</span>' : ''}
                        </div>
                        <div class="col-md-8">
                            <label class="form-label">Descrição</label>
                            <input type="text" name="descricao" class="form-control" value="${dados.descricao || ''}">
                            ${dados.descricao === '' ? '<span class="text-danger small">Campo obrigatório</span>' : ''}
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Preço Custo</label>
                            <input type="number" step="0.01" name="precoCusto" class="form-control" value="${dados.precoCusto || ''}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Preço Venda</label>
                            <input type="number" step="0.01" name="precoVenda" class="form-control" value="${dados.precoVenda || ''}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Validade</label>
                            <input type="date" name="validade" class="form-control" value="${dados.validade || ''}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Estoque</label>
                            <input type="number" name="estoque" class="form-control" value="${dados.estoque || ''}">
                        </div>
                        <div class="col-12 text-center mt-4">
                            <button type="submit" class="btn btn-success px-5">Cadastrar</button>
                            <a href="/listarProdutos" class="btn btn-secondary">Ver Lista</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </body>
    </html>`);
}

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});