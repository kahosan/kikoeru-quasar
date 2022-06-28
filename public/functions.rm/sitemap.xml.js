export async function onRequestGet() {
    return await fetch(`https://api.asmr.one/api/sitemap.xml`)
}
