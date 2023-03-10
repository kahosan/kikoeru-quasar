export const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600) < 10
    ? `0${Math.floor(seconds / 3600)}`
    : Math.floor(seconds / 3600)

  const m = Math.floor((seconds / 60 % 60)) < 10
    ? `0${Math.floor((seconds / 60 % 60))}`
    : Math.floor((seconds / 60 % 60))

  const s = Math.floor((seconds % 60)) < 10
    ? `0${Math.floor((seconds % 60))}`
    : Math.floor((seconds % 60))

  return h === '00'
    ? `${m}:${s}`
    : `${h}:${m}:${s}`
}
