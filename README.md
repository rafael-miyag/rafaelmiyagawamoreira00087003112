# Patrulha dos Pets

Sistema de gerenciamento de Pets e Tutores desenvolvido em React com TypeScript.

## Autor

Rafael Miyagawa Moreira

Desenvolvido para processo seletivo - Engenheiro da Computacao - Senior

O que falta fazer é apresentar no detalhamento do pet o vinculo de tutor e no card do tutor oo numero de pets vinculados.

---

## Sobre o Projeto

O Patrulha dos Pets e uma Single Page Application (SPA) para cadastro, edicao, exclusao e visualizacao de pets e seus tutores. O sistema se conecta a API REST disponivel em https://pet-manager-api.geia.vip.

### Funcionalidades

- Autenticacao - Login com JWT e refresh automatico de token
- Gestao de Pets - CRUD completo com upload de fotos
- Gestao de Tutores - CRUD completo com upload de fotos
- Vinculacao Pet-Tutor - Associar e desassociar pets a tutores
- Busca e Paginacao - Listagem com filtro por nome
- Health Checks - Monitoramento do status da API
- Layout Responsivo - Adaptado para desktop e mobile

---

## Tecnologias

- React 18 - Biblioteca para construcao de interfaces
- TypeScript - Tipagem estatica
- Vite - Build tool e dev server
- Tailwind CSS - Framework CSS utilitario
- React Router DOM - Roteamento SPA
- Axios - Cliente HTTP
- RxJS - Programacao reativa (BehaviorSubject)
- Lucide React - Icones
- Vitest - Testes unitarios

---

## Arquitetura

O projeto segue o padrao Facade com arquitetura em camadas:

```
+-------------------------------------------------------------+
|                    UI Components                             |
|              (Pages, Components, Layouts)                    |
+-------------------------------------------------------------+
|                         Hooks                                |
|           (useAuth, usePets, useTutors, useHealth)          |
+-------------------------------------------------------------+
|                        Facades                               |
|     (AuthFacade, PetFacade, TutorFacade, HealthFacade)      |
+-------------------------------------------------------------+
|                      API Client                              |
|          (Axios + Interceptors + Refresh Token)             |
+-------------------------------------------------------------+
|                      State Manager                           |
|              (RxJS BehaviorSubject)                         |
+-------------------------------------------------------------+
```

### Estrutura de Pastas

```
src/
  components/
    layout/          # Navbar, MainLayout
    routing/         # ProtectedRoute
    ui/              # Button, Card, Input, ImageUpload, etc.
  hooks/             # useAuth, usePets, useTutors, useHealth
  pages/
    pets/            # Listagem e detalhes de pets
    tutors/          # Listagem e detalhes de tutores
  services/
    api/             # ApiClient, endpoints
    facades/         # AuthFacade, PetFacade, TutorFacade, HealthFacade
    state/           # StateManager
  types/             # Interfaces TypeScript
  App.tsx            # Componente principal com rotas
```

---

## API Endpoints

O sistema utiliza a API REST do Pet Manager:

### Autenticacao

| Metodo | Endpoint               | Descricao                      |
|--------|------------------------|--------------------------------|
| POST   | /autenticacao/login    | Login e obtencao de token JWT  |
| PUT    | /autenticacao/refresh  | Refresh do token expirado      |

### Pets

| Metodo | Endpoint             | Descricao                |
|--------|----------------------|--------------------------|
| GET    | /v1/pets             | Listar pets (paginado)   |
| GET    | /v1/pets/{id}        | Obter pet por ID         |
| POST   | /v1/pets             | Criar novo pet           |
| PUT    | /v1/pets/{id}        | Atualizar pet            |
| DELETE | /v1/pets/{id}        | Excluir pet              |
| POST   | /v1/pets/{id}/fotos  | Upload de foto do pet    |

### Tutores

| Metodo | Endpoint                          | Descricao                  |
|--------|-----------------------------------|----------------------------|
| GET    | /v1/tutores                       | Listar tutores (paginado)  |
| GET    | /v1/tutores/{id}                  | Obter tutor por ID         |
| POST   | /v1/tutores                       | Criar novo tutor           |
| PUT    | /v1/tutores/{id}                  | Atualizar tutor            |
| DELETE | /v1/tutores/{id}                  | Excluir tutor              |
| POST   | /v1/tutores/{id}/fotos            | Upload de foto do tutor    |
| POST   | /v1/tutores/{id}/pets/{petId}     | Vincular pet ao tutor      |
| DELETE | /v1/tutores/{id}/pets/{petId}     | Desvincular pet do tutor   |

### Health Checks

| Metodo | Endpoint        | Descricao           |
|--------|-----------------|---------------------|
| GET    | /q/health       | Health check geral  |
| GET    | /q/health/live  | Liveness check      |
| GET    | /q/health/ready | Readiness check     |

---

## Como Executar

### Pre-requisitos

- Node.js 18+
- npm ou yarn

### Instalacao

```bash
# Clonar o repositorio
git clone <repository-url>
cd patrulha-dos-pets

# Instalar dependencias
npm install

# Executar em desenvolvimento
npm run dev

# Build para producao
npm run build

# Executar testes
npm run test
```

### Variaveis de Ambiente

A API esta configurada para: https://pet-manager-api.geia.vip

Para alterar, edite o arquivo src/services/api/ApiClient.ts.

---

## Docker

### Build da Imagem

```bash
docker build -t patrulha-dos-pets .
```

### Executar Container

```bash
docker run -p 80:80 patrulha-dos-pets
```

### Docker Compose

```yaml
version: '3.8'
services:
  patrulha-dos-pets:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
```

---

## Testes

O projeto inclui testes unitarios para:

- Componentes UI (Button, Card, Input, ImageUpload)
- StateManager
- Facades

```bash
# Executar todos os testes
npm run test

# Executar com cobertura
npm run test -- --coverage
```

---

## Responsividade

O layout e totalmente responsivo:

- Desktop: Navbar horizontal, grid de cards 3 colunas
- Tablet: Grid de cards 2 colunas
- Mobile: Menu hamburguer, cards em coluna unica

---

## Autenticacao

### Fluxo de Login

1. Usuario acessa a aplicacao
2. Se nao autenticado - Redireciona para /login
3. Usuario preenche credenciais
4. POST /autenticacao/login com { username, password }
5. API retorna { token, refreshToken }
6. Token armazenado no localStorage
7. Redireciona para /pets

### Refresh Token

- Interceptor do Axios detecta resposta 401
- Automaticamente tenta refresh com o token salvo
- Se falhar, redireciona para login

---

## Requisitos Implementados

### Requisitos Gerais

- Requisitar dados em tempo real (Axios)
- Layout responsivo
- Framework CSS: Tailwind
- Lazy Loading Routes (React.lazy)
- Paginacao (10 por pagina)
- TypeScript
- Boas praticas de organizacao e componentizacao
- Testes unitarios basicos

### Requisitos Especificos

- Listagem de Pets em cards
- Busca por nome
- Detalhamento do Pet com dados do tutor
- Formulario de Cadastro/Edicao de Pet
- Upload de foto do Pet
- Cadastro/Edicao de Tutor
- Vinculacao Pet-Tutor
- Autenticacao com JWT
- Refresh de token

### Requisitos Senior

- Health Checks (liveness/readiness)
- Testes unitarios
- Padrao Facade
- Gerenciamento de estado com BehaviorSubject (RxJS)

---

## Licenca

Este projeto foi desenvolvido para fins de avaliacao tecnica.

---

Patrulha dos Pets - 2026 - Rafael Miyagawa Moreira
