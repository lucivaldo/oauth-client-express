const express = require('express')
const session = require('express-session')

const app = express()
const port = process.env.PORT || 3000

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
  if (!req.session.user) {
    const responseType = 'code'
    const url = `${providerUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`

    res.redirect(url)
  } else {
    const user = JSON.parse(req.session.user)
    res.send(`Olá ${user['username']}`)
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

  req.session.user = JSON.stringify(user)

  res.json({
    accessToken: data['access_token'],
    user,
  })
})

app.get('/home', (req, res) => {
  const user = JSON.parse(req.session.user)
  res.json(user)
})

app.listen(port, () => {
  console.log(`Node version: ${process.version}`)
  console.log(`Listening on port ${port}`)
})
