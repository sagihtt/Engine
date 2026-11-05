# Engine • Infraestrutura Operacional e Laboratório de Serviços

Ambiente de administração de sistemas, gerenciamento remoto e hospedagem de aplicações operado sob a infraestrutura do domínio \ngine.lat\. O projeto centraliza rotinas de sustentação de infraestrutura Linux, controle de acesso seguro, serviços de persistência e experimentação com contêineres e redes virtuais.

## Estrutura da Infraestrutura

O ambiente em produção na VPS organiza-se nos seguintes componentes:

\\\
+-----------------------------------------------------------------------+
| TOPOLOGIA OPERACIONAL (engine.lat)                                    |
|                                                                       |
| [ Internet ] ---> [ Nginx (Reverse Proxy / SSL) ]                     |
|                         |                                             |
|        +----------------+----------------+                            |
|        |                                 |                            |
|  [ PM2: engine.lat ]           [ PM2: API-engine.lat ]                |
|  (Express, Socket.IO, SSH2)    (RESTful Endpoints)                    |
|        |                                 |                            |
|        +----------------+----------------+                            |
|                         |                                             |
|          [ MySQL 8.0 / Docker Containers / OpenVPN ]                  |
+-----------------------------------------------------------------------+
\\\

## Componentes do Sistema

1. **Camada de Aplicação Web e Monitoramento:** Painel administrativo desenvolvido em Node.js e Express, integrando autenticação em duas etapas (2FA via \otpauth\), sessões seguras e interface para monitoramento de rotinas internas e registro operacional.
2. **Integração com Terminal e SSH Remoto:** Utilização de bibliotecas de terminal seguro (\ssh2\) e comunicação bidirecional em tempo real (\socket.io\) para gerenciamento de instâncias a partir do painel web.
3. **Serviços de Sincronização Autônoma:** Unidades de serviço gerenciadas via \systemd\ (\ngine-autopull.service\ e \ngine-autopush.service\) responsáveis pela integração contínua e espelhamento entre o repositório central e os diretórios operacionais.
4. **Isolamento e Redes:** Configuração de contêineres Docker para isolamento de aplicações laboratoriais e tunelamento seguro via OpenVPN para administração remota.

## Diretórios e Organização do Repositório

* \docs/\: Documentações de projeto e especificações de interfaces de API.
* \prod/\: Definições de esquema de banco de dados (\soil.sql\, modelagem relacional \.mwb\).
* \snapshots/\: Registros de estado e versionamento de configurações de ambiente.

## Referências Operacionais

* **Acesso Web:** [engine.lat](https://engine.lat)
* **Administração:** Chaves criptográficas SSH
