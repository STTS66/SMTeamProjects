import {
  avatarMarkup,
  bindAvatarFallbacks,
  dashboardFrame,
  escapeHtml,
  getBootstrap,
  mount,
  requestJson,
  startAccountStatusWatcher,
  wireLogout
} from "/vanilla/common.js";

const data = getBootstrap();

mount(
  dashboardFrame({
    active: "profile",
    user: data.user,
    showAdmin: data.user?.role === "ADMIN",
    content: `
      <div class="grid-two">
        <section class="panel">
          <form class="form-grid" id="profile-form">
            <div class="profile-avatar-card">
              <div id="profile-avatar-box">
                ${avatarMarkup(data.user?.image, data.user?.username || data.user?.email, "lg")}
              </div>
              <div class="helper-stack">
                <h2>${escapeHtml(data.user?.username || data.user?.email || "Профиль")}</h2>
                <p class="helper-text">Если аватарки нет, будет показан нейтральный круглый силуэт.</p>
              </div>
            </div>
            <label class="field">
              <span>Никнейм</span>
              <input class="input" name="username" value="${escapeHtml(data.user?.username || "")}" />
            </label>
            <label class="field">
              <span>Аватарка</span>
              <input class="native-file" id="avatar-input" name="avatar" type="file" accept="image/*" />
            </label>
            <p class="error-text" id="profile-error"></p>
            <button class="button button-primary" id="profile-submit" type="submit">Сохранить</button>
          </form>
        </section>
        <section class="panel stack-sm">
          <h2>Профиль</h2>
          <p>Роль: ${escapeHtml(data.user?.role || "USER")}</p>
          <p>Публикаций: ${escapeHtml(String(data.user?.projectsCount || 0))}</p>
          <p class="helper-text">Email: ${escapeHtml(data.user?.email || "")}</p>
        </section>
      </div>
    `
  })
);

wireLogout();
startAccountStatusWatcher();

let previewUrl = null;

document.getElementById("avatar-input")?.addEventListener("change", (event) => {
  const input = event.currentTarget;
  const avatarBox = document.getElementById("profile-avatar-box");

  if (!(input instanceof HTMLInputElement) || !(avatarBox instanceof HTMLElement)) {
    return;
  }

  const file = input.files?.[0];

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (file) {
    previewUrl = URL.createObjectURL(file);
  }

  avatarBox.innerHTML = avatarMarkup(
    previewUrl || data.user?.image || null,
    data.user?.username || data.user?.email || "Profile",
    "lg"
  );
  bindAvatarFallbacks(avatarBox);
});

document.getElementById("profile-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = document.getElementById("profile-submit");
  const errorNode = document.getElementById("profile-error");

  if (
    !(form instanceof HTMLFormElement) ||
    !(submit instanceof HTMLButtonElement) ||
    !(errorNode instanceof HTMLElement)
  ) {
    return;
  }

  submit.disabled = true;
  submit.textContent = "Сохраняем...";
  errorNode.textContent = "";

  try {
    await requestJson("/api/profile", {
      method: "POST",
      body: new FormData(form)
    });

    window.location.reload();
  } catch (error) {
    submit.disabled = false;
    submit.textContent = "Сохранить";
    errorNode.textContent =
      error instanceof Error ? error.message : "Не удалось обновить профиль.";
  }
});
