## Backend modular (core agnóstico + NestJS)

Este projeto separa o **core** (domínio + casos de uso + contratos) da camada **infra** (NestJS HTTP + DI), para manter o código **agnóstico a framework**.

### Estrutura

- `src/core`: regras de negócio (sem Nest, sem Express)
  - `users`, `categories`, `products`
  - `shared` (erros, id, clock)
- `src/nest`: adapter NestJS (controllers, modules, filtros)
  - `persistence`: repositórios em memória compartilhados (singletons)

### Endpoints

- **Usuários**
  - `GET /users`
  - `GET /users/:id`
  - `POST /users` `{ "name": "...", "email": "..." }`
  - `DELETE /users/:id`
- **Categorias**
  - `GET /categories`
  - `GET /categories/:id`
  - `POST /categories` `{ "name": "..." }`
  - `DELETE /categories/:id`
- **Produtos**
  - `GET /products`
  - `GET /products/:id`
  - `POST /products` `{ "name": "...", "categoryId": "...", "price": { "currency": "BRL", "amount": 123 } }`
  - `DELETE /products/:id`

### Rodando

1) Instale dependências com um Node “com npm/pnpm” (o Node embutido do Cursor pode não vir com package manager no PATH):

```bash
npm install
```

2) Suba em dev:

```bash
npm run start:dev
```

Servidor: `http://localhost:3000`.

