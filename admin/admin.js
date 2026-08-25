const cfg = window.PORTFOLIO_SUPABASE;
const db = window.supabase.createClient(cfg.url, cfg.publishableKey);

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const signOutButton = document.getElementById("signOutButton");

const projectMenu = document.getElementById("projectMenu");
const newProjectButton = document.getElementById("newProjectButton");
const projectForm = document.getElementById("projectForm");
const aboutForm = document.getElementById("aboutForm");
const aboutEditorButton = document.getElementById("aboutEditorButton");
const emptyEditor = document.getElementById("emptyEditor");
const deleteProjectButton = document.getElementById("deleteProjectButton");
const saveMessage = document.getElementById("saveMessage");

const fields = {
  id: document.getElementById("projectId"),
  title: document.getElementById("title"),
  year: document.getElementById("year"),
  category: document.getElementById("category"),
  description: document.getElementById("description"),
  lightboxDescription: document.getElementById("lightboxDescription"),
  lightboxDescriptionKr: document.getElementById("lightboxDescriptionKr"),
  isPublished: document.getElementById("isPublished"),
  coverFile: document.getElementById("coverFile")
};

const aboutFieldsAdmin = {
  en: document.getElementById("aboutEnInput"),
  kr: document.getElementById("aboutKrInput"),
  contactLabel: document.getElementById("aboutContactLabelInput"),
  contactValue: document.getElementById("aboutContactValueInput"),
  contactNote: document.getElementById("aboutContactNoteInput"),
  experienceLabel: document.getElementById("aboutExperienceLabelInput"),
  experienceValue: document.getElementById("aboutExperienceValueInput"),
  experienceNote: document.getElementById("aboutExperienceNoteInput"),
  educationLabel: document.getElementById("aboutEducationLabelInput"),
  educationValue: document.getElementById("aboutEducationValueInput"),
  educationNote: document.getElementById("aboutEducationNoteInput")
};
const aboutSaveMessage = document.getElementById("aboutSaveMessage");
const visibilityStatus = document.getElementById("visibilityStatus");
const projectNumberFormat = document.getElementById("projectNumberFormat");
const saveNumberFormatButton = document.getElementById("saveNumberFormatButton");
const numberFormatMessage = document.getElementById("numberFormatMessage");

const coverPreview = document.getElementById("coverPreview");
const galleryEditor = document.getElementById("galleryEditor");
const galleryFiles = document.getElementById("galleryFiles");
const creditEditor = document.getElementById("creditEditor");
const addCreditButton = document.getElementById("addCreditButton");

let projects = [];
let selectedProject = null;
let draggedProjectIndex = null;
let numberFormat = "bracket_padded";
let currentCoverUrl = "";
let coverPreviewObjectUrl = "";
let galleryItems = [];
let draggedGalleryIndex = null;
let creditItems = [];

function localPreviewUrl(url) {
  if (!url) return "";
  if (url.startsWith("images/")) return `../${url}`;
  return url;
}

function setMessage(element, text, isError = false) {
  element.textContent = text;
  element.style.color = isError ? "#c00" : "#777";
}

async function isCurrentUserAdmin() {
  const { data, error } = await db.from("admin_users").select("user_id").limit(1);
  return !error && data && data.length > 0;
}

async function showCorrectView() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    loginView.classList.remove("is-hidden");
    adminView.classList.add("is-hidden");
    signOutButton.classList.add("is-hidden");
    return;
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    loginView.classList.remove("is-hidden");
    adminView.classList.add("is-hidden");
    signOutButton.classList.remove("is-hidden");
    setMessage(
      loginMessage,
      "로그인은 됐지만 아직 관리자 계정으로 등록되지 않았습니다.",
      true
    );
    return;
  }

  loginView.classList.add("is-hidden");
  adminView.classList.remove("is-hidden");
  signOutButton.classList.remove("is-hidden");
  await loadProjects();
  await loadAboutContent();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMessage, "Logging in...");

  const { error } = await db.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value
  });

  if (error) {
    setMessage(loginMessage, error.message, true);
    return;
  }

  setMessage(loginMessage, "");
  await showCorrectView();
});

