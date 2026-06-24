function ProjectCard({
  title,
  description,
  link,
  category,
  stack,
  previewImage,
  previewAlt,
  previewPosition,
}) {
  const isExternal = link.startsWith('http')
  const linkLabel = isExternal ? 'Visit live platform' : 'Ask for a demo'

  return (
    <article className="project-card">
      <div className="project-media">
        {previewImage ? (
          <img
            src={previewImage}
            alt={previewAlt || `${title} screenshot`}
            style={previewPosition ? { objectPosition: previewPosition } : undefined}
            loading="lazy"
          />
        ) : (
          <div className="project-placeholder">
            <span className="ph-mark">{title.split('.')[0]}</span>
            <span className="ph-note">// {category.toLowerCase()} · preview</span>
          </div>
        )}
      </div>

      <div className="project-head">
        <span className="project-category">{category}</span>
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <div className="tag-list">
        {stack.map((item) => (
          <span key={item} className="tag">
            {item}
          </span>
        ))}
      </div>

      <a
        className={`project-link ${isExternal ? 'external' : ''}`}
        href={link}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noreferrer' : undefined}
      >
        {linkLabel}
      </a>
    </article>
  )
}

export default ProjectCard
