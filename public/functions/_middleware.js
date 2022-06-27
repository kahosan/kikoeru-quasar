const serverSideRenderForGoogleBot = async ({request, env, next}) => {
  // 不是爬虫就不用处理了
  if (!/bot|googlebot|crawler|spider|robot|crawling/i.test(request.headers.get('user-agent'))) {
    return next();
  }

  // 忽略静态资源渲染 (.css .js .jpg .png .gif .jpeg .webp)
  if (/\.(css|js|jpg|png|gif|jpeg|webp|woff2|woff)$/.test(request.url)) {
    return next();
  }

  // 爬虫使用固定端点进行预渲染
  const endpoint = env.PRERENDER_ENDPOINT,
    ua = env.PRERENDER_UA;

  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: request.url,
      userAgent: ua
    })
  });
}

export const onRequestGet = serverSideRenderForGoogleBot;
