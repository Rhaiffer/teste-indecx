<p align="center">
  <a href="https://nodejs.org/" target="blank"><img src="https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg" width="200" alt="Node.js Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
<a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
<a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
<!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
[![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Teste-INDECX

Este projeto é um gerenciador de tarefas, onde você pode cadastrar e gerenciar seus tarefas do dia a dia. Ele permite que você mantenha um registro de todas as suas tarefas, tornando mais fácil para você encontrar e organizar-las. Com este projeto.

## Começando

Estas instruções irão te guiar sobre como obter uma cópia do projeto e executá-la na sua máquina local para fins de desenvolvimento e testes.

### Pré-requisitos

O que você precisa para instalar o software e como instalá-lo.

- Docker
- Docker Compose
- Node.js
- MongoDB

## Instalação

Siga os passos abaixo para configurar um ambiente de desenvolvimento:

1. Clone o repositório:

```bash
git clone https://github.com/Rhaiffer/teste-indecx
```

2. No seu VSCod, navegue até o diretório do projeto e abra :




3. Na Raiz do projeto, crie um arquivo .env 




4. Agora, edite os arquivos .env com as variáveis de ambinete do arquivo .env.example. Não esqueça de alterar o "MONGO_URI" pela sua URI do mongoDb.




5.Instale as dependências do projeto:




6.Inicie o projeto
```bash
$ npm run start
```



7.Para iniciar o Docker, abra um novo terminal e execute:

```bash
$ docker build -t teste-indecx .
```

E depois: 

```bash
$ docker-compose up
```

Se você deseja parar o Docker, abra um novo terminal e execute:

```bash
$ docker-compose down
```

Agora, o seu projeto deve estar rodando em localhost:3000 (ou a porta que você definiu no seu arquivo .env).



8. Para rodar os testes basta utilizar o comando:

```bash
$ npm run test
```
## Support

Node is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://nodejs.org/docs/latest/api/).

## Documentação da API

A documentação da API foi gerada utilizando o Swagger. Você pode acessá-la em [http://localhost:3000/docs](http://localhost:3000/docs) ou [https://arcane-dusk-21252-61df4b9d981f.herokuapp.com/docs](https://arcane-dusk-21252-61df4b9d981f.herokuapp.com/docs).

## Experiência com as Tecnologias

A qualidade em engenharia de software está em saber escolher a ferramenta adequada para cada tarefa e em manter-se em constante aprendizado. Com isso em mente, apresento minha experiência com as tecnologias empregadas neste projeto:

* [Node.js](https://nodejs.org/) - Com mais de 2 anos de experiência em Node.js, ainda me considero em fase de aprendizado. Optei pelo Node.js neste projeto devido à sua arquitetura robusta e modular.

* [Jest](https://jestjs.io/) - Tenho usado o Jest para testes em vários projetos. Aprecio sua simplicidade e fácil integração com o Node.js.

* [Docker](https://www.docker.com/) - Tenho experiência prática com Docker em vários projetos, usando-o para a containerização, o que permite uma fácil configuração e implantação do projeto.

* [MongoDB](https://www.mongodb.com/) - Tenho experiência com MongoDB e escolhi-o para este projeto por sua confiabilidade e recursos avançados.

* [Swagger](https://swagger.io/) - Utilizei o Swagger para a documentação automática da API. Ele fornece uma interface de usuário interativa para a API, tornando mais fácil para os usuários explorarem e testarem a API. Você pode acessar a documentação da API em [http://localhost:3000/docs](http://localhost:3000/docs) ou [https://arcane-dusk-21252-61df4b9d981f.herokuapp.com/docs](https://arcane-dusk-21252-61df4b9d981f.herokuapp.com/docs).

## License

Node is [MIT licensed](LICENSE).
