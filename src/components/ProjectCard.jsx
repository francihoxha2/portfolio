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
  const isExternal = link?.external

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

      {stack.length > 0 && (
        <div className="tag-list">
          {stack.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>
      )}

      {link && (
        <a
          className={`project-link ${isExternal ? 'external' : ''}`}
          href={link.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
        >
          {link.label}
        </a>
      )}
    </article>
  )
}

export default ProjectCard
