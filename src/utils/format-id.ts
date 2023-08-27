/**
 * 将 int 或 string 转换为 RJxxxxxx 的 product_id
 */
export function formatProductID(product_id: number | string, prefix = '') {
  if (typeof product_id === 'string') {
    // 移除 前导英文
    // RJ123456 => 123456
    product_id = product_id.replace(/^[a-zA-Z]+/, '')

    // 转换为 int
    // 012345 => 12345
    product_id = Number.parseInt(product_id)
  }

  if (product_id >= 1000000) {
    // 大于 7 位数，则补全为 8 位
    product_id = (`0${product_id}`).slice(-8)
  }
  else {
    // 否则补全为 6 位
    product_id = (`000000${product_id}`).slice(-6)
  }

  return prefix + product_id
}
