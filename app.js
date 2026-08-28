const stepLinks = [...document.querySelectorAll('.step-nav a')];
const stepSections = stepLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    stepLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .25, .5] });
  stepSections.forEach((section) => observer.observe(section));
}
