import { getLinkPreview } from 'link-preview-js'
import { Cache } from './cache.js'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8888
const cache = new Cache()
app.use(cors())
app.use(express.json())

async function getPreview(url) {
  // Get the link preview and return it
  return getLinkPreview(url, {
    headers: {
      'user-agent': 'googlebot',
    },
    timeout: 3000,
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
  res.send('Send a GET request to /preview with a URL query parameter, dude.')
})

app.post('/preview', async (req, res) => {
  const urls = req.body

  const fetchData = async (url) => {
    const cached = cache.get(url)
    if (cached) {
      return cached
    }
    try {
      const data = await getPreview(url)
      cache.set(url, data, 1000 * 60 * 60)
      return data
    } catch (error) {
      console.error(`Error fetching OpenGraph tags for ${url}:`, error)
      // Return a default object with an error message
      return {
        id: null,
        url: null,
        title: 'Error fetching preview',
        description: `Could not fetch preview for ${url}`,
        error: true,
      }
    }
  }

  try {
    const ogTags = await Promise.all(
      urls.map(async (url) => {
        return {
          id: url.id,
          url: await fetchData(url.url),
        }
      })
    )
    res.json(ogTags)
  } catch (error) {
    console.error(`Error fetching OpenGraph tags:`, error)
    res.status(500).json({ error: 'Failed to fetch OpenGraph tags.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
