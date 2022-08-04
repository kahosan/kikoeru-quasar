addEventListener("fetch", event => {
  request = event.request;

  // sitemap 从后端生成
  if ((new URL(request.url)).pathname.startsWith("/sitemap")) {
    return event.respondWith((async () => {
      const res = await fetch(`https://api.asmr.one/api${(new URL(request.url)).pathname}`)
      let content = await res.text()
      const response = new Response(
        content
      )
      response.headers.set("content-length", content.length)
      response.headers.set("content-type", "application/xml")
      response.headers.set("x-proceed", "yes")
      return response
    })())
  }

  // 非 bot
  if (!/bot|googlebot|crawler|spider|robot|crawling/i.test(request.headers.get('user-agent'))) {
    return;
  }

  // 忽略静态资源渲染 (.css .js .jpg .png .gif .jpeg .webp)
  if (/\.(css|js|jpg|png|gif|jpeg|webp|woff2|woff|xml|ico|htm|html|txt)$/.test(request.url)) {
    return;
  }

  event.respondWith((async () => {
    const endpoint = PRERENDER_ENDPOINT,
      ua = PRERENDER_UA,
      url = new URL(request.url);

    // url 增加查询参数 rawUA
    // url.searchParams.append('rawUA', request.headers.get('user-agent'));
    // url.searchParams.append('cf-from', 'workers');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent')
      },
      body: JSON.stringify({
        url: url.href,
        userAgent: ua
      })
    })
    return res;
  })())
  // 爬虫使用固定端点进行预渲染

})
