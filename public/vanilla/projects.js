import {
  avatarMarkup,
  dashboardFrame,
  escapeAttribute,
  escapeHtml,
  formatDate,
  getBootstrap,
  mount,
  requestJson,
  wireLogout
} from "/vanilla/common.js";

const data = getBootstrap();

function renderAttachments(attachments) {
  if (!attachments?.length) {
    return "";
  }

  return `
    <div class="project-media">
      ${attachments
        .map((file) => {
          if (file.kind === "IMAGE") {
            return `<img class="project-image" src="${escapeAttribute(
              file.publicUrl
            )}" alt="${escapeAttribute(file.fileName)}" />`;
          }

          if (file.kind === "VIDEO") {
            return `
              <video class="project-video" controls preload="metadata">
                <source src="${escapeAttribute(file.publicUrl)}" type="${escapeAttribute(
              file.mimeType || "video/mp4"
            )}" />
              </video>
            `;
          }

          return `
            <div class="project-file-row">
              <a class="project-file" href="${escapeAttribute(
                file.publicUrl
              )}" target="_blank" rel="noreferrer">
                ${escapeHtml(file.fileName)}
              </a>
              <a
                class="button button-ghost project-download"
                href="${escapeAttribute(file.publicUrl)}"
                download="${escapeAttribute(file.fileName)}"
                target="_blank"
                rel="noreferrer"
              >
                Скачать
              </a>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderProjectCard(project) {
  const authorName = project.author.username || project.author.email || "SMTeam";

  return `
    <article class="project-card">
      <div class="project-head">
        <div class="project-author">
          ${avatarMarkup(project.author.image, authorName, "md")}
          <div>
            <strong>${escapeHtml(authorName)}</strong>
            <div class="muted">${escapeHtml(formatDate(project.createdAt))}</div>
          </div>
        </div>
      </div>
      <div>${escapeHtml(project.description)}</div>
      ${renderAttachments(project.attachments)}
    </article>
  `;
}

const isAdmin = data.user?.role === "ADMIN";
const projectsMarkup = data.projects?.length
  ? data.projects.map(renderProjectCard).join("")
  : `<section class="panel"><p class="muted">Пока нет проектов.</p></section>`;

mount(
  dashboardFrame({
    active: "projects",
    user: data.user,
    showAdmin: isAdmin,
    content: `
      <div class="stack">
        ${
          isAdmin
            ? `
              <section class="panel">
                <div class="stack-sm">
                  <h2>Опубликовать проект</h2>
                  <form class="form-grid" id="publish-form">
                    <label class="field">
                      <span>Описание проекта</span>
                      <textarea class="textarea" name="description" placeholder="Расскажите о проекте"></textarea>
                    </label>
                    <label class="field">
                      <span>Файлы</span>
                      <input class="native-file" name="files" type="file" multiple />
                    </label>
                    <p class="error-text" id="publish-error"></p>
                    <button class="button button-primary" id="publish-submit" type="submit">Опубликовать проект</button>
                  </form>
                </div>
              </section>
            `
            : ""
        }
        ${projectsMarkup}
      </div>
    `
  })
);

wireLogout();

document.getElementById("publish-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = document.getElementById("publish-submit");
  const errorNode = document.getElementById("publish-error");

  if (
    !(form instanceof HTMLFormElement) ||
    !(submit instanceof HTMLButtonElement) ||
    !(errorNode instanceof HTMLElement)
  ) {
    return;
  }

  submit.disabled = true;
  submit.textContent = "Публикуем...";
  errorNode.textContent = "";

  try {
    await requestJson("/api/projects", {
      method: "POST",
      body: new FormData(form)
    });

    window.location.reload();
  } catch (error) {
    submit.disabled = false;
    submit.textContent = "Опубликовать проект";
    errorNode.textContent =
      error instanceof Error ? error.message : "Не удалось опубликовать проект.";
  }
});
