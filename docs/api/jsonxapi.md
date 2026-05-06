# Contrato de Comunicação JSON x API

## 1. Headers obrigatórios
- Content-Type: application/json  
- Accept: application/json  

Exemplo (request):
```http
GET /api/vehicles HTTP/1.1
Host: exemplo.com
Accept: application/json
Authorization: Bearer <token>
```

## 2. Formato padrão de resposta (sucesso)
```json
{
  "data": { },
  "meta": { }
}
```
Exemplo:
```json
{
  "data": {
    "id": 10,
    "manufacturer": "Honda",
    "model": "Civic"
  },
  "meta": { }
}
```

## 3. Formato padrão de erro
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem objetiva",
    "details": [
      { "field": "email", "issue": "invalid_format" }
    ]
  }
}
```

## 4. Status HTTP padronizados
- 200 OK  
- 201 Created  
- 204 No Content  
- 400 Bad Request  
- 401 Unauthorized  
- 403 Forbidden  
- 404 Not Found  
- 409 Conflict  
- 422 Unprocessable Entity  
- 500 Internal Server Error  

## 5. Paginação
```json
{
  "data": [],
  "meta": { "page": 1, "per_page": 20, "total": 100 }
}
```

## 6. Campos e validações
- Tipos e obrigatoriedades definidos no OpenAPI.
- Erros de validação retornam 422.

## 7. Datas e horários
- Formato ISO-8601 UTC (ex.: 2026-05-05T12:00:00Z)

## 8. Autenticação
- Token enviado em `Authorization: Bearer <token>`

Fluxo típico:
1. Usuário faz login em `/auth/login`.
2. A API retorna um token.
3. O cliente salva esse token.
4. Em cada requisição protegida, o cliente envia `Authorization: Bearer <token>`.

Exemplo:
```http
POST /api/vehicles HTTP/1.1
Host: exemplo.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 9. Glossário
- Request: requisição feita pelo cliente para a API.
- Response: resposta retornada pela API.
- Header: metadado enviado na requisição ou resposta.
- Bearer: tipo de autenticação que envia um token no header `Authorization`.
- Token: credencial curta usada para autenticação.
