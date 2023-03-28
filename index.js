import { getLinkPreview } from 'link-preview-js'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8888

app.use(cors())

async function getPreview(url) {
  // Get the link preview and return it
  return getLinkPreview(url, {
    headers: {
      'user-agent': 'googlebot',
    },
    followRedirects: `manual`,
    handleRedirects: (baseURL, forwardedURL) => {
      // Check if the URL is a valid redirect
      const urlObj = new URL(baseURL)
      const forwardedURLObj = new URL(forwardedURL)
      if (
        forwardedURLObj.hostname === urlObj.hostname ||
        forwardedURLObj.hostname === 'www.' + urlObj.hostname ||
        'www.' + forwardedURLObj.hostname === urlObj.hostname
      ) {
        return true
      } else {
        return false
      }
    },
  })
}

app.get('/', (req, res) => {
  res.send('Send a GET request to /preview with a URL query parameter.')
})

app.get('/preview', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL query parameter is required.' })
  }

  try {
    const ogTags = await getPreview(url)
    res.json(ogTags)
  } catch (error) {
    console.error(`Error fetching OpenGraph tags from ${url}:`, error)
    res.status(500).json({ error: 'Failed to fetch OpenGraph tags.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
