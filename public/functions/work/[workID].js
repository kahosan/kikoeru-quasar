// example of workInfo
// {"id":373001,"title":"【クーポンつき】彼女のおうちにお泊まり添い寝。【眠れる耳かき、ささやき、寝息といちゃあまマッサージ】","circle_id":46007,"name":"いちのや","nsfw":false,"release":"2022-02-16","dl_count":954,"price":1056,"review_count":1,"rate_count":237,"rate_average_2dp":4.91,"rate_count_detail":[{"review_point":1,"count":1,"ratio":0},{"review_point":2,"count":0,"ratio":0},{"review_point":3,"count":2,"ratio":0},{"review_point":4,"count":13,"ratio":5},{"review_point":5,"count":221,"ratio":93}],"rank":[{"term":"day","category":"all","rank":1,"rank_date":"2022-02-16"},{"term":"week","category":"all","rank":18,"rank_date":"2022-02-18"},{"term":"day","category":"voice","rank":1,"rank_date":"2022-02-16"},{"term":"week","category":"voice","rank":12,"rank_date":"2022-02-18"},{"term":"month","category":"voice","rank":79,"rank_date":"2022-02-17"}],"has_subtitle":false,"create_date":"2022-02-17","circle":{"id":46007,"name":"いちのや"},"vas":[{"id":"2b5e7ab5-d994-5491-a53c-f1b6ae562d0e","name":"一之瀬りと"}],"tags":[{"id":4,"name":"纯爱/甜蜜"},{"id":8,"name":"日常/生活"},{"id":13,"name":"温馨"},{"id":14,"name":"情侣"},{"id":56,"name":"治愈"},{"id":442,"name":"掏耳"},{"id":497,"name":"ASMR"},{"id":503,"name":"低语"}],"samCoverUrl":"https://api.asmr.one/api/cover/373001.jpg?type=sam","thumbnailCoverUrl":"https://api.asmr.one/api/cover/373001.jpg?type=240x240","mainCoverUrl":"https://api.asmr.one/api/cover/373001.jpg?type=main"}


function returnDefaultResponseWithError(defaultResponse, error) {
  const response = new Response(defaultResponse.body)
  response.headers.set('error', 'true');
  response.headers.set('errors', JSON.stringify(error));
  return response;
}


export async function onRequestGet(context) {
  // Contents of context object
  const {
    params, // if filename includes [id] or [[path]]
    next, // used for middleware or to fetch assets
  } = context;

  // 加载静态网页文件
  const staticResponse = await next();
  if (staticResponse.status !== 200) {
    return returnDefaultResponseWithError(staticResponse, 'staticResponse.status !== 200');
  }

  try {
    // Get the workID from the URL
    const workID = params.workID;
    const workIDWithoutRJ = workID.toLowerCase().replace('rj', '')

    // request work info from api
    const res = await fetch(`https://api.asmr.one/api/workInfo/${workIDWithoutRJ}`);
    if (res.status !== 200) {
      return returnDefaultResponseWithError(staticResponse, {
        msg: 'res.status !== 200',
        detail: res.status,
        url: `https://api.asmr.one/api/workInfo/${workIDWithoutRJ}`
      });
    }
    const workInfo = await res.json();

    // build meta
    const descriptor = `
RJ Code: RJ${workInfo.id}
DLSite Price: ${workInfo.price} JPY
DLSite Sales: ${workInfo.dl_count}
Circle: ${workInfo.circle.name}
Actors: ${workInfo.vas.map(v => v.name).join(', ')}
Release: ${workInfo.release}

Use asmr.one to listen this work online for free!`

    const meta = `
          <meta property="og:site_name" content="ASMR Online">
          <meta property="og:url" content="https://www.asmr.one/work/${workID}">
          <meta property="og:type" content="website">
          <meta property="og:title" content="${workInfo.title}">
          <meta property="og:description" content="${descriptor}">
          <meta property="og:image" content="${workInfo.mainCoverUrl}">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:image:src" content="${workInfo.mainCoverUrl}">
    `

    // render metadata to html
    const staticResponseHTML = await staticResponse.text();
    return new Response(staticResponseHTML.replace('<head>', `<head>${meta}`), staticResponse);
  } catch (e) {

    return returnDefaultResponseWithError(staticResponse, e);
  }

}
