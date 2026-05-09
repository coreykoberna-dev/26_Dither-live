(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let navIdSeed = 0;
  let activeNavId = "";
  const canonicalHashGroups = {
    "#components": "Components",
  };
  const nav = [
    {
      title: "Foundations",
      items: [
        ["Color", "#color"],
        ["Typography", "#type"],
        ["Spacing and grid", "#space"],
        ["Responsive scale", "#responsive"],
        ["Accessibility", "#access"],
        ["Interaction states", "#states"],
        ["Motion", "#motion"],
        ["QA gates", "#qa"],
      ],
    },
    {
      title: "Brand",
      items: [
        ["Overview", "#brand"],
        ["Animated pixel mark", "#brand-pixel-mark"],
        ["Logo type", "#brand-logotype"],
      ],
    },
    {
      title: "Styles",
      items: [
        ["Color", "#color"],
        ["Icons", "#icons"],
        ["Motion", "#motion"],
        ["Typography", "#type"],
        ["Spacing", "#space"],
        ["Responsive", "#responsive"],
      ],
    },
    {
      title: "Components",
      groups: [
        {
          title: "Material 3",
          items: [
            ["Actions", "#component-actions-button"],
            ["Feedback", "#component-communication-dialog"],
            ["Containers", "#component-containment-card"],
            ["Navigation", "#component-navigation-top-app-bar"],
            ["Selection", "#component-selection-checkbox"],
            ["Fields", "#component-inputs-text-field"],
          ],
        },
        {
          title: "Account",
          items: [
            ["Auth", "#component-auth-sign-in-form"],
            ["Menu", "#component-account-account-menu"],
            ["Profile", "#component-account-profile-settings"],
            ["Security", "#component-account-security-settings"],
            ["Team", "#component-account-team-and-seats"],
            ["Subscription", "#component-account-subscription-settings"],
          ],
        },
        {
          title: "Commerce",
          items: [
            ["Store", "#component-store-product-listing"],
            ["Cart", "#component-store-cart-drawer"],
            ["Checkout", "#component-store-checkout-shell"],
            ["Payment", "#component-billing-payment-method-form"],
            ["Invoices", "#component-billing-invoice-list"],
            ["Recovery", "#component-billing-payment-failure-recovery"],
          ],
        },
        {
          title: "Product",
          items: [
            ["Editor", "#component-workflows-preview-canvas"],
            ["Timeline", "#component-workflows-timeline-transport"],
            ["Algorithms", "#component-workflows-algorithm-picker"],
            ["Effects", "#component-workflows-effect-stack"],
            ["Export", "#component-workflows-export-meter"],
          ],
        },
      ],
    },
    {
      title: "Dither Workflows",
      items: [
        ["Editor", "#workflows"],
        ["Login and account", "#component-auth-sign-in-form"],
        ["Storefront", "#component-store-product-listing"],
        ["Checkout and billing", "#component-store-checkout-shell"],
        ["Header character", "#brand-pixel-mark"],
        ["Inspector", "#components"],
        ["Timeline", "#workflows"],
        ["Export", "#workflows"],
        ["Batch", "#workflows"],
        ["Dynamic theme seed", "#color"],
      ],
    },
    {
      title: "Governance",
      items: [
        ["Source files", "#governance"],
        ["Change path", "#governance"],
        ["Verification", "#qa"],
      ],
    },
  ];

  function createLink(label, href, className = "system-nav-link") {
    const link = document.createElement("a");
    navIdSeed += 1;
    link.className = className;
    link.href = href;
    link.textContent = label;
    link.dataset.navId = `nav-${navIdSeed}`;
    return link;
  }

  function smoothScrollToHash(hash, navId = "") {
    const target = document.querySelector(hash);
    if (!target) return false;
    target.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
    history.pushState({ systemNavId: navId }, "", hash);
    return true;
  }

  function findActiveCandidate(root, hash, preferredNavId = "") {
    const links = Array.from(root.querySelectorAll(".system-nav-link, .system-nav-leaf"));
    if (preferredNavId) {
      const preferred = links.find((link) => (
        link.dataset.navId === preferredNavId
        && link.getAttribute("href") === hash
      ));
      if (preferred) return preferred;
    }

    const canonicalGroup = canonicalHashGroups[hash];
    if (canonicalGroup) {
      const canonical = links.find((link) => (
        link.getAttribute("href") === hash
        && link.closest("details")?.querySelector("summary")?.textContent === canonicalGroup
      ));
      if (canonical) return canonical;
    }

    return links.find((link) => (
      link.classList.contains("system-nav-link")
      && link.getAttribute("href") === hash
    )) || links.find((link) => link.getAttribute("href") === hash) || null;
  }

  function parseMotionDuration(rawValue) {
    const value = rawValue.trim();
    if (!value) return 220;
    if (value.endsWith("ms")) return Number.parseFloat(value) || 220;
    if (value.endsWith("s")) return (Number.parseFloat(value) || 0.22) * 1000;
    return Number.parseFloat(value) || 220;
  }

  function getNavMotionDuration(details) {
    if (reducedMotion.matches) return 20;
    const value = window.getComputedStyle(details).getPropertyValue("--nav-motion-duration");
    return parseMotionDuration(value) + 80;
  }

  function clearNavMotionTimer(details) {
    const timer = details.navMotionTimer;
    if (timer) window.clearTimeout(timer);
    details.navMotionTimer = 0;
  }

  function markNavOpening(details) {
    clearNavMotionTimer(details);
    details.classList.remove("is-closing");
    details.classList.add("is-opening");
    details.navMotionTimer = window.setTimeout(() => {
      details.classList.remove("is-opening");
      details.navMotionTimer = 0;
    }, getNavMotionDuration(details));
  }

  function closeNavDetails(details) {
    if (!details.open || details.classList.contains("is-closing")) return;
    clearNavMotionTimer(details);
    details.classList.remove("is-opening");
    details.classList.add("is-closing");
    details.navMotionTimer = window.setTimeout(() => {
      details.open = false;
      details.classList.remove("is-closing");
      details.navMotionTimer = 0;
    }, getNavMotionDuration(details));
  }

  function setActiveLink(root, preferredNavId = activeNavId) {
    const hash = window.location.hash || "#system-title";
    root.querySelectorAll(".system-nav-link, .system-nav-leaf").forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });

    const active = findActiveCandidate(root, hash, preferredNavId);
    if (!active) {
      activeNavId = "";
      return;
    }

    active.classList.add("is-active");
    active.setAttribute("aria-current", "location");
    activeNavId = active.dataset.navId || "";
    active.closest("details")?.setAttribute("open", "");
  }

  function renderNav() {
    const root = document.querySelector("[data-system-left-nav]");
    if (!root) return;

    navIdSeed = 0;
    const shell = document.createElement("nav");
    shell.className = "system-nav-rail";
    shell.setAttribute("aria-label", "Design system sections");

    const title = document.createElement("p");
    title.className = "system-nav-title";
    title.textContent = "Dither Wizard DS";
    shell.appendChild(title);

    nav.forEach((section) => {
      const details = document.createElement("details");
      details.className = "system-nav-group";
      details.open = ["Foundations", "Brand", "Styles"].includes(section.title);
      details.addEventListener("toggle", () => {
        if (details.open) markNavOpening(details);
      });

      const summary = document.createElement("summary");
      summary.textContent = section.title;
      details.appendChild(summary);

      if (section.items) {
        const list = document.createElement("div");
        list.className = "system-nav-list";
        section.items.forEach(([label, href]) => list.appendChild(createLink(label, href)));
        details.appendChild(list);
      }

      if (section.groups) {
        section.groups.forEach((group) => {
          const subgroup = document.createElement("div");
          subgroup.className = "system-nav-subgroup";
          const heading = document.createElement("span");
          heading.textContent = group.title;
          subgroup.appendChild(heading);
          group.items.forEach((item) => {
            const label = Array.isArray(item) ? item[0] : item;
            const href = Array.isArray(item) ? item[1] : "#components";
            subgroup.appendChild(createLink(label, href, "system-nav-leaf"));
          });
          details.appendChild(subgroup);
        });
      }

      shell.appendChild(details);
    });

    root.replaceChildren(shell);
    setActiveLink(root);
    window.addEventListener("hashchange", () => setActiveLink(root));
    window.addEventListener("popstate", (event) => {
      activeNavId = event.state?.systemNavId || "";
      setActiveLink(root, activeNavId);
    });
    root.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const summary = target?.closest("summary");
      if (summary && root.contains(summary)) {
        const details = summary.closest("details");
        if (details?.open) {
          event.preventDefault();
          closeNavDetails(details);
        }
        return;
      }
      const link = target?.closest("a");
      if (!link || !root.contains(link)) return;
      const href = link.getAttribute("href") || "";
      const nextNavId = link.dataset.navId || "";
      if (href.startsWith("#") && smoothScrollToHash(href, nextNavId)) event.preventDefault();
      activeNavId = nextNavId;
      requestAnimationFrame(() => setActiveLink(root, activeNavId));
    });
  }

  function initScrollReveal() {
    const shell = document.querySelector(".system-shell");
    const targets = document.querySelectorAll([
      ".system-hero",
      ".system-section",
      ".system-panel",
      ".brand-subsection",
      ".brand-character-specimen",
      ".brand-logotype-specimen",
      ".brand-detail-card",
      ".sprite-state-card",
      ".sprite-build-step",
      ".state-row",
      ".access-row",
      ".component-catalog",
      ".qa-grid article",
    ].join(","));

    if (!shell || !targets.length) return;
    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    shell.classList.add("is-reveal-ready");
    targets.forEach((target) => target.classList.add("reveal-on-scroll"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

    targets.forEach((target) => observer.observe(target));
  }

  renderNav();
  initScrollReveal();
})();
