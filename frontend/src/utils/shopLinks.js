/**
 * Generate shopping search URLs for a given outfit string.
 * Links open on Amazon IN, Flipkart, and Meesho.
 */
export function getShopLinks(outfit, gender = 'women') {
  const gTag = gender === 'Male' ? 'men' : 'women';
  const q = encodeURIComponent(`${gTag} ${outfit}`);
  return {
    amazon:  `https://www.amazon.in/s?k=${q}`,
    flipkart:`https://www.flipkart.com/search?q=${q}`,
    meesho:  `https://meesho.com/search?q=${q}`,
  };
}
