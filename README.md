# Exemplo de aplicação OAuth2 cliente com Express

## Requisitos

- Node (>=21.6.2)

## Configuração inicial

Crie um arquivo chamado **.env.development.local** na raiz do projeto com as mesmas variáveis de ambiente do arquivo de exemplo **.env.development.local.example** com os valores corretos.

## Como executar a aplicação

`npm run start`

## Rotas

- */*: Raiz da aplicação. Aqui inicia-se o processo de autenticação

Após realizar a autenticação com o provedor OAuth, pode-se consultar a seguinte rota:

- */home*: Apenas para exibir os dados do usuário que foram salvos na sessão. Se não tiver usuário na sessão, essa rota provavelmente vai dá erro (não fiz tratamento ainda).
