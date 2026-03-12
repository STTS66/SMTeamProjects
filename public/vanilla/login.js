import {
  authFrame,
  escapeAttribute,
  escapeHtml,
  getBootstrap,
  getLoginErrorMessage,
  mount,
  submitAuthAction
} from "/vanilla/common.js";

const data = getBootstrap();
const callbackUrl = data.callbackUrl || "/projects";
const blockedSupportNote =
  data.error === "AccessDenied"
    ? `
      <div class="blocked-inline">
        <p class="helper-text">
          Если вы считаете блокировку ошибкой, напишите в поддержку.
        </p>
        <a
          class="button button-ghost"
          href="${escapeAttribute(data.supportBotUrl || "https://t.me/smteam_support_bot")}"
          target="_blank"
          rel="noreferrer"
        >
          Поддержка в Telegram
        </a>
      </div>
    `
    : "";

mount(
  authFrame({
    title: "Вход в SMTeam",
    subtitle: "Публикация проектов команды, профиль и роли пользователей.",
    content: `
      <div class="stack">
        <h2>Авторизация</h2>
        <form class="form-grid" id="login-form">
          <label class="field">
            <span>Email или логин</span>
            <input class="input" name="identifier" placeholder="admin_smteam" />
          </label>
          <label class="field">
            <span>Пароль</span>
            <input class="input" name="password" type="password" placeholder="Введите пароль" />
          </label>
          <p class="error-text" id="login-error">${escapeHtml(
            getLoginErrorMessage(data.error)
          )}</p>
          <button class="button button-primary button-full" id="login-submit" type="submit">
            Войти
          </button>
        </form>
        ${
          data.googleEnabled
            ? `<button class="button button-ghost button-full" id="google-login" type="button">Войти через Google</button>`
            : `<p class="helper-text">Google OAuth можно включить позже через env-переменные.</p>`
        }
        <p class="footer-note">Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
        ${blockedSupportNote}
      </div>
    `
  })
);

document.getElementById("login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = document.getElementById("login-submit");

  if (!(form instanceof HTMLFormElement) || !(submit instanceof HTMLButtonElement)) {
    return;
  }

  const formData = new FormData(form);
  submit.disabled = true;
  submit.textContent = "Входим...";

  await submitAuthAction("/api/auth/callback/credentials", {
    identifier: String(formData.get("identifier") || ""),
    password: String(formData.get("password") || ""),
    callbackUrl
  });
});

document.getElementById("google-login")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.disabled = true;
  button.textContent = "Переходим в Google...";

  await submitAuthAction("/api/auth/signin/google", {
    callbackUrl
  });
});
