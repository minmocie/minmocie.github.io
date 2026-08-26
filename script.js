const FALLBACK_PROJECTS = [
  {
    key: "texture",
    index: "[01]",
    title: "texture",
    category: "Hair Salon Branding",
    date: "2024",
    credits: [
      { label: "Client", value: "MIDAIJI" },
      { label: "Date", value: "2024" },
      { label: "Art Direction", value: "Kisung Jang" },
      { label: "Design", value: "Eungi Min" }
    ],
    description:
      "We redefined the hair salon as an experiential space where different senses intersect, rather than simply a place for beauty services, and translated this concept into a cohesive brand identity.",
    lightboxDescription:
      "We redefined the hair salon as an experiential space where different senses intersect, rather than simply a place for beauty services, and translated this concept into a cohesive brand identity.",
    lightboxDescriptionKr: "",
    cover: "images/texture-main.svg",
    images: [
      { url: "images/texture-main.svg", layout: "full" },
      { url: "images/texture-detail-1.svg", layout: "half" },
      { url: "images/texture-detail-2.svg", layout: "half" },
      { url: "images/texture-main.svg", layout: "full" }
    ]
  },
  {
    key: "portre",
    index: "[02]",
    title: "Portré",
    category: "Cosmetic Branding",
    date: "2023",
    credits: [
      { label: "Client", value: "Personal Project" },
      { label: "Date", value: "2023" },
      { label: "Art Direction", value: "Eungi Min" },
      { label: "Design", value: "Eungi Min" }
    ],
    description:
      "Inspired by the word “portrait,” Portré was defined as a brand that captures each individual’s unique appearance beyond conventional standards of beauty, and this idea was translated into its visual identity.",
    lightboxDescription:
      "Inspired by the word “portrait,” Portré was defined as a brand that captures each individual’s unique appearance beyond conventional standards of beauty, and this idea was translated into its visual identity.",
    lightboxDescriptionKr: "",
    cover: "images/portre-main.svg",
    images: [
      { url: "images/portre-main.svg", layout: "full" },
      { url: "images/portre-detail-1.svg", layout: "half" },
      { url: "images/portre-detail-2.svg", layout: "half" },
      { url: "images/portre-main.svg", layout: "full" }
    ]
  }
];

let projects = [...FALLBACK_PROJECTS];

const overlay = document.getElementById("projectOverlay");
const closeButton = document.getElementById("overlayClose");
const previousButton = document.getElementById("previousProject");
const nextButton = document.getElementById("nextProject");

const aboutPage = document.getElementById("aboutPage");
const aboutBackdrop = document.getElementById("aboutBackdrop");
const aboutButton = document.getElementById("aboutButton");
const aboutClose = document.getElementById("aboutClose");
const archivePage = document.getElementById("archivePage");
const archiveList = document.getElementById("archiveList");
const archiveButton = document.getElementById("archiveButton");
const archiveCursorPreview = document.getElementById("archiveCursorPreview");
const archiveCursorPreviewImage = document.getElementById("archiveCursorPreviewImage");
const siteName = document.getElementById("siteName");

const seoulClock = document.getElementById("seoulClock");
const clockHour = document.getElementById("clockHour");
const clockMinute = document.getElementById("clockMinute");
const clockSecond = document.getElementById("clockSecond");
const analogHourLine = document.getElementById("analogHourLine");
const analogHourArrow = document.getElementById("analogHourArrow");
const analogMinuteLine = document.getElementById("analogMinuteLine");
const analogMinuteArrow = document.getElementById("analogMinuteArrow");
const mobileAnalogHourLine = document.getElementById("mobileAnalogHourLine");
const mobileAnalogHourArrow = document.getElementById("mobileAnalogHourArrow");
const mobileAnalogMinuteLine = document.getElementById("mobileAnalogMinuteLine");
const mobileAnalogMinuteArrow = document.getElementById("mobileAnalogMinuteArrow");

const seoulTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

