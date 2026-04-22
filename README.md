# Tech Challenge

Um projeto fullstack moderno com arquitetura limpa, separação de responsabilidades e suporte para autenticação JWT. Desenvolvido com tecnologias atuais e melhores práticas de desenvolvimento.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [API Endpoints](#-api-endpoints)
- [Paginação](#paginação)
- [Desenvolvimento](#-desenvolvimento)

## 🛠️ Tecnologias

### Backend

| Tecnologia      | Versão | Propósito                           |
| --------------- | ------ | ----------------------------------- |
| **Node.js**     | 20+    | Runtime JavaScript/TypeScript       |
| **NestJS**      | 10.4   | Framework web robusto e modular     |
| **TypeScript**  | 5.6    | Linguagem tipada                    |
| **Prisma**      | 6.19   | ORM e gerenciador de banco de dados |
| **PostgreSQL**  | 16     | Banco de dados relacional           |
| **JWT**         | 11.0   | Autenticação baseada em token       |
| **Passport.js** | 0.7    | Estratégias de autenticação         |
| **Bcryptjs**    | 3.0    | Hash de senhas                      |
| **Zod**         | 3.24   | Validação de schemas                |

### Frontend

| Tecnologia       | Versão | Propósito                     |
| ---------------- | ------ | ----------------------------- |
| **Next.js**      | 15.3   | Framework React fullstack     |
| **React**        | 19     | Biblioteca de UI              |
| **TypeScript**   | 5.6    | Linguagem tipada              |
| **Tailwind CSS** | 3.4    | Framework CSS utilitário      |
| **UI GOVPE**     | 1.1    | Componentes UI governamentais |

### DevOps

| Tecnologia         | Versão | Propósito                  |
| ------------------ | ------ | -------------------------- |
| **Docker**         | Latest | Containerização            |
| **Docker Compose** | Latest | Orquestração de containers |

## 🏗️ Arquitetura

O projeto segue uma arquitetura de **domínio agnóstica**, separando claramente as responsabilidades:

### Backend - Camadas

```
src/
├── core/              # Lógica de negócio (agnóstica de framework)
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── favorites/
│   ├── audit-logs/
│   └── shared/        # Erros, ID, relógio, resultados
│
└── nest/              # Adapter NestJS (HTTP, DI, controllers)
    ├── app.module.ts
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── products/
    │   ├── categories/
    │   └── favorites/
    ├── persistence/   # Configuração do Prisma
    └── shared/        # Filtros, decoradores, guards
```

### Benefícios

- ✅ **Independência de Framework**: Core não depende de NestJS
- ✅ **Testabilidade**: Lógica pura sem dependências externas
- ✅ **Reusabilidade**: Core pode ser usado em CLI, gRPC, etc.
- ✅ **Manutenibilidade**: Responsabilidades bem definidas

## 📁 Estrutura do Projeto

```
tech-challenge/
├── backend/                    # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   ├── migrations/        # Histórico de migrações
│   │   └── seed.ts            # Dados iniciais
│   ├── src/
│   │   ├── core/              # Lógica de negócio
│   │   └── nest/              # Adapter NestJS
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/                   # App Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   └── lib/
│   │       └── api.ts         # Cliente HTTP
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── docker-compose.yml          # Orquestração dos containers
└── README.md
```

## 🚀 Como Executar

### Opção 1: Com Docker Compose (Recomendado)

A forma mais rápida de executar todo o projeto (backend, frontend e banco de dados).

#### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

#### Passos

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd tech-challenge

# 2. Execute com Docker Compose
docker compose up --build

# 3. Acesse a aplicação
# Frontend:  http://localhost:3001
# API:       http://localhost:3000
# Database:  localhost:6432
```

**Logs úteis:**

```bash
# Ver logs em tempo real
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres
```

**Parar os containers:**

```bash
docker compose down

# Remover volumes (limpar dados)
docker compose down -v
```

### Opção 2: Desenvolvimento Local (sem Docker)

Para desenvolvimento com auto-reload de código.

#### Pré-requisitos

- Node.js 20+ (com npm/pnpm)
- PostgreSQL 16+ rodando localmente
- Git

#### Passos

**Backend:**

```bash
cd backend

# 1. Instale dependências
npm install

# 2. Configure o banco de dados (`.env` já existe)
# Verifique se o PostgreSQL está rodando em localhost:5432

# 3. Execute as migrações
npm run prisma:migrate

# 4. Popular banco com dados iniciais (opcional)
npm run prisma:seed

# 5. Inicie o servidor em modo desenvolvimento
npm run start:dev

# Servidor rodando em http://localhost:3000
```

**Frontend (em outro terminal):**

```bash
cd frontend

# 1. Instale dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev

# Frontend rodando em http://localhost:3001
```

### Opção 3: Build para Produção

```bash
# Backend
cd backend
npm install
npm run build
npm start

# Frontend
cd frontend
npm install
npm run build
npm start
```

## 🔐 Variáveis de Ambiente

### Backend (`.env`)

```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tech_challenge

# Autenticação JWT
JWT_SECRET=sua-chave-secreta-256-bits-aqui

# Admin (criado na primeira execução)
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha-segura-aqui
```

### Frontend

O frontend usa variáveis da build time do Next.js:

```env
# Definido em docker-compose.yml via NEXT_PUBLIC_API_URL
# Ou defina em .env.local para desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📡 API Endpoints

A documentação interativa completa está disponível via Swagger UI em `http://localhost:3000/docs`.

### Paginação

Todos os endpoints de listagem suportam paginação via query params:

```http
GET /products?page=1&limit=10
```

| Parâmetro | Padrão | Máximo | Descrição          |
|-----------|--------|--------|--------------------|
| `page`    | `1`    | —      | Página atual       |
| `limit`   | `10`   | `100`  | Itens por página   |

Resposta:

```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Autenticação

```http
# Login
POST /auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "senha" }

# Resposta:
{ "user": { "id": "...", "name": "...", "email": "...", "role": "admin" }, "accessToken": "jwt-token-aqui" }

# Registrar novo usuário (requer admin)
POST /auth/register
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "João Silva", "email": "joao@example.com", "password": "senha123" }

# Dados do usuário autenticado
GET /auth/me
Authorization: Bearer <token>
```

### Usuários _(requer admin)_

```http
# Listar (paginado)
GET /users?page=1&limit=10
Authorization: Bearer <token>

# Buscar um
GET /users/:id
Authorization: Bearer <token>

# Criar
POST /users
Authorization: Bearer <token>
Content-Type: application/json
{ "name": "João Silva", "email": "joao@example.com", "password": "senha123" }

# Atualizar avatar (multipart/form-data)
PUT /users/:id/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
# campo: avatar (arquivo de imagem)

# Deletar
DELETE /users/:id
Authorization: Bearer <token>
```

### Categorias _(requer autenticação)_

```http
# Listar (paginado)
GET /categories?page=1&limit=10
Authorization: Bearer <token>

# Buscar uma
GET /categories/:id
Authorization: Bearer <token>

# Criar
POST /categories
Authorization: Bearer <token>
Content-Type: application/json
{ "name": "Eletrônicos" }

# Deletar
DELETE /categories/:id
Authorization: Bearer <token>
```

### Produtos _(requer autenticação)_

```http
# Listar (paginado)
GET /products?page=1&limit=10
Authorization: Bearer <token>

# Buscar um
GET /products/:id
Authorization: Bearer <token>

# Criar (multipart/form-data)
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data
# campos: name, categoryId, priceCurrency (BRL|USD|EUR), priceAmount (centavos), image (opcional)

# Atualizar imagem (multipart/form-data)
PUT /products/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
# campo: image (arquivo de imagem)

# Deletar
DELETE /products/:id
Authorization: Bearer <token>
```

### Favoritos _(requer autenticação)_

```http
# Listar favoritos do usuário (paginado)
GET /me/favorites?page=1&limit=10
Authorization: Bearer <token>

# Adicionar produto aos favoritos
POST /products/:id/favorite
Authorization: Bearer <token>

# Remover produto dos favoritos
DELETE /products/:id/favorite
Authorization: Bearer <token>
```

### Logs de Auditoria _(requer admin)_

```http
# Listar (paginado)
GET /audit-logs?page=1&limit=10
Authorization: Bearer <token>
```

## 🛠️ Desenvolvimento

### Scripts Úteis

**Backend:**

```bash
# Desenvolvimento com auto-reload
npm run start:dev

# Build
npm run build

# Testes
npm run test

# Lint
npm run lint

# Format código
npm run format

# Prisma
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Criar migração
npm run prisma:seed        # Popular dados iniciais
npm run prisma:studio      # Abrir Prisma Studio (GUI)
```

**Frontend:**

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start
```

### Fluxo de Desenvolvimento

1. Faça alterações no código
2. Backend: muda automático com `npm run start:dev`
3. Frontend: muda automático com `npm run dev`
4. Abra http://localhost:3001 no navegador

### Swagger UI

Com o backend rodando, acesse a documentação interativa em:

```
http://localhost:3000/docs
```

### Database - Prisma Studio

Visualize e edite dados do banco com GUI:

```bash
cd backend
npm run prisma:studio

# Abre em http://localhost:5555
```

### Migrações do Banco

Após alterar `schema.prisma`:

```bash
cd backend

# Criar nova migração
npm run prisma:migrate

# Resetar banco (limpa dados)
npm run prisma:migrate:reset

# Deploy em produção
npm run prisma:migrate:deploy
```

## 🔍 Troubleshooting

### Erro de conexão com banco de dados

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:**

- Verifique se PostgreSQL está rodando
- Confirme `DATABASE_URL` no `.env`
- Com Docker: certifique-se que `docker compose up` está executando

### Porta já em uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**

```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 <PID>

# Ou use outra porta
npm run start:dev -- --port 3002
```

### Migração falha

```bash
# Reset completo do banco
cd backend
npm run prisma:migrate:reset

# Ou reinicialize com Docker
docker compose down -v
docker compose up --build
```

## 📝 Convenções de Código

- **Backend**: Segue padrão Clean Architecture + DDD
- **Frontend**: Componentes React funcionais com TypeScript
- **Format**: Prettier + ESLint (use `npm run format`)
- **Commit**: Use mensagens descritivas em português

## 📚 Documentação Adicional

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licença

UNLICENSED - Projeto de desafio técnico

---

**Dúvidas?** Abra uma issue no repositório! 🚀
