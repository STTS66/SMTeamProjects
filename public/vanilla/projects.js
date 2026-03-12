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
const isAdmin = data.user?.role === "ADMIN";

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

function renderAdminControls(project) {
  if (!isAdmin) {
    return "";
  }

  return `
    <div class="project-actions">
      <button
        class="button button-ghost"
        type="button"
        data-project-edit-toggle="${escapeAttribute(project.id)}"
      >
        Редактировать
      </button>
      <button
        class="button button-danger"
        type="button"
        data-project-delete="${escapeAttribute(project.id)}"
      >
        Удалить
      </button>
    </div>
  `;
}

function renderEditableAttachments(project) {
  if (!project.attachments?.length) {
    return `<p class="helper-text">У проекта пока нет вложений.</p>`;
  }

  return `
    <div class="project-attachment-admin-list">
      ${project.attachments
        .map(
          (file) => `
            <div class="project-attachment-admin-item">
              <div class="project-attachment-admin-meta">
                <strong>${escapeHtml(file.fileName)}</strong>
                <span class="muted">${escapeHtml(file.kind)}</span>
              </div>
              <button
                class="button button-danger"
                type="button"
                data-project-attachment-delete="${escapeAttribute(project.id)}:${escapeAttribute(file.id)}"
              >
                Удалить файл
              </button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderEditPanel(project) {
  if (!isAdmin) {
    return "";
  }

  return `
    <form class="project-edit-panel" data-project-edit-form="${escapeAttribute(project.id)}" hidden>
      <label class="field">
        <span>Описание проекта</span>
        <textarea class="textarea" name="description">${escapeHtml(project.description)}</textarea>
      </label>
      <label class="field">
        <span>Новые файлы</span>
        <input class="native-file" name="files" type="file" multiple />
      </label>
      <p class="helper-text">
        Если выбрать новые файлы, текущие вложения будут заменены. Если поле пустое, изменится только описание.
      </p>
      <div class="stack-sm">
        <span class="section-title">Текущие вложения</span>
        ${renderEditableAttachments(project)}
      </div>
      <p class="error-text" data-project-edit-error="${escapeAttribute(project.id)}"></p>
      <div class="project-actions">
        <button class="button button-primary" type="submit">Сохранить</button>
        <button
          class="button button-ghost"
          type="button"
          data-project-edit-cancel="${escapeAttribute(project.id)}"
        >
          Отмена
        </button>
      </div>
    </form>
  `;
}

function renderProjectCard(project) {
  const authorName = project.author.username || project.author.email || "SMTeam";

  return `
    <article class="project-card" data-project-id="${escapeAttribute(project.id)}">
      <div class="project-head">
        <div class="project-author">
          ${avatarMarkup(project.author.image, authorName, "md")}
          <div>
            <strong>${escapeHtml(authorName)}</strong>
            <div class="muted">${escapeHtml(formatDate(project.createdAt))}</div>
          </div>
        </div>
        ${renderAdminControls(project)}
      </div>
      <div class="project-description">${escapeHtml(project.description)}</div>
      ${renderAttachments(project.attachments)}
      ${renderEditPanel(project)}
    </article>
  `;
}

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

document.querySelectorAll("[data-project-edit-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const projectId = button.dataset.projectEditToggle;
    const form = projectId
      ? document.querySelector(`[data-project-edit-form="${projectId}"]`)
      : null;

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const isHidden = form.hasAttribute("hidden");

    if (isHidden) {
      form.removeAttribute("hidden");
      button.textContent = "Скрыть";
      return;
    }

    form.setAttribute("hidden", "hidden");
    button.textContent = "Редактировать";
  });
});

document.querySelectorAll("[data-project-edit-cancel]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const projectId = button.dataset.projectEditCancel;
    const form = projectId
      ? document.querySelector(`[data-project-edit-form="${projectId}"]`)
      : null;
    const toggle = projectId
      ? document.querySelector(`[data-project-edit-toggle="${projectId}"]`)
      : null;

    if (form instanceof HTMLFormElement) {
      form.setAttribute("hidden", "hidden");
      form.reset();
    }

    if (toggle instanceof HTMLButtonElement) {
      toggle.textContent = "Редактировать";
    }
  });
});

document.querySelectorAll("[data-project-edit-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const projectId = form.dataset.projectEditForm;
    const errorNode = projectId
      ? document.querySelector(`[data-project-edit-error="${projectId}"]`)
      : null;
    const submit = form.querySelector('button[type="submit"]');

    if (
      !projectId ||
      !(errorNode instanceof HTMLElement) ||
      !(submit instanceof HTMLButtonElement)
    ) {
      return;
    }

    submit.disabled = true;
    submit.textContent = "Сохраняем...";
    errorNode.textContent = "";

    try {
      await requestJson(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: new FormData(form)
      });

      window.location.reload();
    } catch (error) {
      submit.disabled = false;
      submit.textContent = "Сохранить";
      errorNode.textContent =
        error instanceof Error ? error.message : "Не удалось обновить проект.";
    }
  });
});

document.querySelectorAll("[data-project-delete]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const projectId = button.dataset.projectDelete;

    if (!projectId) {
      return;
    }

    if (!window.confirm("Удалить этот проект? Это действие нельзя отменить.")) {
      return;
    }

    button.disabled = true;
    button.textContent = "Удаляем...";

    try {
      await requestJson(`/api/projects/${projectId}`, {
        method: "DELETE"
      });

      window.location.reload();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Удалить";
      window.alert(
        error instanceof Error ? error.message : "Не удалось удалить проект."
      );
    }
  });
});

document.querySelectorAll("[data-project-attachment-delete]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const descriptor = button.dataset.projectAttachmentDelete;

    if (!descriptor) {
      return;
    }

    const [projectId, attachmentId] = descriptor.split(":");

    if (!projectId || !attachmentId) {
      return;
    }

    if (!window.confirm("Удалить только этот файл из проекта?")) {
      return;
    }

    button.disabled = true;
    button.textContent = "Удаляем...";

    try {
      await requestJson(`/api/projects/${projectId}/attachments/${attachmentId}`, {
        method: "DELETE"
      });

      window.location.reload();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Удалить файл";
      window.alert(
        error instanceof Error ? error.message : "Не удалось удалить файл."
      );
    }
  });
});