signOutButton.addEventListener("click", async () => {
  await db.auth.signOut();
  location.reload();
});


function makeSlug(title = "") {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || `project-${Date.now()}`;
}

function makeUniqueSlug(title = "") {
  const base = makeSlug(title);
  const used = new Set(projects.map((project) => project.slug).filter(Boolean));

  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function inferNumberFormat(value = "") {
  if (/^\[\d{2,}\]$/.test(value)) return "bracket_padded";
  if (/^\[\d+\]$/.test(value)) return "bracket_plain";
  if (/^\(\d{2,}\)$/.test(value)) return "paren_padded";
  if (/^\(\d+\)$/.test(value)) return "paren_plain";
  if (/^\d{2,}$/.test(value)) return "padded";
  if (/^\d+$/.test(value)) return "plain";
  return "bracket_padded";
}

async function loadProjects() {
  const [{ data, error }, { data: formatRow }] = await Promise.all([
    db
      .from("projects")
      .select("*, project_images(*), project_credits(*)")
      .order("sort_order", { ascending: true }),
    db
      .from("site_content")
      .select("value")
      .eq("key", "project_number_format")
      .maybeSingle()
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  projects = data || [];

  numberFormat =
    formatRow?.value ||
    inferNumberFormat(projects[0]?.project_number || "");

  if (projectNumberFormat) {
    projectNumberFormat.value = numberFormat;
  }

  renderProjectMenu();

  if (selectedProject) {
    const refreshed = projects.find((p) => p.id === selectedProject.id);
    if (refreshed) openProjectEditor(refreshed);
  }
}

function formatProjectNumber(index) {
  const n = index + 1;
  const padded = String(n).padStart(2, "0");

  switch (numberFormat) {
    case "bracket_plain":
      return `[${n}]`;
    case "plain":
      return String(n);
    case "padded":
      return padded;
    case "paren_plain":
      return `(${n})`;
    case "paren_padded":
      return `(${padded})`;
    case "bracket_padded":
    default:
      return `[${padded}]`;
  }
}

function normalizeProjectOrder() {
  projects.forEach((project, index) => {
    project.sort_order = index + 1;
    project.project_number = formatProjectNumber(index);
  });
}

async function persistProjectOrder() {
  normalizeProjectOrder();

  const results = await Promise.all(
    projects.map((project) =>
      db
        .from("projects")
        .update({
          sort_order: project.sort_order,
          project_number: project.project_number
        })
        .eq("id", project.id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed) throw failed.error;
}

async function moveProject(fromIndex, toIndex) {
  if (
    fromIndex === null ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= projects.length ||
    toIndex >= projects.length
  ) {
    return;
  }

  const [moved] = projects.splice(fromIndex, 1);
  projects.splice(toIndex, 0, moved);
  normalizeProjectOrder();
  renderProjectMenu();

  try {
    await persistProjectOrder();

    if (selectedProject?.id) {
      selectedProject = projects.find((project) => project.id === selectedProject.id) || selectedProject;
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "Project order could not be saved.");
    await loadProjects();
  }
}

function renderProjectMenu() {
  normalizeProjectOrder();

  projectMenu.innerHTML = projects.map((project, index) => {
    const classes = [
      selectedProject?.id === project.id ? "is-active" : "",
      project.is_published === false ? "is-hidden-project" : ""
    ].filter(Boolean).join(" ");

    return `
      <button
        type="button"
        data-project-id="${project.id}"
        data-index="${index}"
        class="${classes}"
        draggable="true"
        title="Drag to reorder"
      >
        <span>${project.project_number || formatProjectNumber(index)}</span>
        <span>${project.title || "Untitled"}</span>
        <span class="project-visibility">
          ${project.is_published === false ? "Hidden" : "Visible"}
        </span>
      </button>
    `;
  }).join("");

  projectMenu.querySelectorAll("[data-project-id]").forEach((button) => {
    const index = Number(button.dataset.index);

    button.addEventListener("click", () => {
      if (draggedProjectIndex !== null) return;
      const project = projects.find((item) => item.id === button.dataset.projectId);
      if (project) openProjectEditor(project);
    });

    button.addEventListener("dragstart", (event) => {
      draggedProjectIndex = index;
      button.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    });

    button.addEventListener("dragend", () => {
      window.setTimeout(() => {
        draggedProjectIndex = null;
      }, 0);

      projectMenu
        .querySelectorAll("[data-project-id]")
        .forEach((item) => item.classList.remove("is-dragging", "is-drag-over"));
    });

    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      button.classList.add("is-drag-over");
    });

    button.addEventListener("dragleave", () => {
      button.classList.remove("is-drag-over");
    });

    button.addEventListener("drop", async (event) => {
      event.preventDefault();
      button.classList.remove("is-drag-over");

      const fromIndex = draggedProjectIndex;
      draggedProjectIndex = null;
      await moveProject(fromIndex, index);
    });
  });
}

function renderCover() {
  const url = coverPreviewObjectUrl || currentCoverUrl;
  coverPreview.innerHTML = url
    ? `<img src="${localPreviewUrl(url)}" alt="" />`
    : "";
}

fields.coverFile.addEventListener("change", () => {
  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl);
    coverPreviewObjectUrl = "";
  }

  const file = fields.coverFile.files[0];
  if (file) {
    coverPreviewObjectUrl = URL.createObjectURL(file);
  }

  renderCover();
});

function normalizeGalleryOrder() {
  galleryItems.forEach((item, index) => {
    item.sort_order = index + 1;
  });
}

function moveGalleryItem(fromIndex, toIndex) {
  if (
    fromIndex === null ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= galleryItems.length ||
    toIndex >= galleryItems.length
  ) {
    return;
  }

  const [moved] = galleryItems.splice(fromIndex, 1);
  galleryItems.splice(toIndex, 0, moved);
  normalizeGalleryOrder();
  renderGallery();
}

function renderGallery() {
  normalizeGalleryOrder();

  galleryEditor.innerHTML = galleryItems.map((item, index) => {
    const previewUrl = item.preview_url || localPreviewUrl(item.image_url || "");

    return `
      <div
        class="gallery-row"
        data-index="${index}"
        draggable="true"
        title="Drag to reorder"
      >
        <img src="${previewUrl}" alt="" draggable="false" />
        <select class="gallery-layout" aria-label="Image layout">
          <option value="full" ${item.layout === "full" ? "selected" : ""}>Full</option>
          <option value="half" ${item.layout === "half" ? "selected" : ""}>Half</option>
          <option value="third" ${item.layout === "third" ? "selected" : ""}>1/3</option>
          <option value="two_thirds" ${item.layout === "two_thirds" ? "selected" : ""}>2/3</option>
        </select>
        <button class="remove-image" type="button">Delete</button>
      </div>
    `;
  }).join("");

  galleryEditor.querySelectorAll(".gallery-row").forEach((row) => {
    const index = Number(row.dataset.index);

    row.querySelector(".gallery-layout").addEventListener("change", (event) => {
      galleryItems[index].layout = event.target.value;
    });

    row.querySelector(".remove-image").addEventListener("click", () => {
      const item = galleryItems[index];
      if (item?.preview_url) {
        URL.revokeObjectURL(item.preview_url);
      }
      galleryItems.splice(index, 1);
      normalizeGalleryOrder();
      renderGallery();
    });

    row.addEventListener("dragstart", (event) => {
      draggedGalleryIndex = index;
      row.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    });

    row.addEventListener("dragend", () => {
      draggedGalleryIndex = null;
      galleryEditor
        .querySelectorAll(".gallery-row")
        .forEach((item) => item.classList.remove("is-dragging", "is-drag-over"));
    });

    row.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      row.classList.add("is-drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("is-drag-over");
    });

    row.addEventListener("drop", (event) => {
      event.preventDefault();
      row.classList.remove("is-drag-over");
      moveGalleryItem(draggedGalleryIndex, index);
    });
  });
}

