## Backend modular (core agnóstico + NestJS)

Este projeto separa o **core** (domínio + casos de uso + contratos) da camada **infra** (NestJS HTTP + DI), para manter o código **agnóstico a framework**.

### Documentação interativa

Com o servidor rodando, acesse o Swagger UI em:

```
http://localhost:3000/docs
```

### Estrutura

- `src/core`: regras de negócio (sem Nest, sem Express)
  - `users`, `categories`, `products`, `favorites`, `audit-logs`
  - `shared` (erros, id, clock, paginação)
- `src/nest`: adapter NestJS (controllers, modules, filtros)
  - `persistence`: repositórios Prisma (produção) e em memória (testes)

### Paginação

Todos os endpoints de listagem aceitam os query params `page` e `limit`:

```
GET /products?page=2&limit=20
```

| Parâmetro | Tipo    | Padrão | Máximo |
|-----------|---------|--------|--------|
| `page`    | inteiro | `1`    | —      |
| `limit`   | inteiro | `10`   | `100`  |

Resposta paginada:

```json
{
  “data”: [...],
  “total”: 42,
  “page”: 2,
  “limit”: 20,
  “totalPages”: 3
}
```

### Endpoints

**Auth**
- `POST /auth/login` — público
- `POST /auth/register` — requer admin
- `GET /auth/me` — requer autenticação

**Usuários** _(requer admin)_
- `GET /users` — paginado
- `GET /users/:id`
- `POST /users` `{ “name”: “...”, “email”: “...”, “password”: “...” }`
- `PUT /users/:id/avatar` — multipart `avatar`
- `DELETE /users/:id`

**Categorias** _(requer autenticação)_
- `GET /categories` — paginado
- `GET /categories/:id`
- `POST /categories` `{ “name”: “...” }`
- `DELETE /categories/:id`

**Produtos** _(requer autenticação)_
- `GET /products` — paginado
- `GET /products/:id`
- `POST /products` — multipart `{ name, categoryId, priceCurrency, priceAmount, image? }`
- `PUT /products/:id/image` — multipart `image`
- `DELETE /products/:id`

**Favoritos** _(requer autenticação)_
- `GET /me/favorites` — paginado
- `POST /products/:id/favorite`
- `DELETE /products/:id/favorite`

**Logs de Auditoria** _(requer admin)_
- `GET /audit-logs` — paginado

### Rodando

1) Instale dependências:

```bash
npm install
```

2) Suba em dev:

```bash
npm run start:dev
```

Servidor: `http://localhost:3000`.

