const express = require('express')
const session = require('express-session')
const morgan = require('morgan')


const app = express()
const port = process.env.PORT || 3000

const logger = morgan('tiny')

app.use(logger)

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'express-session-oauth',
  name: '_oauth_client_session',
}))

const providerUrl = process.env.OAUTH_PROVIDER_URL
const clientId = process.env.OAUTH_CLIENT_ID
const clientSecret = process.env.OAUTH_CLIENT_SECRET
const redirectUri = process.env.OAUTH_REDIRECT_URI

async function fetchUser(accessToken) {
  const url = `${providerUrl}/api/me`

  const response = await fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Erro('Erro ao obter dados do usuário')
  }

  return response.json()
}

app.get('/', (req, res) => {
  let user = null

  if (req.session.user) {
    user = JSON.parse(req.session.user)
  }

  const loginStatusMessage = user
    ? `<p>Usuário: ${JSON.stringify(user)}</p>`
    : `<p>Nenhum usuário logado!</p>`

  const html = `
    <!doctype html>
    <html lang="pt-br">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>OAuth Client Express</title>
      </head>
      <body>
        ${loginStatusMessage}

        <ul>
          <li>
            <a href="/">/</a>
          </li>

          <li>
            <a href="/signin">/signin</a>
          </li>

          <li>
            <a href="/home">/home</a>
          </li>
        </ul>
      </body>
    </html>
  `

  res.send(html)
})

app.get('/signin', (req, res) => {
  if (!req.session.user) {
    const responseType = 'code'
    const url = `${providerUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`

    res.redirect(url)
  } else {
    res.redirect('/home')
  }
})

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code

  const body = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  }

  const url = `${providerUrl}/oauth/token`

  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Erro('Erro ao obter o token de acesso')
  }

  const data = await response.json()

  const user = await fetchUser(data['access_token'])

  // A partir deste momento, cria-se a sessão do usuário atualmente logado
  // com as regras de negócio próprias da aplicação.
  req.session.user = JSON.stringify(user)

  res.redirect('/home')
})

app.post('/signout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
})

app.get('/home', (req, res) => {
  if (!req.session.user) {
    res.redirect('/')
  }

  const user = JSON.parse(req.session.user)

  const html = `
    <!doctype html>
    <html lang="pt-br">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bootstrap demo</title>
      </head>
      <body>
        <h1>Home</h1>

        <ul>
          <li>
            <a href="/">/</a>
          </li>

          <li>
            <a href="/signin">/signin</a>
          </li>

          <li>
            <a href="/home">/home</a>
          </li>

          <li>
            <form method="post" action="/signout">
              <button type="submit">Sair</button>
            </form>
          </li>
        </ul>

        <pre>Usuário: ${JSON.stringify(user)}</pre>
      </body>
    </html>
  `

  res.send(html)
})

app.listen(port, () => {
  console.log(`Node version: ${process.version}`)
  console.log(`Listening on port ${port}`)
})