galleryFiles.addEventListener("change", () => {
  const files = [...galleryFiles.files];

  files.forEach((file) => {
    galleryItems.push({
      file,
      preview_url: URL.createObjectURL(file),
      image_url: "",
      sort_order: galleryItems.length + 1,
      layout: "full"
    });
  });

  galleryFiles.value = "";
  renderGallery();
});


function defaultCreditItems() {
  return [
    { label: "Client", value: "", sort_order: 1 },
    { label: "Date", value: "", sort_order: 2 },
    { label: "Art Direction", value: "", sort_order: 3 },
    { label: "Design", value: "", sort_order: 4 }
  ];
}

function renderCredits() {
  creditItems.sort((a, b) => a.sort_order - b.sort_order);

  creditEditor.innerHTML = creditItems.map((item, index) => `
    <div class="credit-editor-row" data-index="${index}">
      <input
        class="credit-label-input"
        type="text"
        value="${(item.label || "").replaceAll('"', '&quot;')}"
        placeholder="Label"
      />
      <input
        class="credit-value-input"
        type="text"
        value="${(item.value || "").replaceAll('"', '&quot;')}"
        placeholder="Value"
      />
      <input
        class="credit-order"
        type="number"
        min="1"
        value="${item.sort_order || index + 1}"
        aria-label="Credit order"
      />
      <button class="remove-credit" type="button">Remove</button>
    </div>
  `).join("");

  creditEditor.querySelectorAll(".credit-editor-row").forEach((row) => {
    const index = Number(row.dataset.index);

    row.querySelector(".credit-label-input").addEventListener("input", (event) => {
      creditItems[index].label = event.target.value;
    });

    row.querySelector(".credit-value-input").addEventListener("input", (event) => {
      creditItems[index].value = event.target.value;
    });

    row.querySelector(".credit-order").addEventListener("input", (event) => {
      creditItems[index].sort_order = Number(event.target.value) || index + 1;
    });

    row.querySelector(".remove-credit").addEventListener("click", () => {
      creditItems.splice(index, 1);
      creditItems.forEach((item, i) => {
        item.sort_order = i + 1;
      });
      renderCredits();
    });
  });
}

