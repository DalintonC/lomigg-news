function extractMultipleImages(htmlContent, maxImages = 3) {
  if (!htmlContent) return [];
  
  const images = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  
  while ((match = imgRegex.exec(htmlContent)) !== null && images.length < maxImages) {
    const imgUrl = match[1];
    
    if (imgUrl && 
        !imgUrl.includes('icon') && 
        !imgUrl.includes('banner') && 
        !imgUrl.includes('logo') &&
        imgUrl.startsWith('http')) {
      images.push(imgUrl);
    }
  }
  
  return images;
}

module.exports = { extractMultipleImages };