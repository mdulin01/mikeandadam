export default function BuildInfo() {
  const hash = typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev'
  const time = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : null
  const display = time
    ? new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : ''

  return (
    <div className="text-slate-500 text-[10px] mt-1 tracking-wide leading-relaxed">
      <span>{hash}{display ? ` · ${display}` : ''}</span>
      <br />
      <span className="text-slate-600">Made by Mike Dulin, MD</span>
    </div>
  )
}
