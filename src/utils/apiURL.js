import {baseURL} from "app/package.json";

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

  // 优先选择后端返回的 url 地址
  switch (type) {
    case 'main':
      if (metadata.mainCoverUrl) { return metadata.mainCoverUrl }
      else { return baseURL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}.jpg?type=main` }

    case 'sam':
      if (metadata.samCoverUrl) { return metadata.samCoverUrl }
      else { return baseURL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}.jpg?type=sam` }

    case 'thumb':
      if (metadata.thumbnailCoverUrl) { return metadata.thumbnailCoverUrl }
      else { return baseURL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}.jpg?type=240x240` }

    default:
      // /api/cover/RJ123456.jpg?type=sam
      return baseURL + `/api/cover/${metadata.id || metadata.hash.split('/')[0]}.jpg?type=${type}`
  }
};

/**
 * 计算在线播放 url
 * @param {number} hash
 * @param {string} token
 */
export const mediaStreamURL = (hash, token) => {
  return baseURL + `/api/media/stream/${hash}?token=${token}`;
}

/**
 * 计算下载 url
 * @param {number} hash
 * @param {string} token
 */
export const mediaDownloadURL = (hash, token) => {
  return baseURL + `/api/media/download/${hash}?token=${token}`;
}
