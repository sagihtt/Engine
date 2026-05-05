# Rotas REST - Soil (v1)

Base URL: /api/v1  
Formato: JSON (`Content-Type: application/json`)

## Auth / Usuário

- POST /auth/signup  
  Cria usuário (cadastro).

- POST /auth/verify-email/{token}  
  Valida e-mail.

- POST /auth/resend-verification  
  Reenvia token de verificação.

- GET /auth/pending-approval  
  Retorna status de aprovação.

- POST /auth/login  
  Autenticação.

- POST /auth/forgot-password  
  Solicita reset de senha.

- POST /auth/reset-password/{token}  
  Define nova senha.

- POST /auth/logout  
  Encerra sessão.

- GET /users/me  
  Dados do usuário logado.

- PATCH /users/me  
  Atualiza dados do usuário logado.

- PATCH /users/me/password  
  Atualiza senha.

## Vehicles (público/leitura)

- GET /vehicles  
  Lista veículos (filtros: manufacturer, model, type, year).

- GET /vehicles/{id}  
  Detalha veículo.

- GET /vehicles/search  
  Busca avançada.

## Catalogs (público/leitura)

- GET /catalogs  
  Lista itens de catálogo (filtros: type, specification).

- GET /catalogs/{id}  
  Detalha item.

- GET /catalogs/search  
  Busca avançada.

## Technical Specifications (público/leitura)

- GET /technical-specifications  
  Lista vínculos (filtros: vehicle_id, catalog_id).

- GET /vehicles/{id}/catalogs  
  Catálogo compatível do veículo.

- GET /catalogs/{id}/vehicles  
  Veículos compatíveis do catálogo.

## Products (usuário)

- GET /products  
  Lista produtos (filtros: user_id, catalog_id).

- GET /products/{id}  
  Detalha produto.

- POST /products  
  Cria produto.

- PATCH /products/{id}  
  Atualiza produto.

- DELETE /products/{id}  
  Remove produto.

- GET /users/{id}/products  
  Produtos do usuário.

## Consulta (usuário)

- GET /lookup  
  Consulta veículo + catálogo + disponibilidade (filtros: manufacturer, model, year, type, user_id).

## Aprovação de usuários (admin)
- GET /admin/users/pending  
  Lista usuários pendentes.

- POST /admin/users/{id}/approve  
  Aprova usuário.

- POST /admin/users/{id}/reject  
  Rejeita usuário.

## Vehicles (admin)
- POST /vehicles  
  Cria veículo.

- PATCH /vehicles/{id}  
  Atualiza veículo.

- DELETE /vehicles/{id}  
  Remove veículo.

## Catalogs (admin)
- POST /catalogs  
  Cria item.

- PATCH /catalogs/{id}  
  Atualiza item.

- DELETE /catalogs/{id}  
  Remove item.

## Technical Specifications (admin)
- POST /technical-specifications  
  Cria vínculo.

- DELETE /technical-specifications/{id}  
  Remove vínculo.

### Exemplo de USO (métodos HTTP)

| Método | Uso | Exemplo |
|---|---|---|
| GET | Buscar dados | GET /api/vehicles |
| POST | Criar recurso | POST /api/catalogs |
| PATCH | Atualizar parcialmente | PATCH /api/products/10 |
| DELETE | Remover recurso | DELETE /api/vehicles/5 |
