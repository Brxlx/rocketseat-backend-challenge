# Desafio Backend Rocketseat
---

### 🚀 Visão Geral do Projeto
Esta aplicação backend é uma solução robusta e escalável com o objetivo de resolver o desafio proposto usando `Node.js`, `Typescript` e as melhores práticas de código e arquitetura.

### 🔑 Recursos Principais

- Versão do Node.js: Utiliza Node.js `v22.12.0` (LTS atual).
- Arquitetura: Implementa princípios de **Arquitetura Limpa**.
- Padrões de Código: Adere aos princípios de design `DRY`, `YAGNI` e `SOLID`.
- Gerenciamento de Pacotes: Desenvolvido com pnpm.
- Mensageria: Sistema de mensageria Kafka(pacote `kafkajs` integrado com o pacote `@nestjs/microservices`).
- Validação: Validação avançada de entrada usando Zod.
- Conteinerização: Docker com Dockerfile e docker-compose.

### 📦 Pré-requisitos

- Node.js `v22.12.0` (LTS no momento da criação)
- pnpm
- Docker
- Docker Compose

### 🛠 Configuração e Instalação
#### 1. Clonar o Repositório
```bash
git clone https://github.com/Brxlx/rocketseat-backend-challenge.git

# Entrar no diretório do projeto de challenges
cd rocketseat-backend-challenge/challenges

# Entrar no diretório do projeto de correções
cd rocketseat-backend-challenge/corrections
```
#### 2. Instalar Dependências
```bash
# Instalar dependências em ambos os diretórios
pnpm install
```
#### 3. Configuração do Kafka
Iniciar Serviços de Infraestrutura(diretório raiz)

```bash
docker-compose up -d
```
**⚠️ Nota Importante: Haverá uma latência normal ao iniciar os serviços do Kafka durante o rebalanceamento do cluster. Este é um comportamento esperado durante a configuração inicial.**

#### 4. Executar a Aplicação
```bash
pnpm start:dev
```

#### 🌐 Acessando a Aplicação

Playground GraphQL: http://localhost:3000/gql

- Explore funções disponíveis
- Acesse documentação abrangente
- Teste interativo de consultas

#### 🐳 Implantação Docker
Um Dockerfile é fornecido na raiz do projeto para implantação conteinerizada:
```bash
docker build -t backend-challenge .
docker run -p 3000:3000 backend-challenge
```

#### 🔒 Segurança e Gerenciamento de Dependências

Os pacotes e bibliotecas do pacote de _corrections_ forma atualizados para versões mais recentes, seguindo as versões do pacote de _challenges_ para manter compatibilidade e segurança.

#### 🔗 Link para avaliação da solução do desafio

Repositório GitHub: [Desafio Backend Rocketseat](https://github.com/Brxlx/rocketseat-backend-challenge)


#### 📝 Práticas de Desenvolvimento

- Implementação de Arquitetura Limpa
- Design modular e extensível
- Validação dos dados de entrada
- Tratamento de erros de resolvers e _use cases_
- Validação de esquema