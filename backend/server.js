const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Testar conexão com o banco
pool.query("SELECT NOW()")
    .then(() => {
        console.log("✅ Banco de dados conectado!");
    })
    .catch((erro) => {
        console.error("❌ Erro ao conectar ao banco:", erro.message);
    });

// Rota principal
app.get("/", (req, res) => {
    res.json({
        mensagem: "API Zyvo funcionando!"
    });
});

// Receber contato
app.post("/api/contatos", async (req, res) => {

    try {

        const { nome, email, telefone, assunto } = req.body;

        // Verificar campos
        if (!nome || !email || !telefone || !assunto) {
            return res.status(400).json({
                erro: "Todos os campos são obrigatórios."
            });
        }

        // Salvar no banco
        const resultado = await pool.query(
            `INSERT INTO contatos
            (nome, email, telefone, assunto)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [nome, email, telefone, assunto]
        );

        console.log("✅ Novo contato salvo:", resultado.rows[0]);

        res.status(201).json({
            mensagem: "Contato enviado com sucesso!",
            contato: resultado.rows[0]
        });

    } catch (erro) {

        console.error("❌ Erro ao salvar contato:", erro);

        res.status(500).json({
            erro: "Erro ao salvar contato."
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
});