export default function HeroStaticFallback() {
  return (
    <div className="hero-fallback" data-testid="hero-static-fallback">
      <div className="hero-fallback__halo hero-fallback__halo--violet" />
      <div className="hero-fallback__halo hero-fallback__halo--cyan" />

      <svg
        className="hero-fallback__network"
        viewBox="0 0 720 620"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M129 184C218 184 202 246 293 246" />
        <path d="M429 206C523 206 504 131 601 131" />
        <path d="M452 331C551 331 534 408 625 408" />
        <path d="M325 408C325 474 260 474 260 532" />
        <circle cx="129" cy="184" r="5" />
        <circle cx="601" cy="131" r="5" />
        <circle cx="625" cy="408" r="5" />
        <circle cx="260" cy="532" r="5" />
      </svg>

      <div className="hero-fallback__code-panel">
        <span className="hero-fallback__panel-dot" />
        <span className="hero-fallback__line hero-fallback__line--violet" />
        <span className="hero-fallback__line" />
        <span className="hero-fallback__line hero-fallback__line--short" />
        <span className="hero-fallback__line hero-fallback__line--cyan" />
        <span className="hero-fallback__line hero-fallback__line--short" />
      </div>

      <div className="hero-fallback__monitor">
        <div className="hero-fallback__monitor-topbar">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-fallback__screen" data-planify-origin-screen>
          <img
            src="/planify-preview.png"
            alt=""
            width="1200"
            height="628"
            decoding="async"
            fetchPriority="high"
            draggable="false"
          />
          <span className="hero-fallback__screen-sheen" />
        </div>
        <span className="hero-fallback__monitor-neck" />
        <span className="hero-fallback__monitor-foot" />
      </div>

      <div className="hero-fallback__system-nodes">
        <span className="hero-fallback__node hero-fallback__node--violet" />
        <span className="hero-fallback__node hero-fallback__node--cyan" />
        <span className="hero-fallback__node" />
        <span className="hero-fallback__node hero-fallback__node--core" />
      </div>

      <div className="hero-fallback__workplane">
        <span className="hero-fallback__workplane-edge" />
      </div>
    </div>
  )
}