addCreditButton.addEventListener("click", () => {
  creditItems.push({
    label: "",
    value: "",
    sort_order: creditItems.length + 1
  });
  renderCredits();
});


function updateVisibilityStatus() {
  if (!visibilityStatus) return;
  visibilityStatus.textContent = fields.isPublished.checked ? "Visible" : "Hidden";
}

fields.isPublished.addEventListener("change", updateVisibilityStatus);

function openProjectEditor(project) {
  selectedProject = project;
  aboutEditorButton.classList.remove("is-active");
  aboutForm.classList.add("is-hidden");
  emptyEditor.classList.add("is-hidden");
  projectForm.classList.remove("is-hidden");

  fields.id.value = project.id || "";
  fields.title.value = project.title || "";
  fields.year.value = project.year || "";
  fields.category.value = project.category || "";
  fields.description.value = project.description || "";
  fields.lightboxDescription.value =
    project.lightbox_description || project.description || "";
  fields.lightboxDescriptionKr.value =
    project.lightbox_description_kr || "";
  fields.isPublished.checked = project.is_published !== false;
  updateVisibilityStatus();

  const savedCredits = [...(project.project_credits || [])];

  creditItems = (savedCredits.length ? savedCredits : (project.id ? [] : defaultCreditItems()))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((credit) => ({
      id: credit.id,
      label: credit.label || "",
      value: credit.value || "",
      sort_order: credit.sort_order
    }));
  if (coverPreviewObjectUrl) {
    URL.revokeObjectURL(coverPreviewObjectUrl);
    coverPreviewObjectUrl = "";
  }
  currentCoverUrl = project.cover_image_url || "";

  galleryItems.forEach((item) => {
    if (item.preview_url) URL.revokeObjectURL(item.preview_url);
  });

  galleryItems = [...(project.project_images || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      image_url: image.image_url,
      preview_url: "",
      file: null,
      sort_order: image.sort_order,
      layout: image.layout || "full"
    }));

  fields.coverFile.value = "";
  galleryFiles.value = "";
  renderCover();
  renderGallery();
  renderCredits();
  renderProjectMenu();
  setMessage(saveMessage, "");
}

