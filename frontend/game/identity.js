const ROLE_KEY = "gattini.role";
const ROLES = {
  A: { id: "riccardo", sprite: "/assets/sprites/cats/cat_riccardo.png" },
  B: { id: "virginia", sprite: "/assets/sprites/cats/cat_virginia.png" }
};

let role = null;

export function getRole() {
  if (role) return role;
  const stored = localStorage.getItem(ROLE_KEY);
  if (stored && ROLES[stored]) {
    role = stored;
  }
  return role;
}

export function setRole(nextRole) {
  if (!ROLES[nextRole]) return;
  role = nextRole;
  localStorage.setItem(ROLE_KEY, nextRole);
}

export function isRoleSet() {
  return Boolean(getRole());
}

export function getLocalUserId() {
  return role === "B" ? ROLES.B.id : ROLES.A.id;
}

export function getRemoteUserId() {
  return role === "B" ? ROLES.A.id : ROLES.B.id;
}

export function getLocalSprite() {
  return role === "B" ? ROLES.B.sprite : ROLES.A.sprite;
}

export function getRemoteSprite() {
  return role === "B" ? ROLES.A.sprite : ROLES.B.sprite;
}

export function initIdentityOverlay() {
  const overlay = document.getElementById("identity-overlay");
  const btnA = document.getElementById("choose-virginia"); // role B
  const btnB = document.getElementById("choose-riccardo"); // role A

  if (!overlay || !btnA || !btnB) return Promise.resolve(getRole());
  if (isRoleSet()) {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    return Promise.resolve(getRole());
  }

  return new Promise((resolve) => {
    const selectRole = (value) => {
      setRole(value);
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");
      resolve(value);
    };
    btnA.addEventListener("click", () => selectRole("B"));
    btnB.addEventListener("click", () => selectRole("A"));
  });
}

// Dev/testing helper
export function resetRole() {
  localStorage.removeItem(ROLE_KEY);
  role = null;
}
