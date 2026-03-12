export function getBootstrap() {
  const node = document.getElementById("smteam-bootstrap");

  if (!node) {
    return {};
  }

  try {
    return JSON.parse(node.textContent || "{}");
  } catch {
    return {};
  }
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getLoginErrorMessage(errorCode) {
  if (!errorCode) {
    return "";
  }

  if (errorCode === "CredentialsSignin") {
    return "Не удалось войти. Проверьте логин и пароль.";
  }

  if (errorCode === "AccessDenied") {
    return "Доступ запрещён. Возможно, аккаунт заблокирован.";
  }

  if (errorCode === "OAuthAccountNotLinked") {
    return "Для этого email уже есть аккаунт. Теперь вход через Google разрешён, попробуйте ещё раз.";
  }

  if (errorCode === "OAuthSignin" || errorCode === "OAuthCallback") {
    return "Не удалось завершить вход через Google. Попробуйте ещё раз через несколько секунд.";
  }

  if (errorCode === "CallbackRouteError") {
    return "Google успешно открылся, но сайт не смог завершить вход. Попробуйте ещё раз.";
  }

  if (errorCode === "Configuration") {
    return "Google OAuth настроен не полностью. Проверьте GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET.";
  }

  return "Не удалось выполнить вход.";
}

export function avatarMarkup(src, name = "User", size = "md") {
  const safeName = escapeAttribute(name);
  const safeSrc = src ? escapeAttribute(src) : "";

  return `
    <div class="avatar avatar-${size}${safeSrc ? "" : " avatar-empty"}">
      ${
        safeSrc
          ? `<img src="${safeSrc}" alt="Avatar ${safeName}" />`
          : avatarPlaceholderMarkup()
      }
    </div>
  `;
}

export function avatarPlaceholderMarkup() {
  return `
    <span class="avatar-placeholder" aria-hidden="true">
      <span class="avatar-placeholder-head"></span>
      <span class="avatar-placeholder-body"></span>
    </span>
  `;
}

export function bindAvatarFallbacks(root = document) {
  root.querySelectorAll(".avatar img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const avatar = image.closest(".avatar");

        if (!avatar) {
          return;
        }

        avatar.classList.add("avatar-empty");
        avatar.innerHTML = avatarPlaceholderMarkup();
      },
      { once: true }
    );
  });
}

export function mount(html) {
  const root = document.getElementById("app");

  if (!root) {
    return;
  }

  root.innerHTML = html;
  bindAvatarFallbacks(root);
}

export function blockedFrame(supportBotUrl) {
  const supportUrl = escapeAttribute(supportBotUrl || "https://t.me/smteam_support_bot");

  return `
    <div class="blocked-shell">
      <section class="blocked-card">
        <p class="eyebrow">Доступ ограничен</p>
        <h1>Вас заблокировали</h1>
        <p class="hero-copy">
          Ваш доступ к SMTeam ограничен администратором. Напишите в поддержку, чтобы уточнить причину и запросить разблокировку.
        </p>
        <div class="blocked-actions">
          <a class="button button-primary" href="${supportUrl}" target="_blank" rel="noreferrer">
            Написать в поддержку
          </a>
        </div>
      </section>
    </div>
  `;
}

export function mountBlockedState(supportBotUrl) {
  mount(blockedFrame(supportBotUrl));
}

export function startAccountStatusWatcher() {
  const poll = async () => {
    try {
      const response = await fetch("/api/account-status", {
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data?.isBanned) {
        if (timerId) {
          window.clearInterval(timerId);
        }

        mountBlockedState(data.supportBotUrl);
      }
    } catch {
      // Keep the current UI and retry on the next interval.
    }
  };

  const timerId = window.setInterval(() => {
    void poll();
  }, 15000);

  void poll();

  return () => {
    window.clearInterval(timerId);
  };
}

export async function getCsrfToken() {
  const response = await fetch("/api/auth/csrf", {
    cache: "no-store"
  });
  const data = await response.json();

  return data.csrfToken;
}

export async function submitAuthAction(action, fields) {
  const csrfToken = await getCsrfToken();
  const form = document.createElement("form");

  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries({ ...fields, csrfToken }).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export async function requestJson(url, options) {
  const response = await fetch(url, options);
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Не удалось выполнить запрос.");
  }

  return data;
}

export function authFrame({ title, subtitle, content }) {
  return `
    <div class="auth-shell">
      <section class="auth-hero">
        <p class="eyebrow">SMTeam</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-copy">${escapeHtml(subtitle)}</p>
      </section>
      <section class="auth-card">
        ${content}
      </section>
    </div>
  `;
}

export function dashboardFrame({ active, user, showAdmin, content }) {
  const links = [
    { href: "/projects", label: "Проекты", key: "projects" },
    { href: "/profile", label: "Профиль", key: "profile" }
  ];

  if (showAdmin) {
    links.push({ href: "/admin", label: "Админ", key: "admin" });
  }

  return `
    <div class="dashboard-shell">
      <div class="dashboard-layout">
        <aside class="section-sidebar">
          <a class="brand-link brand-link-sidebar" href="/projects">SMTeam</a>
          <div class="section-group">
            <p class="eyebrow">Навигация</p>
            <nav class="section-rail" aria-label="Разделы сайта">
              ${links
                .map(
                  (link) => `
                    <a
                      class="section-link${active === link.key ? " section-link-active" : ""}"
                      href="${link.href}"
                    >
                      ${link.label}
                    </a>
                  `
                )
                .join("")}
          </div>
          <div class="sidebar-user-block">
            <div class="sidebar-user-head">
              ${avatarMarkup(user?.image, user?.username || user?.email || "User", "sm")}
              <div class="stack-sm">
                <strong class="nav-username">${escapeHtml(user?.username || user?.email || "User")}</strong>
                <span class="muted">${escapeHtml(showAdmin ? "Администратор" : "Участник команды")}</span>
              </div>
            </div>
            <button class="logout-link" id="logout-button" type="button">Выйти</button>
          </div>
        </aside>
        <main class="page-shell">
          ${content}
        </main>
      </div>
    </div>
  `;
}

export function wireLogout() {
  const button = document.getElementById("logout-button");

  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    button.setAttribute("disabled", "disabled");

    try {
      await submitAuthAction("/api/auth/signout", {
        callbackUrl: "/login"
      });
    } catch {
      button.removeAttribute("disabled");
      alert("Не удалось выйти из аккаунта.");
    }
  });
}