newProjectButton.addEventListener("click", () => {
  openProjectEditor({
    id: "",
    project_number: formatProjectNumber(projects.length),
    sort_order: projects.length + 1,
    title: "",
    slug: "",
    year: "",
    category: "",
    description: "",
    lightbox_description: "",
    lightbox_description_kr: "",
    is_published: true,
    cover_image_url: "",
    project_images: [],
    project_credits: defaultCreditItems()
  });
});



saveNumberFormatButton?.addEventListener("click", async () => {
  numberFormat = projectNumberFormat.value;
  setMessage(numberFormatMessage, "Saving...");

  const { error: formatError } = await db
    .from("site_content")
    .upsert(
      [{ key: "project_number_format", value: numberFormat }],
      { onConflict: "key" }
    );

  if (formatError) {
    setMessage(numberFormatMessage, formatError.message || "Save failed", true);
    return;
  }

  try {
    await persistProjectOrder();
    renderProjectMenu();
    setMessage(numberFormatMessage, "Applied");
  } catch (error) {
    setMessage(numberFormatMessage, error.message || "Apply failed", true);
  }
});

const ABOUT_KEYS = {
  about_en: "en",
  about_kr: "kr",
  about_contact_label: "contactLabel",
  about_contact_value: "contactValue",
  about_contact_note: "contactNote",
  about_experience_label: "experienceLabel",
  about_experience_value: "experienceValue",
  about_experience_note: "experienceNote",
  about_education_label: "educationLabel",
  about_education_value: "educationValue",
  about_education_note: "educationNote"
};

async function loadAboutContent() {
  const { data, error } = await db
    .from("site_content")
    .select("key, value")
    .like("key", "about_%");

  if (error) {
    console.error(error);
    return;
  }

  const content = Object.fromEntries((data || []).map((item) => [item.key, item.value || ""]));

  Object.entries(ABOUT_KEYS).forEach(([key, fieldName]) => {
    if (aboutFieldsAdmin[fieldName]) {
      aboutFieldsAdmin[fieldName].value = content[key] || "";
    }
  });
}

aboutEditorButton.addEventListener("click", async () => {
  selectedProject = null;
  renderProjectMenu();
  projectForm.classList.add("is-hidden");
  emptyEditor.classList.add("is-hidden");
  aboutForm.classList.remove("is-hidden");
  aboutEditorButton.classList.add("is-active");
  await loadAboutContent();
  setMessage(aboutSaveMessage, "");
});

aboutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(aboutSaveMessage, "Saving...");

  const rows = Object.entries(ABOUT_KEYS).map(([key, fieldName]) => ({
    key,
    value: aboutFieldsAdmin[fieldName].value
  }));

  const { error } = await db
    .from("site_content")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    setMessage(aboutSaveMessage, error.message || "Save failed", true);
    return;
  }

  setMessage(aboutSaveMessage, "Saved");
});

