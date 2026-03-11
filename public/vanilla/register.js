import {
  authFrame,
  getBootstrap,
  mount,
  requestJson,
  submitAuthAction
} from "/vanilla/common.js";

const data = getBootstrap();

mount(
  authFrame({
    title: "Регистрация в SMTeam",
    subtitle: "Создайте аккаунт и сразу попадёте в раздел проектов.",
    content: `
      <div class="stack">
        <h2>Создать аккаунт</h2>
        <form class="form-grid" id="register-form">
          <label class="field">
            <span>Логин</span>
            <input class="input" name="username" />
          </label>
          <label class="field">
            <span>Email</span>
            <input class="input" name="email" type="email" />
          </label>
          <label class="field">
            <span>Пароль</span>
            <input class="input" name="password" type="password" />
          </label>
          <p class="error-text" id="register-error"></p>
          <button class="button button-primary button-full" id="register-submit" type="submit">
            Зарегистрироваться
          </button>
        </form>
        ${
          data.googleEnabled
            ? `<button class="button button-ghost button-full" id="google-register" type="button">Продолжить через Google</button>`
            : `<p class="helper-text">Google OAuth поддержан и может быть включён позже.</p>`
        }
        <p class="footer-note">Уже есть аккаунт? <a href="/login">Войти</a></p>
      </div>
    `
  })
);

document.getElementById("register-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = document.getElementById("register-submit");
  const errorNode = document.getElementById("register-error");

  if (
    !(form instanceof HTMLFormElement) ||
    !(submit instanceof HTMLButtonElement) ||
    !(errorNode instanceof HTMLElement)
  ) {
    return;
  }

  const payload = {
    username: String(new FormData(form).get("username") || ""),
    email: String(new FormData(form).get("email") || ""),
    password: String(new FormData(form).get("password") || "")
  };

  submit.disabled = true;
  submit.textContent = "Создаём...";
  errorNode.textContent = "";

  try {
    await requestJson("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    await submitAuthAction("/api/auth/callback/credentials", {
      identifier: payload.email,
      password: payload.password,
      callbackUrl: "/projects"
    });
  } catch (error) {
    submit.disabled = false;
    submit.textContent = "Зарегистрироваться";
    errorNode.textContent =
      error instanceof Error ? error.message : "Не удалось создать аккаунт."
    ;
  }
});

document.getElementById("google-register")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;

  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.disabled = true;
  button.textContent = "Переходим в Google...";

  await submitAuthAction("/api/auth/signin/google", {
    callbackUrl: "/projects"
  });
});
