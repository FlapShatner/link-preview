import { getLinkPreview } from 'link-preview-js'

getLinkPreview('https://www.github.com', {
  headers: {
    'user-agent': 'googlebot',
  },
  followRedirects: `manual`,
  handleRedirects: (baseURL, forwardedURL) => {
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
}).then((data) => console.debug(data))
