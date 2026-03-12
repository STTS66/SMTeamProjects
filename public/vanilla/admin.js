import {
  dashboardFrame,
  escapeHtml,
  getBootstrap,
  mount,
  requestJson,
  startAccountStatusWatcher,
  wireLogout
} from "/vanilla/common.js";

const data = getBootstrap();

function renderUsers(users) {
  return users
    .map(
      (user) => `
        <div class="user-row">
          <div class="stack-sm user-row-meta">
            <strong>${escapeHtml(user.username || user.email)}</strong>
            <div class="muted">
              ${escapeHtml(user.role)} • проектов: ${escapeHtml(String(user.projectsCount || 0))}
            </div>
          </div>
          <div class="user-row-action">
            <button
              class="button ${user.isBanned ? "button-ghost" : "button-danger"}"
              data-user-id="${escapeHtml(user.id)}"
              data-action="${user.isBanned ? "unban" : "ban"}"
              ${user.isCurrentAdmin ? "disabled" : ""}
            >
              ${user.isBanned ? "Разбанить" : "Забанить"}
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

mount(
  dashboardFrame({
    active: "admin",
    user: data.user,
    showAdmin: true,
    content: `
      <div class="stack">
        <div class="stats-row">
          <section class="panel">
            <strong>${escapeHtml(String(data.totalUsers || 0))}</strong>
            <p class="muted">пользователей</p>
          </section>
          <section class="panel">
            <strong>${escapeHtml(String(data.onlineUsers || 0))}</strong>
            <p class="muted">онлайн за 15 минут</p>
          </section>
        </div>
        <section class="panel">
          <div class="stack-sm">
            <h2>Пользователи</h2>
            <div class="user-list">
              ${renderUsers(data.users || [])}
            </div>
          </div>
        </section>
      </div>
    `
  })
);

wireLogout();
startAccountStatusWatcher();

document.querySelectorAll("[data-user-id]").forEach((button) => {
  button.addEventListener("click", async () => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const userId = button.dataset.userId;
    const action = button.dataset.action;

    if (!userId || !action) {
      return;
    }

    button.disabled = true;

    try {
      await requestJson("/api/admin/ban", {
        method: action === "ban" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      window.location.reload();
    } catch (error) {
      button.disabled = false;
      alert(error instanceof Error ? error.message : "Не удалось изменить статус пользователя.");
    }
  });
});
