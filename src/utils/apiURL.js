import {baseURL} from "app/package.json";

/**
 * 计算封面 url
 * @param {string|number} workId
 * @param {string|null} type
 * @return {string|string}
 */
export const coverURL = (workId, type = 'main') => {
  // /api/cover/RJ123456.jpg?type=sam
  if (!workId) return '';
  return baseURL + `/api/cover/${workId}.jpg?type=${type}`
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
