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
      <header class="topbar">
        <a class="brand-link" href="/projects">SMTeam</a>
        <nav class="nav-strip">
          ${links
            .map(
              (link) => `
                <a
                  class="nav-link${active === link.key ? " nav-link-active" : ""}"
                  href="${link.href}"
                >
                  ${link.label}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="nav-user-block">
          ${avatarMarkup(user?.image, user?.username || user?.email || "User", "sm")}
          <span class="nav-username">${escapeHtml(user?.username || user?.email || "User")}</span>
          <button class="button button-ghost" id="logout-button" type="button">Выйти</button>
        </div>
      </header>
      <main class="page-shell">
        ${content}
      </main>
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