function updateSeoulClock() {
  if (!seoulClock) return;

  const time = seoulTimeFormatter.format(new Date());
  const [hourText, minuteText, secondText] = time.split(":");

  if (clockHour) clockHour.textContent = hourText;
  if (clockMinute) clockMinute.textContent = minuteText;
  if (clockSecond) clockSecond.textContent = secondText;

  const hour = Number(hourText) % 12;
  const minute = Number(minuteText);
  const second = Number(secondText);

  // Both hands move continuously with the seconds value included.
  const hourAngle = (hour * 30) + (minute * 0.5) + (second / 120);
  const minuteAngle = (minute * 6) + (second * 0.1);

  function setAnalogHand(
    line,
    arrow,
    angle,
    length,
    tailLength,
    arrowLength = 5.5,
    arrowWidth = 3.4
  ) {
    if (!line || !arrow) return;

    const radians = (angle - 90) * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const tipX = 50 + cos * length;
    const tipY = 50 + sin * length;

    // Extend a short tail through the center in the opposite direction.
    const tailX = 50 - cos * tailLength;
    const tailY = 50 - sin * tailLength;

    const baseX = tipX - cos * arrowLength;
    const baseY = tipY - sin * arrowLength;

    // Stop the shaft exactly at the arrowhead base.
    // This keeps the line from visibly poking through the arrow tip.
    line.setAttribute("x1", tailX.toFixed(3));
    line.setAttribute("y1", tailY.toFixed(3));
    line.setAttribute("x2", baseX.toFixed(3));
    line.setAttribute("y2", baseY.toFixed(3));

    const perpX = -sin * arrowWidth;
    const perpY =  cos * arrowWidth;

    const leftX = baseX + perpX;
    const leftY = baseY + perpY;
    const rightX = baseX - perpX;
    const rightY = baseY - perpY;

    arrow.setAttribute(
      "d",
      `M ${tipX.toFixed(3)} ${tipY.toFixed(3)} ` +
      `L ${leftX.toFixed(3)} ${leftY.toFixed(3)} ` +
      `L ${rightX.toFixed(3)} ${rightY.toFixed(3)} Z`
    );
  }

  setAnalogHand(analogHourLine, analogHourArrow, hourAngle, 25, 5.5);
  setAnalogHand(analogMinuteLine, analogMinuteArrow, minuteAngle, 35, 7);

  setAnalogHand(mobileAnalogHourLine, mobileAnalogHourArrow, hourAngle, 25, 5.5);
  setAnalogHand(mobileAnalogMinuteLine, mobileAnalogMinuteArrow, minuteAngle, 35, 7);
}

updateSeoulClock();
setInterval(updateSeoulClock, 1000);

const projectList = document.querySelector(".project-list");
const aboutFields = {
  en: document.getElementById("aboutEn"),
  kr: document.getElementById("aboutKr"),
  contactLabel: document.getElementById("aboutContactLabel"),
  contactValue: document.getElementById("aboutContactValue"),
  contactNote: document.getElementById("aboutContactNote"),
  experienceLabel: document.getElementById("aboutExperienceLabel"),
  experienceValue: document.getElementById("aboutExperienceValue"),
  experienceNote: document.getElementById("aboutExperienceNote"),
  educationLabel: document.getElementById("aboutEducationLabel"),
  educationValue: document.getElementById("aboutEducationValue"),
  educationNote: document.getElementById("aboutEducationNote")
};


const fields = {
  index: document.getElementById("overlayIndex"),
  title: document.getElementById("overlayTitle"),
  category: document.getElementById("overlayCategory"),
  creditLabels: document.getElementById("creditLabels"),
  creditValues: document.getElementById("creditValues"),
  descriptionEn: document.getElementById("creditDescriptionEn"),
  descriptionKr: document.getElementById("creditDescriptionKr"),
  gallery: document.getElementById("overlayGallery")
};