async function uploadImage(file, folder) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeName = `${crypto.randomUUID()}.${extension}`;
  const path = `${folder}/${safeName}`;

  const { error } = await db.storage
    .from("portfolio-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) throw error;

  const { data } = db.storage
    .from("portfolio-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(saveMessage, "Saving...");

  try {
    let coverUrl = currentCoverUrl;

    if (fields.coverFile.files[0]) {
      const uploadFolder = selectedProject?.slug || makeSlug(fields.title.value);
      coverUrl = await uploadImage(
        fields.coverFile.files[0],
        uploadFolder || "project"
      );
    }

    const uploadFolder = selectedProject?.slug || makeSlug(fields.title.value);
    for (const item of galleryItems) {
      if (item.file && !item.image_url) {
        item.image_url = await uploadImage(
          item.file,
          uploadFolder || "project"
        );
      }
    }

    const payload = {
      project_number: selectedProject?.project_number || formatProjectNumber(projects.length),
      sort_order: selectedProject?.sort_order || projects.length + 1,
      title: fields.title.value.trim(),
      slug: selectedProject?.slug || makeUniqueSlug(fields.title.value.trim()),
      year: fields.year.value.trim(),
      category: fields.category.value.trim(),
      description: fields.description.value.trim(),
      lightbox_description: fields.lightboxDescription.value.trim(),
      lightbox_description_kr: fields.lightboxDescriptionKr.value.trim(),
      is_published: fields.isPublished.checked,
      cover_image_url: coverUrl
    };

    let projectId = fields.id.value;

    if (projectId) {
      const { error } = await db
        .from("projects")
        .update(payload)
        .eq("id", projectId);
      if (error) throw error;
    } else {
      const { data, error } = await db
        .from("projects")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      projectId = data.id;
      fields.id.value = projectId;
    }

    const { error: deleteError } = await db
      .from("project_images")
      .delete()
      .eq("project_id", projectId);

    if (deleteError) throw deleteError;

    const cleanGallery = galleryItems
      .filter((item) => (item.image_url || "").trim())
      .map((item, index) => ({
        project_id: projectId,
        image_url: item.image_url.trim(),
        sort_order: index + 1,
        layout: item.layout || "full"
      }));

    if (cleanGallery.length) {
      const { error: imageError } = await db
        .from("project_images")
        .insert(cleanGallery);
      if (imageError) throw imageError;
    }

    const { error: deleteCreditsError } = await db
      .from("project_credits")
      .delete()
      .eq("project_id", projectId);

    if (deleteCreditsError) throw deleteCreditsError;

    const cleanCredits = creditItems
      .filter((item) => item.label.trim() || item.value.trim())
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item, index) => ({
        project_id: projectId,
        label: item.label.trim(),
        value: item.value.trim(),
        sort_order: index + 1
      }));

    if (cleanCredits.length) {
      const { error: creditError } = await db
        .from("project_credits")
        .insert(cleanCredits);

      if (creditError) throw creditError;
    }

    currentCoverUrl = coverUrl;

    if (coverPreviewObjectUrl) {
      URL.revokeObjectURL(coverPreviewObjectUrl);
      coverPreviewObjectUrl = "";
    }

    galleryItems.forEach((item) => {
      if (item.preview_url) URL.revokeObjectURL(item.preview_url);
    });

    setMessage(saveMessage, "Saved");
    selectedProject = { id: projectId };
    await loadProjects();
  } catch (error) {
    console.error(error);
    setMessage(saveMessage, error.message || "Save failed", true);
  }
});

deleteProjectButton.addEventListener("click", async () => {
  const projectId = fields.id.value;
  if (!projectId) {
    selectedProject = null;
    projectForm.classList.add("is-hidden");
    emptyEditor.classList.remove("is-hidden");
    return;
  }

  if (!confirm(`Delete "${fields.title.value}"?`)) return;

  const { error } = await db
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    alert(error.message);
    return;
  }

  selectedProject = null;
  projectForm.classList.add("is-hidden");
  emptyEditor.classList.remove("is-hidden");

  await loadProjects();

  try {
    await persistProjectOrder();
    renderProjectMenu();
  } catch (orderError) {
    console.error(orderError);
    alert(orderError.message || "Project numbers could not be updated.");
  }
});

db.auth.onAuthStateChange(() => {
  window.setTimeout(showCorrectView, 0);
});

showCorrectView();
