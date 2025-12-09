const WORDPRESS_API = 'http://staging.the49thstreet.com/wp-json/wp/v2'

export async function getPages() {
  const res = await fetch(`${WORDPRESS_API}/pages`)
  return await res.json()
}

export async function getMedia(mediaId) {
  const res = await fetch(`${WORDPRESS_API}/media/${mediaId}`)
  return await res.json()
}

export async function getPostsByCategory(categoryId) {
  const res = await fetch(`${WORDPRESS_API}/posts?categories=${categoryId}`)
  return await res.json()
}