let currentProjectIndex = 0;
let pageScrollBeforeProject = 0;

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isVideoMedia(url) {
  return /\.(mp4|webm)(?:$|[?#])/i.test(String(url || ""));
}

function mapDatabaseProject(row) {
  const gallery = [...(row.project_images || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      url: image.image_url,
      layout: image.layout || "full",
      type: isVideoMedia(image.image_url) ? "video" : "image"
    }));

  const cover = row.cover_image_url || gallery[0]?.url || "";

  return {
    id: row.id,
    key: row.slug,
    index: row.project_number,
    title: row.title,
    category: row.category || "",
    date: row.year || "",
    credits: [...(row.project_credits || [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((credit) => ({
        label: credit.label || "",
        value: credit.value || ""
      })),
    description: row.description || "",
    lightboxDescription: row.lightbox_description || row.description || "",
    lightboxDescriptionKr: row.lightbox_description_kr || "",
    cover,
    images: gallery
  };
}

function projectYearValue(project) {
  const match = String(project.date || "").match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function archiveProjects() {
  return projects
    .map((project, originalIndex) => ({ project, originalIndex }))
    .sort((a, b) => {
      const yearDifference =
        projectYearValue(b.project) - projectYearValue(a.project);

      if (yearDifference !== 0) return yearDifference;
      return a.originalIndex - b.originalIndex;
    })
    .map(({ project }) => project);
}

function positionArchivePreview(event) {
  if (!archiveCursorPreview) return;

  const gap = 18;
  const previewWidth = archiveCursorPreview.offsetWidth || 240;
  const previewHeight = archiveCursorPreview.offsetHeight || 300;

  let x = event.clientX + gap;
  let y = event.clientY + gap;

  if (x + previewWidth > window.innerWidth - 10) {
    x = event.clientX - previewWidth - gap;
  }

  if (y + previewHeight > window.innerHeight - 10) {
    y = event.clientY - previewHeight - gap;
  }

  x = Math.max(10, x);
  y = Math.max(10, y);

  archiveCursorPreview.style.transform =
    `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

function hideArchivePreview() {
  if (!archiveCursorPreview || !archiveCursorPreviewImage) return;

  archiveCursorPreview.classList.remove("is-visible");
  archiveCursorPreview.setAttribute("aria-hidden", "true");

  window.setTimeout(() => {
    if (!archiveCursorPreview.classList.contains("is-visible")) {
      archiveCursorPreviewImage.removeAttribute("src");
      archiveCursorPreview.style.transform =
        "translate3d(-9999px, -9999px, 0)";
    }
  }, 130);
}

function bindArchivePreviews() {
  if (
    !archiveCursorPreview ||
    !archiveCursorPreviewImage ||
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    return;
  }

  archiveList.querySelectorAll(".archive-row").forEach((row) => {
    row.addEventListener("mouseenter", (event) => {
      const previewUrl = row.dataset.previewUrl;
      if (!previewUrl) return;

      archiveCursorPreviewImage.src = previewUrl;
      archiveCursorPreview.classList.add("is-visible");
      archiveCursorPreview.setAttribute("aria-hidden", "false");
      positionArchivePreview(event);
    });

    row.addEventListener("mousemove", positionArchivePreview);
    row.addEventListener("mouseleave", hideArchivePreview);
  });
}

function archiveCategoryText(category) {
  return String(category || "")
    .replace(/\bBranding\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderArchive() {
  if (!archiveList) return;

  archiveList.innerHTML = archiveProjects().map((project) => `
    <button
      class="archive-row"
      type="button"
      data-open-project="${escapeHTML(project.key)}"
      data-preview-url="${escapeHTML(project.cover || "")}"
      aria-label="Open ${escapeHTML(project.title)} project"
    >
      <span class="archive-title">${escapeHTML(project.title)}</span>
      <span class="archive-category">${escapeHTML(archiveCategoryText(project.category))}</span>
      <span class="archive-year">${escapeHTML(project.date)}</span>
    </button>
  `).join("");

  bindArchivePreviews();
}

const PROJECT_BATCH_SIZE = 5;
let renderedProjectCount = 0;
let projectScrollHandler = null;
let projectScrollTicking = false;
let lastProjectScrollY = 0;

function projectMarkup(project, projectIndex) {
  const isFirstProject = projectIndex === 0;

  return `
    <article class="project project-enter">
      <div class="project-meta">
        <div class="project-id">${escapeHTML(project.index)}</div>
        <div class="project-title">${escapeHTML(project.title)}</div>

        <div class="project-info">
          <div class="project-year">${escapeHTML(project.date)}</div>
          <div class="project-category">${escapeHTML(project.category)}</div>
          <p class="project-description">${escapeHTML(project.description)}</p>
        </div>
      </div>

      <button
        class="project-image-button"
        type="button"
        data-open-project="${escapeHTML(project.key)}"
        aria-label="Open ${escapeHTML(project.title)} project"
      >
        <img
          src="${escapeHTML(project.cover)}"
          alt="${escapeHTML(project.title)} project preview"
          loading="${isFirstProject ? "eager" : "lazy"}"
          decoding="async"
          ${isFirstProject ? 'fetchpriority="high"' : ""}
        />
      </button>
    </article>
  `;
}

function revealNewProjects(elements) {
  window.requestAnimationFrame(() => {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
  });
}

function renderNextProjectBatch() {
  if (!projectList || renderedProjectCount >= projects.length) return;

  const start = renderedProjectCount;
  const end = Math.min(start + PROJECT_BATCH_SIZE, projects.length);
  const batch = projects.slice(start, end);

  projectList.insertAdjacentHTML(
    "beforeend",
    batch
      .map((project, offset) => projectMarkup(project, start + offset))
      .join("")
  );

  renderedProjectCount = end;

  const newProjects = [...projectList.querySelectorAll(".project-enter:not(.is-visible)")];
  revealNewProjects(newProjects);
  bindProjectButtons();

  if (renderedProjectCount >= projects.length && projectScrollHandler) {
    window.removeEventListener("scroll", projectScrollHandler);
    projectScrollHandler = null;
  }
}

function setupProgressiveProjectLoading() {
  if (!projectList || renderedProjectCount >= projects.length) return;

  if (projectScrollHandler) {
    window.removeEventListener("scroll", projectScrollHandler);
  }

  lastProjectScrollY = window.scrollY;

  projectScrollHandler = () => {
    if (projectScrollTicking) return;

    projectScrollTicking = true;

    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastProjectScrollY;
      lastProjectScrollY = currentScrollY;

      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (currentScrollY + window.innerHeight);

      // Important: do not load anything until the visitor actually scrolls down.
      if (
        isScrollingDown &&
        currentScrollY > 20 &&
        distanceFromBottom <= 500 &&
        renderedProjectCount < projects.length
      ) {
        renderNextProjectBatch();
      }

      projectScrollTicking = false;
    });
  };

  window.addEventListener("scroll", projectScrollHandler, { passive: true });
}

function renderProjectList() {
  if (projectScrollHandler) {
    window.removeEventListener("scroll", projectScrollHandler);
    projectScrollHandler = null;
  }

  projectScrollTicking = false;
  renderedProjectCount = 0;
  projectList.innerHTML = "";

  renderArchive();

  // Initial render is always capped at five projects.
  renderNextProjectBatch();
  setupProgressiveProjectLoading();
}


function textWithBreaks(element, value = "") {
  if (!element) return;
  element.innerHTML = escapeHTML(value).replace(/\n/g, "<br />");
}

async function loadAboutFromSupabase() {
  const cfg = window.PORTFOLIO_SUPABASE;
  if (!cfg || !window.supabase) return;

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey);
  const { data, error } = await client
    .from("site_content")
    .select("key, value")
    .like("key", "about_%");

  if (error || !data) {
    console.warn("Using fallback About content.", error);
    return;
  }

  const content = Object.fromEntries(data.map((item) => [item.key, item.value || ""]));

  if ("about_en" in content) aboutFields.en.textContent = content.about_en;
  if ("about_kr" in content) aboutFields.kr.textContent = content.about_kr;

  if ("about_contact_label" in content) aboutFields.contactLabel.textContent = content.about_contact_label;
  if ("about_contact_value" in content) textWithBreaks(aboutFields.contactValue, content.about_contact_value);
  if ("about_contact_note" in content) textWithBreaks(aboutFields.contactNote, content.about_contact_note);

  if ("about_experience_label" in content) aboutFields.experienceLabel.textContent = content.about_experience_label;
  if ("about_experience_value" in content) textWithBreaks(aboutFields.experienceValue, content.about_experience_value);
  if ("about_experience_note" in content) textWithBreaks(aboutFields.experienceNote, content.about_experience_note);

  if ("about_education_label" in content) aboutFields.educationLabel.textContent = content.about_education_label;
  if ("about_education_value" in content) textWithBreaks(aboutFields.educationValue, content.about_education_value);
  if ("about_education_note" in content) textWithBreaks(aboutFields.educationNote, content.about_education_note);
}

async function loadProjectsFromSupabase() {
  const cfg = window.PORTFOLIO_SUPABASE;
  if (!cfg || !window.supabase) {
    renderProjectList();
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.publishableKey);

  const { data, error } = await client
    .from("projects")
    .select("*, project_images(*), project_credits(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    console.warn("Using fallback project data.", error);
    renderProjectList();
    return;
  }

  projects = data.map(mapDatabaseProject);
  renderProjectList();
}

function openArchive() {
  if (aboutPage.classList.contains("is-open")) {
    closeAbout();
  }

  archivePage.classList.add("is-open");
  archivePage.setAttribute("aria-hidden", "false");
  document.body.classList.add("archive-open");
}

function closeArchive() {
  hideArchivePreview();
  archivePage.classList.remove("is-open");
  archivePage.setAttribute("aria-hidden", "true");
  document.body.classList.remove("archive-open");
}

archiveButton.addEventListener("click", () => {
  if (archivePage.classList.contains("is-open")) {
    closeArchive();
  } else {
    openArchive();
  }
});

function openAbout() {
  aboutBackdrop.classList.add("is-open");
  aboutPage.classList.add("is-open");
  aboutPage.setAttribute("aria-hidden", "false");
  document.body.classList.add("about-open");

  window.setTimeout(() => {
    aboutClose.focus();
  }, 480);
}

function closeAbout() {
  aboutBackdrop.classList.remove("is-open");
  document.body.classList.add("about-closing");
  aboutPage.classList.remove("is-open");
  aboutPage.setAttribute("aria-hidden", "true");
  document.body.classList.remove("about-open");
  window.setTimeout(() => {
    document.body.classList.remove("about-closing");
  }, 650);
}

aboutButton.addEventListener("click", () => {
  if (aboutPage.classList.contains("is-open")) {
    closeAbout();
  } else {
    openAbout();
  }
});

aboutClose.addEventListener("click", closeAbout);
aboutBackdrop.addEventListener("click", closeAbout);

aboutBackdrop.addEventListener(
  "wheel",
  (event) => event.preventDefault(),
  { passive: false }
);

aboutBackdrop.addEventListener(
  "touchmove",
  (event) => event.preventDefault(),
  { passive: false }
);

siteName.addEventListener("click", (event) => {
  event.preventDefault();

  const aboutWasOpen = aboutPage.classList.contains("is-open");
  const overlayWasOpen = overlay.classList.contains("is-open");
  const archiveWasOpen = archivePage.classList.contains("is-open");

  if (aboutWasOpen) {
    closeAbout();
  }

  if (overlayWasOpen) {
    closeProject();
  }

  if (archiveWasOpen) {
    closeArchive();
  }

  const delay = aboutWasOpen ? 650 : (overlayWasOpen ? 60 : 0);

  window.setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, delay);
});

function renderProject(index) {
  const project = projects[index];
  if (!project) return;

  currentProjectIndex = index;

  fields.index.textContent = project.index;
  fields.title.textContent = project.title;
  fields.category.textContent = project.category;

  const credits = project.credits?.length
    ? project.credits
    : [{ label: "Date", value: project.date || "" }].filter((item) => item.value);

  fields.creditLabels.innerHTML = credits
    .map((credit) => `<div>${escapeHTML(credit.label)}</div>`)
    .join("");

  fields.creditValues.innerHTML = credits
    .map((credit) => `<div>${escapeHTML(credit.value)}</div>`)
    .join("");

  fields.descriptionEn.textContent =
    project.lightboxDescription || project.description || "";
  fields.descriptionKr.textContent =
    project.lightboxDescriptionKr || "";

  fields.descriptionEn.hidden = !fields.descriptionEn.textContent.trim();
  fields.descriptionKr.hidden = !fields.descriptionKr.textContent.trim();

  const images = project.images?.length
    ? project.images
    : project.cover
      ? [{ url: project.cover, layout: "full", type: "image" }]
      : [];

  fields.gallery.innerHTML = images.map((media, i) => {
    const url = escapeHTML(media.url || "");
    const isVideo = media.type === "video" || isVideoMedia(media.url);

    const mediaMarkup = isVideo
      ? `
        <video
          src="${url}"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          aria-label="${escapeHTML(project.title)} project video ${i + 1}"
        ></video>
      `
      : `
        <img
          src="${url}"
          alt="${escapeHTML(project.title)} project image ${i + 1}"
          loading="${i === 0 ? "eager" : "lazy"}"
          decoding="async"
        />
      `;

    return `
      <figure
        class="overlay-gallery-item"
        data-layout="${escapeHTML(media.layout || "full")}"
        data-media-type="${isVideo ? "video" : "image"}"
      >
        ${mediaMarkup}
      </figure>
    `;
  }).join("");
}

function openProject(key) {
  hideArchivePreview();

  const index = projects.findIndex((project) => project.key === key);
  if (index === -1) return;

  closeAbout();
  pageScrollBeforeProject = window.scrollY;
  renderProject(index);

  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  closeButton.focus({ preventScroll: true });
}

function closeProject() {
  fields.gallery
    .querySelectorAll("video")
    .forEach((video) => video.pause());

  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: pageScrollBeforeProject,
      left: 0,
      behavior: "auto"
    });
  });
}

function bindProjectButtons() {
  document.querySelectorAll("[data-open-project]:not([data-project-bound])").forEach((button) => {
    button.dataset.projectBound = "true";

    button.addEventListener("click", () => {
      const isArchiveRow = button.classList.contains("archive-row");
      const delay = isArchiveRow ? 0 : 220;

      if (!isArchiveRow) {
        button.classList.add("is-opening");
      }

      window.setTimeout(() => {
        openProject(button.dataset.openProject);
        button.classList.remove("is-opening");
      }, delay);
    });
  });
}

closeButton.addEventListener("click", closeProject);

previousButton.addEventListener("click", () => {
  if (!projects.length) return;
  const nextIndex =
    (currentProjectIndex - 1 + projects.length) % projects.length;
  renderProject(nextIndex);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

nextButton.addEventListener("click", () => {
  if (!projects.length) return;
  const nextIndex = (currentProjectIndex + 1) % projects.length;
  renderProject(nextIndex);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (overlay.classList.contains("is-open")) {
    closeProject();
    return;
  }

  if (aboutPage.classList.contains("is-open")) {
    closeAbout();
  }
});


/* Desktop-only velocity-based project fade while fast scrolling */
(() => {
  const desktopQuery = window.matchMedia("(min-width: 768px)");
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let restoreTimer = null;

  function resetScrollFade() {
    document.documentElement.style.setProperty("--scroll-fade-opacity", "1");
    lastY = window.scrollY;
    lastTime = performance.now();
  }

  function handleScrollFade() {
    if (!desktopQuery.matches) {
      resetScrollFade();
      return;
    }

    if (
      document.body.classList.contains("about-open") ||
      document.body.classList.contains("about-closing") ||
      document.body.classList.contains("project-open")
    ) {
      resetScrollFade();
      return;
    }

    const now = performance.now();
    const y = window.scrollY;
    const dt = Math.max(now - lastTime, 16);
    const velocity = Math.abs(y - lastY) / dt;

    // Slow movement stays almost fully opaque.
    // Very fast scrolling bottoms out around 0.6 opacity.
    const fadeAmount = Math.min(0.4, Math.max(0, velocity - 0.6) * 0.07);
    const opacity = (1 - fadeAmount).toFixed(3);

    document.documentElement.style.setProperty("--scroll-fade-opacity", opacity);

    lastY = y;
    lastTime = now;

    window.clearTimeout(restoreTimer);
    restoreTimer = window.setTimeout(() => {
      document.documentElement.style.setProperty("--scroll-fade-opacity", "1");
    }, 110);
  }

  window.addEventListener("scroll", handleScrollFade, { passive: true });
  desktopQuery.addEventListener?.("change", resetScrollFade);
  resetScrollFade();
})();

loadProjectsFromSupabase();
loadAboutFromSupabase();
