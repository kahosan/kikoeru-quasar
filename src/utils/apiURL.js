/**
 * 计算封面 url
 * @param {Object} metadata
 * @param {string|null} type
 * @return {string|string}
 */
export const coverURL = (metadata, type = 'main') => {
  metadata = metadata || {
    'samCoverUrl': '',
    'thumbnailCoverUrl': '',
    'mainCoverUrl': ''
  }

  // 应对组件初始化时没有提供 workId 的情况
  if (!(metadata.id || metadata.hash.split('/')[0])) { return '' }


  // 优先选择后端返回的 url 地址
  switch (type) {
    case 'main':
      if (metadata.mainCoverUrl) { return metadata.mainCoverUrl }
      else { return process.env.API_URL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}` }

    case 'sam':
      if (metadata.samCoverUrl) { return metadata.samCoverUrl }
      else { return process.env.API_URL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}` }

    case 'thumb':
      if (metadata.thumbnailCoverUrl) { return metadata.thumbnailCoverUrl }
      else { return process.env.API_URL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}` }

    default:
      // /api/cover/RJ123456.jpg?type=sam
      return process.env.API_URL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}` 
  }
};

/**
 * 计算在线播放 url
 * @param {number} hash
 * @param {string} token
 */
export const mediaStreamURL = (hash, token) => {
  return process.env.API_URL + `/api/media/stream/${hash}?token=${token}`;
}

/**
 * 计算下载 url
 * @param {number} hash
 * @param {string} token
 */
export const mediaDownloadURL = (hash, token) => {
  return process.env.API_URL + `/api/media/download/${hash}?token=${token}`;
}
