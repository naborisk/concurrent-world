import { sanitizeHtml } from '../../lib/sanitize'

export async function onRequest(context) {
    const { path } = context.params
    const ccid = path

    const { content } = await fetch(`https://hub.concurrent.world/api/v1/address/${ccid}`)
        .then((response) => response.json())
        .then((data) => data)

    const characters = await fetch(
        `https://${content}/api/v1/characters?author=${ccid}&schema=https%3A%2F%2Fraw.githubusercontent.com%2Ftotegamma%2Fconcurrent-schemas%2Fmaster%2Fcharacters%2Fprofile%2F0.0.2.json`
    )
        .then((res) => res.json())
        .then((data) => data)

    const { body } = JSON.parse(characters.content[0].payload)

    const username = sanitizeHtml(body.username)
    const avatar = sanitizeHtml(body.avatar)

    const description = sanitizeHtml(body.description)

    const responseBody = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta property="og:title" content="${username} on Concurrent">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${avatar}">
    <meta property="twitter:card" content="summary">
  </head>
</html>`

    return new Response(responseBody, {
        headers: {
            'Content-Type': 'text/html'
        }
    })
}
