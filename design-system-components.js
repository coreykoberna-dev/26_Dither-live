(function () {
  const componentFamilies = [
    {
      id: "actions",
      label: "Actions",
      lead: "Commands that mutate the image, queue, preset library, or export state.",
      components: [
        {
          name: "Button",
          intent: "Primary, secondary, destructive, loading, disabled, icon-leading, and compact variants.",
          states: ["default", "hover", "focus", "pressed", "selected", "loading", "disabled", "error"],
          tokens: "Uses primary, secondary, error, outline, focus ring, and on-color roles.",
          access: "Minimum 44px touch target, visible label, aria-busy while rendering.",
          product: "Process, export, reset, randomize, save preset, clear queue.",
        },
        {
          name: "Floating action button",
          intent: "Pinned high-emphasis command for the one action that should stay reachable while inspecting output.",
          states: ["default", "hover", "focus", "pressed", "loading", "disabled"],
          tokens: "Primary container, on-primary-container, focus ring, elevated action plane.",
          access: "Use one visible label or a labelled icon. Never cover canvas metadata or timeline controls.",
          product: "Capture frame, record loop, or run batch when the workspace is scrolled.",
        },
        {
          name: "Icon button",
          intent: "Dense single-purpose action with tooltip and accessible label.",
          states: ["default", "hover", "focus", "pressed", "selected", "disabled"],
          tokens: "24-grid pixel glyph, currentColor, transparent default surface.",
          access: "Never icon-only without aria-label. Tooltip names the command, not the icon shape.",
          product: "Fullscreen, theme, step frame, lock seed, remove effect.",
        },
        {
          name: "Icon",
          intent: "Standalone symbolic mark for actions, state, and metadata when text already supplies meaning.",
          states: ["decorative", "labelled", "filled", "outlined", "disabled"],
          tokens: "24px symbol box, currentColor, optical-size pairing, pixelarticons source.",
          access: "Decorative icons are hidden. Standalone icons need an accessible name.",
          product: "Route marks, payment state, account badges, editor tool labels.",
        },
        {
          name: "Segmented control",
          intent: "Mutually exclusive mode switching with fixed-height items and overflow-safe labels.",
          states: ["default", "selected", "focus", "disabled"],
          tokens: "Segment background, active background, outline, primary text.",
          access: "Use roving focus or native buttons in a named group.",
          product: "Output, split, source, mask, vectors, motion modes.",
        },
        {
          name: "Split button",
          intent: "Default command plus adjacent menu for related command variants.",
          states: ["default", "menu open", "focus", "loading", "disabled"],
          tokens: "Primary action fill, outline divider, menu surface, elevation level 2.",
          access: "Main action and menu trigger have separate labels.",
          product: "Export PNG by default, open SVG, WebM, palette JSON, copy CSS.",
        },
        {
          name: "Action group",
          intent: "Toolbar cluster for tightly related controls with one visual rhythm.",
          states: ["default", "selected", "focus", "overflow", "disabled"],
          tokens: "Open row, hairline separators, compact spacing, currentColor icons.",
          access: "Provide group label and preserve tab order left to right.",
          product: "Undo, redo, compare, fit, zoom, snap, crop.",
        },
        {
          name: "State layer and ripple",
          intent: "Shared interaction feedback for hover, focus, press, drag, and selected states.",
          states: ["hover", "focus", "pressed", "dragged", "selected", "disabled"],
          tokens: "State layer opacity, primary/on-surface roles, reduced-motion fallback.",
          access: "State feedback reinforces keyboard focus and never replaces visible labels.",
          product: "Buttons, menu rows, tabs, product cards, payment method rows.",
        },
        {
          name: "Focus ring",
          intent: "Visible keyboard focus treatment independent from hover or selected state.",
          states: ["hidden", "visible", "inset", "outer", "invalid"],
          tokens: "Focus ring color, offset, thickness, error focus override.",
          access: "Every interactive specimen keeps a visible focus style at 3:1 contrast or better.",
          product: "Forms, menus, icon buttons, checkout steps, account rows.",
        },
        {
          name: "Quick trigger",
          intent: "High-priority floating or pinned command without decorative card treatment.",
          states: ["default", "hover", "focus", "pressed", "disabled"],
          tokens: "Primary role, focus ring, active glow, reduced-motion safe scan.",
          access: "Avoid covering canvas controls or status text.",
          product: "Capture frame, cast preview, run batch, record loop.",
        },
      ],
    },
    {
      id: "communication",
      label: "Communication",
      lead: "Feedback, interruption, status, and instructional signals that help users recover without leaving flow.",
      components: [
        {
          name: "Banner",
          intent: "Persistent inline notice for system-wide state.",
          states: ["info", "success", "warning", "error", "dismissed"],
          tokens: "Surface container, semantic role, outline variant, icon currentColor.",
          access: "Include text label and action. Do not rely on warning color alone.",
          product: "Unsupported video codec, palette extracted, low contrast warning.",
        },
        {
          name: "Dialog",
          intent: "Blocking confirmation for destructive or irreversible choices.",
          states: ["open", "focus trapped", "submitting", "error"],
          tokens: "Surface container high, scrim, focus ring, action hierarchy.",
          access: "Use aria-modal, labelled title, initial focus, Escape close when safe.",
          product: "Delete preset, clear batch, overwrite export.",
        },
        {
          name: "Snackbar",
          intent: "Short-lived confirmation with optional undo.",
          states: ["queued", "visible", "actioned", "dismissed"],
          tokens: "Inverse surface, inverse on-surface, primary action accent.",
          access: "Announce politely. Keep action reachable by keyboard.",
          product: "Preset saved, export copied, effect duplicated.",
        },
        {
          name: "Tooltip",
          intent: "Names dense controls and explains unfamiliar pixel glyphs.",
          states: ["hover", "focus", "delayed", "dismissed"],
          tokens: "Inverse surface, small mono type, 4px radius.",
          access: "Do not hide required instructions in tooltips.",
          product: "Icon-only canvas controls, timeline transport, palette lock.",
        },
        {
          name: "Progress indicator",
          intent: "Determinate or indeterminate processing feedback.",
          states: ["idle", "running", "paused", "complete", "failed"],
          tokens: "Primary sweep, track outline, success, error, reduced-motion fallback.",
          access: "Expose aria-valuenow when determinate and text status when long-running.",
          product: "Dither render, batch progress, video frame extraction.",
        },
        {
          name: "Badge",
          intent: "Small count, category, or metadata marker attached to another component.",
          states: ["neutral", "count", "selected", "warning", "error", "hidden"],
          tokens: "Outline variant, muted mono text, semantic tint only when stateful.",
          access: "Badge text must be present in the related control label or nearby copy when it carries meaning.",
          product: "63 algorithms, format tags, preset counts, icon library result counts.",
        },
        {
          name: "Status chip",
          intent: "Compact operational state label for recording, queue, seed, export, or render status.",
          states: ["neutral", "selected", "loading", "success", "warning", "error"],
          tokens: "Semantic tint, outline, mono label, optional pixel glyph.",
          access: "Use readable text. Color is reinforcement only.",
          product: "Recording, over budget, seed locked, queued, complete, failed.",
        },
        {
          name: "Inline alert",
          intent: "Local feedback beside a form, checkout step, or settings section.",
          states: ["info", "success", "warning", "error", "recoverable", "dismissed"],
          tokens: "Semantic role, outline, compact copy, optional action row.",
          access: "Alert text describes the issue and the next action without color-only meaning.",
          product: "Invalid credentials, expired session, saved settings, failed payment.",
        },
        {
          name: "Empty state",
          intent: "Instructional blank state for lists, tables, carts, libraries, and account areas.",
          states: ["empty", "first use", "filtered empty", "locked", "offline"],
          tokens: "Muted text, primary action, secondary action, optional specimen frame.",
          access: "Keep the next action reachable and avoid generic no-content copy.",
          product: "Empty cart, no invoices, no team members, no owned packs.",
        },
        {
          name: "Skeleton",
          intent: "Stable loading placeholder for rows, cards, forms, and billing tables.",
          states: ["loading row", "loading card", "loading field", "reduced motion"],
          tokens: "Surface tint, scan motion, reduced-motion static block.",
          access: "Use aria-busy on the owning region and avoid focusable skeleton content.",
          product: "Store listing load, invoice history load, entitlement sync.",
        },
      ],
    },
    {
      id: "containment",
      label: "Containment",
      lead: "Structures that group operational controls without turning the page into stacked boxes.",
      components: [
        {
          name: "Card",
          intent: "Repeated item container only; never a page section wrapper or card inside another card.",
          states: ["default", "hover", "focus", "selected", "loading", "disabled"],
          tokens: "Surface container low, outline variant, 4px radius, compact spacing.",
          access: "If clickable, use button or link semantics for the actual action, not a hidden full-card trap.",
          product: "Preset tile, export history item, icon inventory result, asset specimen.",
        },
        {
          name: "Carousel",
          intent: "Horizontal browsing for visual specimens where comparison matters more than vertical reading.",
          states: ["default", "selected", "scrolling", "overflow", "empty"],
          tokens: "Frame surface, selected outline, scroll shadows, reduced-motion safe snapping.",
          access: "Provide keyboard previous/next controls and visible item position.",
          product: "Sprite states, palette ramps, batch thumbnails, before/after looks.",
        },
        {
          name: "Pane",
          intent: "Primary workbench region with independent scrolling and stable density.",
          states: ["default", "resized", "collapsed", "empty", "loading"],
          tokens: "Pane surface, border line, scrollbar, sticky subheader.",
          access: "Keep pane headings programmatic and preserve keyboard scroll access.",
          product: "Ingest, preview, algorithm, effects, export panes.",
        },
        {
          name: "Panel",
          intent: "Local group of related controls using rules and rhythm, not heavy containers.",
          states: ["default", "expanded", "collapsed", "disabled"],
          tokens: "Transparent background, hairline rules, section labels, compact spacing.",
          access: "Heading hierarchy must remain clear when panels collapse.",
          product: "Adjustment rack, palette lab, file-size equipment.",
        },
        {
          name: "List row",
          intent: "Repeated object row with status, actions, and dense metadata.",
          states: ["default", "hover", "selected", "loading", "error", "dragging"],
          tokens: "Open row, focus ring, state chip, icon slot.",
          access: "Full row is not a hidden button unless it has button semantics.",
          product: "Batch item, preset row, effect stack row, export history.",
        },
        {
          name: "Divider and rule",
          intent: "Relationship marker between groups, rows, and diagnostics.",
          states: ["dim", "standard", "active", "semantic"],
          tokens: "Outline variant, primary accent segment, no thick side stripe.",
          access: "Decorative rules are aria-hidden.",
          product: "Section breaks, row separators, meter baselines.",
        },
        {
          name: "Elevation surface",
          intent: "Layering model for sheets, dialogs, menus, and raised commerce surfaces.",
          states: ["level 0", "level 1", "level 2", "level 3", "scrimmed"],
          tokens: "Surface container roles, elevation shadow, tonal overlay, outline.",
          access: "Elevation never carries meaning by itself; text and structure still identify the layer.",
          product: "Cart drawer, menu, checkout review, payment recovery, dialogs.",
        },
        {
          name: "Details and accordion",
          intent: "Progressive disclosure for dense documentation or advanced controls.",
          states: ["closed", "opening", "open", "focus", "disabled"],
          tokens: "Summary row, expander glyph, motion-fast, reduced-motion respect.",
          access: "Native details preferred. Summary text must describe hidden content.",
          product: "Component catalog, advanced effect settings, QA notes.",
        },
        {
          name: "Bottom sheet",
          intent: "Mobile-first temporary surface for dense controls that cannot fit beside the preview.",
          states: ["closed", "opening", "open", "scrimmed", "dismissed"],
          tokens: "Surface container high, top handle, scrim, compact header.",
          access: "Trap focus when modal, support Escape/close, and restore focus to the trigger.",
          product: "Mobile algorithm controls, export settings, preset browser.",
        },
        {
          name: "Side sheet",
          intent: "Desktop or tablet side surface for temporary configuration without leaving the editor.",
          states: ["closed", "opening", "open", "resized", "dismissed"],
          tokens: "Pane surface, elevation level 3, outline, sticky header.",
          access: "Use labelled region semantics and keep close controls keyboard reachable.",
          product: "Advanced palette settings, batch details, export manifests.",
        },
        {
          name: "Frame strip",
          intent: "Horizontal collection of previews or steps with dense scanning.",
          states: ["default", "selected", "loading", "overflow", "empty"],
          tokens: "Canvas border, selected outline, timeline track, thumbnail surface.",
          access: "Arrow navigation and visible selected label.",
          product: "Timeline frames, batch thumbnails, palette swatches.",
        },
        {
          name: "Data table",
          intent: "Structured rows for invoices, sessions, team members, receipts, and audit events.",
          states: ["default", "sorted", "selected", "empty", "loading", "error"],
          tokens: "Rule-separated rows, header labels, status chips, row actions.",
          access: "Use real table semantics or equivalent grid roles when rows are interactive.",
          product: "Invoice list, active sessions, team seats, store order history.",
        },
        {
          name: "Settings row",
          intent: "Reusable account-management row with label, description, state, and action.",
          states: ["default", "dirty", "saving", "saved", "warning", "disabled"],
          tokens: "Open row, muted description, compact action, status chip.",
          access: "Action label must include enough context when repeated in a settings list.",
          product: "Profile field, MFA setting, notification switch, subscription control.",
        },
      ],
    },
    {
      id: "navigation",
      label: "Navigation",
      lead: "Movement between product areas, documentation families, and local views.",
      components: [
        {
          name: "Top app bar",
          intent: "Primary page chrome with route identity, account access, search, and high-priority commands.",
          states: ["default", "scrolled", "searching", "menu open", "mobile"],
          tokens: "Topbar surface, icon button slots, route label, focus ring.",
          access: "Use labelled navigation and action regions; current page remains explicit.",
          product: "Product header, store header, account header, checkout shell.",
        },
        {
          name: "Bottom app bar",
          intent: "Mobile action bar for key commerce or editor actions near the thumb zone.",
          states: ["default", "fab docked", "overflow", "hidden", "disabled"],
          tokens: "Bottom surface, FAB cutout, icon buttons, active route tint.",
          access: "Primary action and overflow action remain labelled and keyboard reachable.",
          product: "Mobile checkout, mobile editor export, account save state.",
        },
        {
          name: "Shared header",
          intent: "Global product identity, primary routes, theme, and fullscreen controls.",
          states: ["default", "current route", "focus", "mobile wrap"],
          tokens: "Topbar surface, mono route labels, icon buttons, focus ring.",
          access: "Use a named nav region and preserve logical order.",
          product: "Home, Contact, Design System, theme toggle, fullscreen.",
        },
        {
          name: "Navigation bar",
          intent: "Small-screen route strip when the full header needs to collapse.",
          states: ["default", "current route", "focus", "overflow"],
          tokens: "Top or bottom surface, current route accent, icon plus text rhythm.",
          access: "Expose current route with aria-current and keep labels visible at narrow widths.",
          product: "Home, Design System, editor, export, saved presets.",
        },
        {
          name: "Navigation drawer",
          intent: "Temporary route and section list for mobile or narrow documentation views.",
          states: ["closed", "opening", "open", "current route", "dismissed"],
          tokens: "Surface container high, scrim, section labels, active row.",
          access: "Trap focus while modal, close on Escape, restore focus to trigger.",
          product: "Design-system section browser and future mobile editor navigation.",
        },
        {
          name: "Navigation rail",
          intent: "Persistent narrow rail for large documentation maps or future editor tools.",
          states: ["default", "active", "expanded group", "collapsed group", "focus"],
          tokens: "Rail surface, active accent, section labels, dim inactive text.",
          access: "Only the current destination owns aria-current. Group toggles remain native buttons or summaries.",
          product: "Design-system left rail and future tool category rail.",
        },
        {
          name: "Documentation rail",
          intent: "Compact left rail for system sections and subsections.",
          states: ["collapsed group", "expanded group", "active", "focus"],
          tokens: "Rail surface, single-select active state, green accent, dim inactive text.",
          access: "Only one item owns aria-current at a time.",
          product: "Design-system section navigation.",
        },
        {
          name: "Tabs",
          intent: "Major section switching without deep vertical expansion.",
          states: ["selected", "hover", "focus", "overflow", "disabled"],
          tokens: "Tab rail, active scan line, panel reveal motion.",
          access: "Use role tablist, roving focus, arrow keys, labelled panels.",
          product: "Component families, icon styles, preview modes.",
        },
        {
          name: "Breadcrumb and path",
          intent: "Orientation for nested documentation or batch paths.",
          states: ["default", "current", "overflow"],
          tokens: "Muted mono labels, current text, separator glyph.",
          access: "Use nav label and mark the current page.",
          product: "Design System / Components / Navigation.",
        },
        {
          name: "Search and command entry",
          intent: "Fast filtering or direct navigation by keyword.",
          states: ["empty", "typing", "results", "no results", "loading"],
          tokens: "Text field, search glyph, surface container, result rows.",
          access: "Announce result count and support Escape clear.",
          product: "Icon library search, algorithm filter, preset finder.",
        },
        {
          name: "Footer",
          intent: "Compact persistent route and repo access at document end.",
          states: ["default", "hover", "focus"],
          tokens: "Footer surface, link underline/focus, compact spacing.",
          access: "Links remain visible and keyboard reachable.",
          product: "Home, Design System, Contact, GitHub Repo.",
        },
      ],
    },
    {
      id: "selection",
      label: "Selection",
      lead: "Controls for choosing modes, toggles, values, palettes, and queue membership.",
      components: [
        {
          name: "Checkbox",
          intent: "Independent binary or multi-select choice.",
          states: ["unchecked", "checked", "indeterminate", "focus", "disabled", "error"],
          tokens: "Outline, primary fill, error outline, check glyph.",
          access: "Native input preferred. Label target includes visible text.",
          product: "Batch item select, export layers, preserve alpha.",
        },
        {
          name: "Radio",
          intent: "Single choice in a small exclusive group.",
          states: ["unchecked", "checked", "focus", "disabled", "error"],
          tokens: "Primary dot, outline, mono group label.",
          access: "Use fieldset and legend for groups.",
          product: "Palette mode, scaling method, output target.",
        },
        {
          name: "Switch",
          intent: "Immediate on/off setting with clear state persistence.",
          states: ["off", "on", "focus", "disabled"],
          tokens: "Track surface, primary thumb, text label.",
          access: "Label states in text when meaning is not obvious.",
          product: "Motion dither, lock seed, invert, transparency.",
        },
        {
          name: "Slider",
          intent: "Continuous numeric adjustment with live output.",
          states: ["default", "focus", "dragging", "disabled", "error"],
          tokens: "Track, fill, thumb, numeric output, focus ring.",
          access: "Expose min, max, value, and keyboard increments.",
          product: "Threshold, contrast, scale, scanline speed, noise.",
        },
        {
          name: "Chips",
          intent: "Compact selectable metadata, filter, or removable token.",
          states: ["default", "selected", "focus", "removable", "disabled"],
          tokens: "Outline, selected fill, icon slot, close glyph.",
          access: "Selected state must be announced and removable chips have labelled buttons.",
          product: "Algorithm tags, file formats, preset filters.",
        },
        {
          name: "Menu and listbox",
          intent: "Dense option selection with grouping and keyboard navigation.",
          states: ["closed", "open", "highlighted", "selected", "invalid"],
          tokens: "Menu surface, active row, group label, elevation.",
          access: "Support arrows, Home, End, Escape, and typeahead where possible.",
          product: "Dither algorithm list, export format, color space.",
        },
        {
          name: "Date picker",
          intent: "Calendar choice for billing history filters, receipts, and scheduled account events.",
          states: ["empty", "selected", "open", "invalid", "disabled"],
          tokens: "Field surface, picker surface, selected day primary role, error role.",
          access: "Custom calendars need keyboard grid navigation; native date input is acceptable where possible.",
          product: "Invoice filter, refund date, scheduled asset batch, changelog metadata.",
        },
        {
          name: "Time picker",
          intent: "Time or duration choice for export windows, timestamps, and scheduling metadata.",
          states: ["empty", "selected", "open", "invalid", "disabled"],
          tokens: "Field surface, picker surface, active option, unit labels.",
          access: "Expose hour, minute, timezone, or duration context in text.",
          product: "Loop start labels, receipt timestamps, scheduled export metadata.",
        },
        {
          name: "Palette swatch group",
          intent: "Selectable color ramps and extracted seed colors.",
          states: ["default", "selected", "locked", "invalid contrast"],
          tokens: "Swatch geometry, primary outline, warning/error state.",
          access: "Each swatch has a text name or value.",
          product: "Dynamic theme seed, limited palette, print palette.",
        },
      ],
    },
    {
      id: "inputs",
      label: "Text Inputs",
      lead: "Typed entry, search, upload, and numeric control with strong validation states.",
      components: [
        {
          name: "Text field",
          intent: "Single-line naming, notes, and small configuration values.",
          states: ["empty", "filled", "hover", "focus", "disabled", "invalid"],
          tokens: "Field surface, outline, label text, error role.",
          access: "Programmatic label, helper text, error text, autocomplete when useful.",
          product: "Preset name, export filename, project label.",
        },
        {
          name: "Search field",
          intent: "Filter large lists without page navigation.",
          states: ["empty", "typing", "results", "no results", "clearable"],
          tokens: "Search icon, field surface, result count, focus ring.",
          access: "Announce result count and provide clear button label.",
          product: "Algorithm search, icon library filter, preset finder.",
        },
        {
          name: "Textarea",
          intent: "Longer notes, prompts, and preset descriptions.",
          states: ["empty", "filled", "focus", "resizing", "invalid"],
          tokens: "Field surface, outline, helper text, count text.",
          access: "Resize must not break surrounding controls.",
          product: "Preset notes, export comments, design-system annotations.",
        },
        {
          name: "Select field",
          intent: "Single choice when options are known and compact.",
          states: ["closed", "open", "selected", "focus", "disabled", "invalid"],
          tokens: "Field surface, menu surface, selected row, caret glyph.",
          access: "Native select is acceptable where custom behavior is not required.",
          product: "Palette, format, algorithm family, aspect ratio.",
        },
        {
          name: "Autocomplete field",
          intent: "Text entry backed by suggestions for countries, addresses, commands, and product search.",
          states: ["empty", "typing", "suggestions", "selected", "no result", "invalid"],
          tokens: "Text field, menu surface, active option, helper/error text.",
          access: "Use combobox semantics, active descendant, Escape clear, and announced result count.",
          product: "Billing address, country and region, command palette, store search.",
        },
        {
          name: "Number field and stepper",
          intent: "Precise numeric input with bounded increments.",
          states: ["default", "focus", "stepping", "invalid", "disabled"],
          tokens: "Field surface, step buttons, unit label, error text.",
          access: "Expose units and min/max. Do not rely on slider alone for precision.",
          product: "Width, height, frame rate, color count, file budget.",
        },
        {
          name: "File input and dropzone",
          intent: "Source image, video, and batch ingestion.",
          states: ["empty", "drag over", "uploading", "accepted", "rejected", "error"],
          tokens: "Drop surface, outline, progress, success/error roles.",
          access: "Keyboard-accessible button remains available next to drag and drop.",
          product: "Image upload, video capture, batch folder replacement.",
        },
        {
          name: "Range and frame fields",
          intent: "Start, end, loop, and clip range entry.",
          states: ["empty", "filled", "linked", "invalid range", "disabled"],
          tokens: "Text field, timeline accent, warning role, helper text.",
          access: "Validate relationships and announce range errors.",
          product: "Video trim, GIF loop, export frame window.",
        },
        {
          name: "Password field",
          intent: "Credential entry with reveal, strength, invalid, locked, and reset affordances.",
          states: ["empty", "filled", "revealed", "weak", "invalid", "disabled"],
          tokens: "Field surface, helper text, warning/error roles, icon button slot.",
          access: "Keep a visible label, autocomplete attribute, and textual password requirements.",
          product: "Sign in, sign up, password reset, sensitive account changes.",
        },
        {
          name: "One-time code field",
          intent: "Verification or recovery code entry that supports paste and resend timing.",
          states: ["empty", "typing", "complete", "invalid", "expired", "resending"],
          tokens: "Code cells, focus ring, warning timer, inline error.",
          access: "Support one-time-code autocomplete and announce invalid or expired codes.",
          product: "Email verification, MFA, payment method update confirmation.",
        },
        {
          name: "Validation summary",
          intent: "Form-level error and warning list that points users to fields requiring action.",
          states: ["hidden", "warning", "error", "field linked", "resolved"],
          tokens: "Semantic role, compact list, field links, focus target.",
          access: "Move focus to the summary on submit failure and link each item to a control.",
          product: "Signup, checkout, billing address, profile save.",
        },
      ],
    },
    {
      id: "auth",
      label: "Auth",
      lead: "Login, signup, recovery, verification, and access-control surfaces for account-backed product flows.",
      components: [
        {
          name: "Sign-in form",
          intent: "Returning-user authentication with email, password, social or passkey options, remember state, and recovery path.",
          states: ["empty", "filled", "submitting", "invalid", "locked", "success"],
          tokens: "Field surface, primary action, error role, focus ring, muted helper text.",
          access: "Use labelled inputs, autocomplete values, clear error text, and no placeholder-only labels.",
          product: "Entry to saved presets, purchased packs, billing, and account settings.",
        },
        {
          name: "Sign-up form",
          intent: "New account creation with email, password, display name, consent, and plan context.",
          states: ["empty", "validating", "weak password", "email exists", "submitting", "complete"],
          tokens: "Primary action, helper text, warning/error roles, checkbox state, success state.",
          access: "Expose password requirements as text and keep terms consent as a real checkbox.",
          product: "Create account before saving cloud presets, buying assets, or starting paid export features.",
        },
        {
          name: "Verification challenge",
          intent: "Email code, authenticator code, recovery code, or passkey confirmation after sign-in.",
          states: ["waiting", "typing", "invalid code", "resend available", "verified", "expired"],
          tokens: "Code fields, progress/status chip, warning timer, focus ring.",
          access: "Single input or grouped fields must support paste, one-time-code autocomplete, and announced retry errors.",
          product: "MFA, email verification, sensitive account changes, payment method updates.",
        },
        {
          name: "Password reset",
          intent: "Request and complete password recovery without exposing whether an account exists.",
          states: ["request", "sent", "reset form", "expired link", "complete", "rate limited"],
          tokens: "Info/success/error roles, text fields, primary action, quiet confirmation panel.",
          access: "Confirmation copy must not depend on color and must describe the next action.",
          product: "Recover editor account access while preserving local-only media guarantees.",
        },
        {
          name: "Session state",
          intent: "Persistent signed-in, signed-out, expiring, and interrupted-session presentation.",
          states: ["signed out", "signed in", "syncing", "expiring", "expired", "offline"],
          tokens: "Avatar/initials, status chip, muted metadata, warning role for expiring sessions.",
          access: "Session warnings use live regions only when time-sensitive and never trap focus unexpectedly.",
          product: "Header account entry, preset sync state, store entitlement checks.",
        },
        {
          name: "Access gate",
          intent: "Inline permission, plan, login, or purchase requirement without hiding the surrounding context.",
          states: ["requires login", "requires plan", "locked", "loading entitlement", "unlocked"],
          tokens: "Panel rule, lock glyph, primary/secondary actions, warning or info role.",
          access: "Provide a clear action path and keep locked controls disabled with readable labels.",
          product: "Paid export formats, pack downloads, team presets, account-only history.",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      lead: "Settings and management surfaces for identity, security, subscription, teams, and communication preferences.",
      components: [
        {
          name: "Account menu",
          intent: "Compact signed-in menu with profile, plan, billing, store library, and sign-out routes.",
          states: ["closed", "open", "current account", "loading", "switching", "signed out"],
          tokens: "Menu surface, avatar token, route rows, danger action, focus ring.",
          access: "Menu trigger exposes user/account name and every menu row remains keyboard reachable.",
          product: "Header account switcher and route entry for future account-backed features.",
        },
        {
          name: "Profile settings",
          intent: "Editable name, email, avatar, locale, and account metadata.",
          states: ["view", "editing", "dirty", "saving", "saved", "invalid"],
          tokens: "Text fields, save bar, success/error roles, open row separators.",
          access: "Dirty state is textual and save/cancel order is predictable.",
          product: "Manage creator identity, export attribution, and account contact details.",
        },
        {
          name: "Security settings",
          intent: "Password, MFA, active sessions, passkeys, and recovery methods.",
          states: ["enabled", "disabled", "pending verification", "revoking", "error"],
          tokens: "Status chips, destructive actions, dialog/sheet tokens, warning role.",
          access: "Sensitive actions require explicit labels, confirmation, and focus restoration.",
          product: "Protect paid account access, saved presets, team libraries, and billing changes.",
        },
        {
          name: "Team and seats",
          intent: "Manage members, roles, invitations, seat limits, and pending access.",
          states: ["empty", "invited", "active", "owner", "over seat limit", "removed"],
          tokens: "List row, role menu, badge count, warning state, invite form.",
          access: "Role menus need keyboard selection and destructive removal needs confirmation.",
          product: "Future studio/team preset libraries and shared commercial licenses.",
        },
        {
          name: "Subscription settings",
          intent: "Plan name, renewal date, usage, limits, upgrade, downgrade, and cancellation path.",
          states: ["trial", "active", "past due", "cancelling", "cancelled", "upgrading"],
          tokens: "Plan status chip, usage meter, primary upgrade action, warning/error roles.",
          access: "Cancellation and downgrade flows must state consequences before confirmation.",
          product: "Manage export tiers, store benefits, team seats, and commercial usage limits.",
        },
        {
          name: "Notification preferences",
          intent: "Transactional, product, billing, and team notification settings.",
          states: ["default", "custom", "saving", "saved", "disabled"],
          tokens: "Switch rows, grouped labels, info helper text, success state.",
          access: "Every switch includes persistent text for the on/off consequence.",
          product: "Payment notices, export completion, team invites, product updates.",
        },
        {
          name: "Entitlement library",
          intent: "List purchased packs, active licenses, downloads, receipts, and install status.",
          states: ["empty", "owned", "downloading", "installed", "update available", "revoked"],
          tokens: "List row, download action, status chip, progress indicator.",
          access: "Download and install actions remain distinct and announce progress.",
          product: "Purchased algorithms, palette packs, effect packs, and commercial licenses.",
        },
        {
          name: "Settings section",
          intent: "Account page section with heading, description, rows, save state, and optional footer action.",
          states: ["default", "dirty", "saving", "saved", "error", "read-only"],
          tokens: "Section label, open rows, save bar, status chip, semantic state.",
          access: "Heading hierarchy and grouped controls remain programmatic.",
          product: "Profile, security, billing, notifications, subscription, team access.",
        },
        {
          name: "Danger zone",
          intent: "Sensitive account action area for cancellation, removal, revocation, or deletion.",
          states: ["available", "confirming", "blocked", "submitting", "complete"],
          tokens: "Error role, destructive button, confirmation dialog, audit text.",
          access: "State consequences are visible before confirmation and focus is restored after close.",
          product: "Cancel plan, delete account, revoke passkey, remove team member.",
        },
        {
          name: "Activity log",
          intent: "Audit trail for security events, billing changes, downloads, and team actions.",
          states: ["empty", "loaded", "filtered", "loading", "error"],
          tokens: "Data table, timestamp readout, status chip, muted metadata.",
          access: "Rows expose event, actor, timestamp, and affected object as text.",
          product: "Security history, payment changes, store downloads, team invites.",
        },
      ],
    },
    {
      id: "store",
      label: "Store",
      lead: "Commercial browsing, purchase, cart, checkout, and post-purchase surfaces for Dither Wizard assets and plans.",
      components: [
        {
          name: "Product listing",
          intent: "Browse packs, plans, effects, presets, or licenses with filters, ownership, and price state.",
          states: ["default", "filtered", "owned", "sale", "unavailable", "loading"],
          tokens: "Card/list row, price text, ownership badge, filter chips, focus ring.",
          access: "Product names, price, ownership, and primary action must be exposed as text.",
          product: "Algorithm packs, palette packs, workflow presets, team licenses.",
        },
        {
          name: "Product detail",
          intent: "Focused product view with preview, compatibility, license terms, price, and purchase action.",
          states: ["default", "owned", "previewing", "adding to cart", "unavailable", "error"],
          tokens: "Preview frame, metadata rows, primary action, badge, info/warning roles.",
          access: "Preview media must have text alternatives and purchase terms must be reachable before checkout.",
          product: "Inspect commercial packs before purchase without leaving the editor context.",
        },
        {
          name: "Cart drawer",
          intent: "Temporary cart surface with items, quantities, prices, discounts, and checkout action.",
          states: ["empty", "filled", "updating", "discount applied", "error", "checking out"],
          tokens: "Side sheet, list rows, price column, primary checkout button, error role.",
          access: "Quantity changes and removals announce updated totals.",
          product: "Collect packs, licenses, seats, or plan upgrades before payment.",
        },
        {
          name: "Checkout shell",
          intent: "Step or sectioned checkout for account, payment, tax, review, and confirmation.",
          states: ["account", "payment", "review", "processing", "complete", "failed"],
          tokens: "Stepper/path, field groups, order summary, primary action, error/success roles.",
          access: "Steps expose current state and failed fields move focus to the first actionable error.",
          product: "Purchase assets, subscribe, add seats, or renew a past-due account.",
        },
        {
          name: "Order summary",
          intent: "Line-item cost, subtotal, discounts, tax estimate, credits, and total.",
          states: ["loading", "estimated", "discounted", "tax pending", "final", "error"],
          tokens: "Dense rows, data readouts, warning/info text, divider rules.",
          access: "Totals are text, not only visual emphasis. Discount and tax changes are announced.",
          product: "Checkout, billing review, plan changes, and invoices.",
        },
        {
          name: "Discount code",
          intent: "Promo, credit, coupon, or gift-code entry with validation and removal.",
          states: ["empty", "validating", "applied", "invalid", "expired", "removed"],
          tokens: "Text field, status chip, success/error roles, remove action.",
          access: "Validation result is linked to the field and readable after focus moves.",
          product: "Launch coupons, team credits, store gift codes.",
        },
        {
          name: "Purchase confirmation",
          intent: "Post-payment success state with receipt, entitlement activation, download, and next action.",
          states: ["processing", "complete", "entitlements syncing", "partial failure", "retry"],
          tokens: "Success role, receipt rows, download action, progress/status chips.",
          access: "Confirmation identifies what changed and where the user can find it later.",
          product: "Activate purchased packs, unlock plan features, save receipt.",
        },
        {
          name: "Product card",
          intent: "Reusable store item surface with preview, name, price, ownership, compatibility, and action.",
          states: ["default", "hover", "owned", "sale", "unavailable", "loading"],
          tokens: "Card surface, preview frame, price row, ownership badge, focus ring.",
          access: "Do not hide price, ownership, or license terms in image-only content.",
          product: "Pack grids, preset bundles, plan add-ons, license catalog.",
        },
        {
          name: "Price row",
          intent: "Compact price, discount, credit, tax, and total line item.",
          states: ["estimated", "discounted", "credited", "tax pending", "final"],
          tokens: "Data readout, divider rule, semantic warning/info text.",
          access: "Every amount has a text label and total changes are announced when dynamic.",
          product: "Product detail, cart drawer, checkout, invoice, receipt.",
        },
        {
          name: "Plan selector",
          intent: "Choice control for free, pro, team, annual, monthly, and seat-based plans.",
          states: ["default", "selected", "current", "recommended", "disabled", "loading"],
          tokens: "Segment or card selection, status chip, price row, feature list.",
          access: "Current plan and selected plan are distinguishable without relying on color.",
          product: "Signup plan context, upgrade, downgrade, team seat purchase.",
        },
      ],
    },
    {
      id: "billing",
      label: "Billing",
      lead: "Payment, invoice, tax, subscription, failure, and refund UI that keeps money movement explicit.",
      components: [
        {
          name: "Payment method form",
          intent: "Add card, wallet, bank, or payment provider details inside a secure provider-owned field area.",
          states: ["empty", "focused", "validating", "invalid", "saving", "saved"],
          tokens: "Secure field frame, provider badge, error role, focus ring, helper text.",
          access: "Provider fields need visible labels, error text, and keyboard focus proof.",
          product: "Store checkout, subscription setup, payment method update.",
        },
        {
          name: "Saved payment method",
          intent: "Display card or wallet method with default, expired, removable, and update states.",
          states: ["default", "selected", "expired", "updating", "removing", "error"],
          tokens: "List row, status chip, semantic warning, destructive action.",
          access: "Never display full payment details. Removal requires labelled confirmation.",
          product: "Account billing, checkout payment selection, past-due recovery.",
        },
        {
          name: "Billing address",
          intent: "Address, tax region, VAT or business identity entry with validation and country-specific fields.",
          states: ["empty", "filled", "validating", "invalid", "saved", "read-only"],
          tokens: "Field groups, select field, error role, helper text.",
          access: "Autocomplete values and grouped address labels must remain programmatic.",
          product: "Tax calculation, invoices, commercial license records.",
        },
        {
          name: "Invoice list",
          intent: "Historical invoice rows with date, amount, status, download, and retry affordances.",
          states: ["empty", "paid", "open", "past due", "void", "loading"],
          tokens: "Data rows, status chip, download action, warning/error roles.",
          access: "Invoice status and amount are text and rows expose direct download links.",
          product: "Billing history and business record keeping.",
        },
        {
          name: "Receipt detail",
          intent: "Detailed paid transaction record with line items, taxes, payment method, and downloads.",
          states: ["loading", "paid", "refunded", "partially refunded", "error"],
          tokens: "Data readouts, line rows, success/warning roles, print/download action.",
          access: "Receipt can be printed/downloaded and line-item totals are readable in order.",
          product: "Proof of purchase for packs, subscriptions, and seats.",
        },
        {
          name: "Payment failure recovery",
          intent: "Past-due or failed payment state with retry, new method, grace period, and service impact.",
          states: ["soft fail", "past due", "retrying", "recovered", "suspended", "cancelled"],
          tokens: "Error/warning roles, status chip, primary retry action, access gate.",
          access: "Explain impact and next action without alarm-only color.",
          product: "Restore subscription, preserve access to purchased entitlements, prevent silent lockout.",
        },
        {
          name: "Refund and cancellation",
          intent: "Explicit cancellation, refund request, or downgrade flow with reason, impact, and confirmation.",
          states: ["eligible", "ineligible", "confirming", "submitted", "approved", "denied"],
          tokens: "Dialog/side sheet, warning role, destructive action, confirmation status.",
          access: "Consequences and dates must be visible before final confirmation.",
          product: "Cancel plan, refund duplicate purchase, remove team seats.",
        },
        {
          name: "Checkout stepper",
          intent: "Step indicator for account, payment, review, processing, and confirmation.",
          states: ["upcoming", "current", "complete", "blocked", "failed"],
          tokens: "Segmented path, progress state, semantic warning/error roles.",
          access: "Expose current step, completed steps, and blocked reason to assistive tech.",
          product: "Store checkout, plan change, team seat purchase.",
        },
        {
          name: "Payment provider frame",
          intent: "Secure hosted card or wallet field container with provider-owned input area.",
          states: ["empty", "focused", "valid", "invalid", "saving", "unavailable"],
          tokens: "Secure field frame, provider mark, helper/error text, focus ring.",
          access: "Labels and errors must remain visible around provider-controlled fields.",
          product: "Checkout payment, saved method update, past-due recovery.",
        },
        {
          name: "Tax and VAT fields",
          intent: "Region-specific business tax entry, exemption, and validation fields.",
          states: ["hidden", "optional", "required", "validating", "invalid", "saved"],
          tokens: "Field group, select field, helper text, error role.",
          access: "Country-dependent fields must update with clear labels and described requirements.",
          product: "Billing address, invoice details, commercial license checkout.",
        },
        {
          name: "Billing ledger table",
          intent: "Dense tabular money history for invoices, receipts, credits, refunds, and retries.",
          states: ["loaded", "empty", "paid", "past due", "refunded", "loading"],
          tokens: "Data table, status chip, amount readout, download/retry actions.",
          access: "Rows expose date, amount, status, and action in a stable reading order.",
          product: "Billing history, receipts, open invoices, refund tracking.",
        },
      ],
    },
    {
      id: "workflows",
      label: "Dither Workflows",
      lead: "Product-specific components that make this more than a generic Material clone.",
      components: [
        {
          name: "Preview canvas",
          intent: "Primary image surface with source, output, split, and inspection modes.",
          states: ["empty", "loading", "rendering", "ready", "error", "zoomed"],
          tokens: "Canvas surface, preview border, focus ring, checker transparency.",
          access: "Expose mode and output metadata outside the canvas.",
          product: "Live dither output, source compare, inspect pixels.",
        },
        {
          name: "Timeline transport",
          intent: "Frame playback and motion-dither control.",
          states: ["stopped", "playing", "paused", "recording", "reduced motion"],
          tokens: "Transport buttons, timeline track, active sweep, recording status.",
          access: "Buttons announce current playback state and frame count.",
          product: "Animated stills, video frames, loop preview.",
        },
        {
          name: "Algorithm picker",
          intent: "Browsable dither algorithm selection with metadata.",
          states: ["default", "filtered", "selected", "favorite", "unavailable"],
          tokens: "List row, category chip, selected outline, search field.",
          access: "Keyboard search and selected state are required.",
          product: "63 algorithm choices and family filtering.",
        },
        {
          name: "Effect stack",
          intent: "Ordered, removable processing layers.",
          states: ["empty", "active", "dragging", "bypassed", "error"],
          tokens: "Open row, drag handle glyph, state chip, rule separators.",
          access: "Provide non-drag controls for reorder and remove.",
          product: "Sharpen, posterize, distortion, scanlines, bloom.",
        },
        {
          name: "Palette inspector",
          intent: "Extracted colors, locked seed, and output ramp decisions.",
          states: ["extracting", "ready", "locked", "contrast warning"],
          tokens: "Swatches, color roles, warning chip, dynamic seed indicator.",
          access: "Swatches expose names or color values.",
          product: "Material seed color, limited palette, print ramp.",
        },
        {
          name: "Batch queue row",
          intent: "Per-file status, preview, selection, and recovery.",
          states: ["queued", "processing", "complete", "failed", "selected", "removed"],
          tokens: "Row surface, thumbnail, progress, status chip, remove action.",
          access: "Status updates are announced politely.",
          product: "Batch image processing and retry.",
        },
        {
          name: "Export meter",
          intent: "Live output size, dimensions, format, and savings.",
          states: ["estimating", "ready", "over budget", "exporting", "complete"],
          tokens: "Radial meter, file stats, success/warning/error roles.",
          access: "Numeric values must render as text, not only in the radial meter.",
          product: "PNG, SVG, palette JSON, WebM, file-size savings.",
        },
      ],
    },
  ];

  const componentVariants = {
    Button: ["primary", "secondary", "destructive", "loading", "compact"],
    "Floating action button": ["extended", "icon-only", "pinned", "loading"],
    "Icon button": ["plain", "selected", "destructive", "disabled"],
    Icon: ["decorative", "labelled", "filled", "outlined"],
    "Segmented control": ["two-up", "three-up", "scrolling", "disabled item"],
    "Split button": ["default action", "menu trigger", "open menu", "loading"],
    "Action group": ["toolbar", "overflow", "mixed selection", "disabled group"],
    "State layer and ripple": ["hover", "focus", "pressed", "selected"],
    "Focus ring": ["outer", "inset", "invalid", "disabled"],
    "Quick trigger": ["pinned", "inline", "busy", "reduced-motion"],
    Banner: ["info", "success", "warning", "error", "dismissible"],
    Dialog: ["confirmation", "destructive", "busy", "recoverable error"],
    Snackbar: ["confirmation", "undo", "export complete", "dismissed"],
    Tooltip: ["hover", "focus", "delayed", "disabled target"],
    "Progress indicator": ["determinate", "indeterminate", "paused", "failed"],
    Badge: ["count", "category", "semantic", "hidden"],
    "Status chip": ["neutral", "loading", "success", "warning", "error"],
    "Inline alert": ["info", "success", "warning", "error", "recoverable"],
    "Empty state": ["first use", "filtered", "locked", "empty cart"],
    Skeleton: ["row", "card", "field", "table"],
    Card: ["preset", "asset", "selected", "loading"],
    Carousel: ["thumbnail strip", "snap list", "overflow", "empty"],
    Pane: ["ingest", "stage", "control", "collapsed", "loading"],
    Panel: ["section", "expanded", "collapsed", "disabled"],
    "List row": ["batch item", "preset row", "effect row", "dragging"],
    "Divider and rule": ["dim", "standard", "active", "semantic"],
    "Elevation surface": ["level 0", "level 1", "level 2", "scrim"],
    "Details and accordion": ["closed", "open", "nested section", "disabled"],
    "Bottom sheet": ["modal", "persistent", "half-height", "full-height"],
    "Side sheet": ["modal", "modeless", "resizable", "dismissed"],
    "Frame strip": ["timeline", "thumbnail", "palette", "selected"],
    "Data table": ["invoice ledger", "session list", "plan comparison", "entitlements", "team seats", "payment methods", "activity log", "order history", "usage meters", "refund queue"],
    "Settings row": ["default", "dirty", "saving", "disabled"],
    "Top app bar": ["small", "center-aligned", "search", "scrolled"],
    "Bottom app bar": ["plain", "with FAB", "overflow", "hidden"],
    "Shared header": ["desktop", "mobile wrap", "current route", "busy"],
    "Navigation bar": ["top", "bottom", "current route", "overflow"],
    "Navigation drawer": ["modal", "sectioned", "current route", "dismissed"],
    "Navigation rail": ["collapsed", "expanded", "active", "grouped"],
    "Documentation rail": ["grouped", "active", "collapsed group", "keyboard"],
    Tabs: ["manual activation", "auto activation", "overflow", "disabled"],
    "Breadcrumb and path": ["short path", "overflow", "current page"],
    "Search and command entry": ["empty", "typing", "results", "no results"],
    Footer: ["document", "product", "link focus", "mobile stack"],
    Checkbox: ["unchecked", "checked", "indeterminate", "error"],
    Radio: ["unchecked", "checked", "group error", "disabled"],
    Switch: ["off", "on", "labelled state", "disabled"],
    Slider: ["single value", "bounded", "live output", "disabled"],
    Chips: ["filter", "input", "selected", "removable"],
    "Menu and listbox": ["native select", "custom listbox", "grouped", "typeahead"],
    "Date picker": ["native", "popover", "range", "invalid"],
    "Time picker": ["native", "duration", "invalid", "disabled"],
    "Palette swatch group": ["extracted", "locked", "selected", "contrast warning"],
    "Text field": ["empty", "filled", "helper text", "invalid"],
    "Search field": ["empty", "typing", "clearable", "no results"],
    Textarea: ["notes", "resizable", "counter", "invalid"],
    "Select field": ["native", "grouped", "invalid", "disabled"],
    "Autocomplete field": ["combobox", "suggestions", "no results", "invalid"],
    "Number field and stepper": ["unit suffix", "bounded", "stepping", "invalid"],
    "File input and dropzone": ["empty", "drag over", "accepted", "rejected"],
    "Range and frame fields": ["start/end", "linked", "invalid range", "disabled"],
    "Password field": ["hidden", "revealed", "weak", "invalid"],
    "One-time code field": ["empty", "typing", "complete", "expired"],
    "Validation summary": ["warning", "error", "field links", "resolved"],
    "Sign-in form": ["password", "passkey", "remembered", "locked"],
    "Sign-up form": ["email", "plan context", "weak password", "complete"],
    "Verification challenge": ["email code", "authenticator", "resend", "expired"],
    "Password reset": ["request", "sent", "reset", "rate limited"],
    "Session state": ["signed in", "expiring", "expired", "offline"],
    "Access gate": ["login", "plan", "locked", "unlocked"],
    "Account menu": ["closed", "open", "switching", "signed out"],
    "Profile settings": ["view", "editing", "dirty", "saved"],
    "Security settings": ["MFA", "passkeys", "sessions", "recovery"],
    "Team and seats": ["owner", "member", "invited", "over limit"],
    "Subscription settings": ["trial", "active", "past due", "cancelled"],
    "Notification preferences": ["default", "custom", "saving", "disabled"],
    "Entitlement library": ["owned", "downloading", "installed", "revoked"],
    "Settings section": ["profile", "security", "billing", "dirty"],
    "Danger zone": ["available", "confirming", "blocked", "submitted"],
    "Activity log": ["security", "billing", "team", "filtered"],
    "Product listing": ["grid", "filtered", "owned", "sale"],
    "Product detail": ["preview", "compatible", "owned", "unavailable"],
    "Cart drawer": ["empty", "filled", "discounted", "checking out"],
    "Checkout shell": ["account", "payment", "review", "failed"],
    "Order summary": ["estimated", "discounted", "tax pending", "final"],
    "Discount code": ["empty", "validating", "applied", "invalid"],
    "Purchase confirmation": ["processing", "complete", "syncing", "partial failure"],
    "Product card": ["default", "owned", "sale", "unavailable"],
    "Price row": ["subtotal", "discount", "tax", "total"],
    "Plan selector": ["monthly", "annual", "team", "current"],
    "Payment method form": ["card", "wallet", "invalid", "saved"],
    "Saved payment method": ["default", "selected", "expired", "removing"],
    "Billing address": ["domestic", "international", "tax id", "invalid"],
    "Invoice list": ["paid", "open", "past due", "download"],
    "Receipt detail": ["paid", "refunded", "taxed", "download"],
    "Payment failure recovery": ["soft fail", "past due", "retrying", "recovered"],
    "Refund and cancellation": ["eligible", "confirming", "submitted", "denied"],
    "Checkout stepper": ["current", "complete", "blocked", "failed"],
    "Payment provider frame": ["empty", "focused", "invalid", "saved"],
    "Tax and VAT fields": ["optional", "required", "invalid", "saved"],
    "Billing ledger table": ["invoice", "receipt", "credit", "past due"],
    "Preview canvas": ["processed", "split", "source", "zoomed"],
    "Timeline transport": ["stopped", "playing", "recording", "reduced-motion"],
    "Algorithm picker": ["unfiltered", "filtered", "selected", "favorite"],
    "Effect stack": ["empty", "ordered", "bypassed", "dragging"],
    "Palette inspector": ["extracting", "ready", "locked", "warning"],
    "Batch queue row": ["queued", "processing", "complete", "failed"],
    "Export meter": ["estimating", "ready", "over budget", "complete"],
  };

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function componentRecordId(familyId, componentName) {
    return `component-${familyId}-${slugify(componentName)}`;
  }

  function getComponentVariants(component) {
    return component.variants || componentVariants[component.name] || ["default", "dense", "loading", "disabled"];
  }

  function createChipList(items) {
    const list = createElement("div", "component-chip-list");
    items.forEach((item) => {
      list.appendChild(createElement("span", "component-chip", item));
    });
    return list;
  }

  function createCoverageDisclosure(totalComponents) {
    const coverage = createElement("details", "component-benchmark-disclosure");
    coverage.id = "component-material-coverage";
    const summary = document.createElement("summary");
    const copy = createElement("span", "component-summary-copy");
    copy.appendChild(createElement("strong", "", "Material 3 benchmark coverage"));
    copy.appendChild(createElement("span", "", `${totalComponents} visualized records. Material primitives stay separated from account and commerce composites.`));
    summary.appendChild(copy);
    summary.appendChild(createElement("span", "component-expander"));
    coverage.appendChild(summary);

    const grid = createElement("div", "component-coverage-grid");
    [
      ["Actions", "Buttons, FABs, icon buttons, segmented controls, split buttons, button groups, icons, ripple/state layers, focus rings."],
      ["Communication", "Badges, banners, dialogs, progress, snackbars, tooltips, inline alerts, empty and loading states."],
      ["Containment", "Cards, carousel, lists, dividers, elevation, details, bottom/side sheets, tables, settings rows."],
      ["Navigation", "Top and bottom app bars, navigation bar, drawer, rail, tabs, breadcrumbs, search, footer."],
      ["Selection", "Checkboxes, chips, menus/listboxes, radios, sliders, switches, date and time pickers, swatches."],
      ["Text input", "Text, search, textarea, select, autocomplete, number, file/dropzone, range, password, OTP, validation summary."],
      ["Commerce", "Auth, account, store, cart, checkout, payment, invoice, receipt, refund, tax, recovery, entitlement, activity log."],
      ["Disclosure", "Every record opens specimen-first; states, variants, tokens, accessibility, and product usage are nested one level deeper."],
    ].forEach(([title, text]) => {
      const item = createElement("article", "");
      item.appendChild(createElement("span", "token-name", title));
      item.appendChild(createElement("p", "", text));
      grid.appendChild(item);
    });
    coverage.appendChild(grid);
    return coverage;
  }

  function createCommerceKitDisclosure() {
    const kit = createElement("details", "component-benchmark-disclosure component-commerce-kit");
    kit.id = "component-page-kits";
    const summary = document.createElement("summary");
    const copy = createElement("span", "component-summary-copy");
    copy.appendChild(createElement("strong", "", "Commerce and account page kit"));
    copy.appendChild(createElement("span", "", "Auth, account, store, checkout, payment, invoice, refund, and recovery patterns."));
    summary.appendChild(copy);
    summary.appendChild(createElement("span", "component-expander"));
    kit.appendChild(summary);

    const grid = createElement("div", "component-coverage-grid");
    [
      ["Account", "Account menu, profile, security, team seats, subscription, notifications, entitlements, danger zone, activity log."],
      ["Store", "Product listing, product detail, product card, plan selector, discount code, cart drawer, purchase confirmation."],
      ["Checkout", "Checkout shell, stepper, order summary, payment provider frame, billing address, tax and VAT fields."],
      ["Recovery", "Saved payment methods, invoice list, receipt detail, billing ledger, failed-payment recovery, refund and cancellation."],
    ].forEach(([title, text]) => {
      const item = createElement("article", "");
      item.appendChild(createElement("span", "token-name", title));
      item.appendChild(createElement("p", "", text));
      grid.appendChild(item);
    });
    kit.appendChild(grid);
    return kit;
  }

  function createContractDisclosure(component) {
    const disclosure = createElement("details", "component-contract-details");
    const summary = document.createElement("summary");
    const copy = createElement("span", "component-summary-copy");
    copy.appendChild(createElement("strong", "", "Details"));
    copy.appendChild(createElement("span", "", "Intent, states, variants, tokens, accessibility, and product use."));
    summary.appendChild(copy);
    summary.appendChild(createElement("span", "component-expander"));
    disclosure.appendChild(summary);

    const grid = createElement("div", "component-contract-grid");
    [
      ["Intent", component.intent],
      ["States", createChipList(component.states)],
      ["Variants / modes", createChipList(getComponentVariants(component))],
      ["Tokens", component.tokens],
      ["Accessibility", component.access],
      ["Dither Wizard use", component.product],
    ].forEach(([label, value]) => {
      const cell = createElement("div", "component-detail-cell");
      cell.appendChild(createElement("span", "token-name", label));
      if (value instanceof HTMLElement) cell.appendChild(value);
      else cell.appendChild(createElement("p", "", value));
      grid.appendChild(cell);
    });
    disclosure.appendChild(grid);
    return disclosure;
  }

  function appendText(parent, tag, className, text) {
    const node = createElement(tag, className, text);
    parent.appendChild(node);
    return node;
  }

  function appendButton(parent, text, className = "") {
    const button = createElement("button", className, text);
    button.type = "button";
    parent.appendChild(button);
    return button;
  }

  function appendStateChip(parent, text, modifier = "") {
    const chip = createElement("span", modifier ? `state-chip ${modifier}` : "state-chip", text);
    parent.appendChild(chip);
    return chip;
  }

  function appendField(parent, label, value, type = "text") {
    const field = createElement("label", "specimen-field");
    field.appendChild(createElement("span", "field-label", label));
    const input = document.createElement("input");
    input.className = "text-input";
    input.type = type;
    input.value = value;
    field.appendChild(input);
    parent.appendChild(field);
    return field;
  }

  function appendSpecimenRow(parent, title, meta, actionText = "") {
    const row = createElement("div", "specimen-rowline");
    const copy = createElement("span", "specimen-rowline-copy");
    copy.appendChild(createElement("strong", "", title));
    copy.appendChild(createElement("small", "", meta));
    row.appendChild(copy);
    if (actionText) appendButton(row, actionText);
    parent.appendChild(row);
    return row;
  }

  function tableStatusModifier(status) {
    const value = String(status).toLowerCase();
    if (value.includes("fail") || value.includes("past") || value.includes("revoked")) return "is-error";
    if (value.includes("warn") || value.includes("pending") || value.includes("review")) return "is-warning";
    if (value.includes("paid") || value.includes("active") || value.includes("owned") || value.includes("ok")) return "is-success";
    return "is-selected";
  }

  function appendTableVariantRow(parent, rowData) {
    const row = createElement("div", "table-variant-row");
    rowData.cells.forEach((cell, index) => {
      row.appendChild(createElement("span", index === 0 ? "table-variant-primary" : "", cell));
    });
    if (rowData.status) appendStateChip(row, rowData.status, tableStatusModifier(rowData.status));
    if (rowData.meter) {
      const meter = createElement("span", "table-variant-meter");
      const fill = createElement("span", "", "");
      fill.style.width = rowData.meter;
      meter.appendChild(fill);
      row.appendChild(meter);
    }
    parent.appendChild(row);
    return row;
  }

  function buildTableVariantGallery(stage) {
    const variants = [
      {
        label: "Invoice ledger",
        mode: "table",
        rows: [
          { cells: ["May invoice", "$18.00", "PDF"], status: "paid" },
          { cells: ["June invoice", "$18.00", "Retry"], status: "failed" },
          { cells: ["Credit", "-$4.00", "Applied"], status: "ok" },
        ],
      },
      {
        label: "Session list",
        mode: "list",
        rows: [
          { cells: ["MacBook Pro", "Current session", "San Francisco"], status: "active" },
          { cells: ["iPad", "Last seen 2d", "Revoke"], status: "review" },
          { cells: ["Chrome", "New device", "Approve"], status: "pending" },
        ],
      },
      {
        label: "Plan comparison",
        mode: "comparison",
        rows: [
          { cells: ["Free", "10 exports", "$0"], status: "available" },
          { cells: ["Pro", "Unlimited exports", "$12/mo"], status: "active" },
          { cells: ["Team", "Seats and billing", "$32/mo"], status: "upgrade" },
        ],
      },
      {
        label: "Entitlement cards",
        mode: "cards",
        rows: [
          { cells: ["Cathode Ramps", "Palette pack", "Installed"], status: "owned" },
          { cells: ["Signal Rot Kit", "Effect pack", "Update"], status: "pending" },
          { cells: ["Vector Export Pro", "License", "Active"], status: "active" },
        ],
      },
      {
        label: "Team seats",
        mode: "table",
        rows: [
          { cells: ["Corey", "Owner", "1 seat"], status: "active" },
          { cells: ["Studio Ops", "Editor", "1 seat"], status: "active" },
          { cells: ["Invite pending", "Viewer", "1 seat"], status: "pending" },
        ],
      },
      {
        label: "Payment methods",
        mode: "list",
        rows: [
          { cells: ["Visa 4242", "Default", "Expires 08/29"], status: "active" },
          { cells: ["Wallet", "Backup", "Connected"], status: "ok" },
          { cells: ["Amex 1004", "Expired", "Update"], status: "failed" },
        ],
      },
      {
        label: "Activity log",
        mode: "timeline",
        rows: [
          { cells: ["MFA enabled", "May 9, 09:14", "Security"], status: "ok" },
          { cells: ["Pack installed", "May 9, 09:22", "Store"], status: "active" },
          { cells: ["Payment retry", "May 9, 09:31", "Billing"], status: "review" },
        ],
      },
      {
        label: "Order history",
        mode: "table",
        rows: [
          { cells: ["DW-1042", "Signal Rot Kit", "$18.00"], status: "paid" },
          { cells: ["DW-1041", "Pro annual", "$120.00"], status: "paid" },
          { cells: ["DW-1039", "Refund request", "$18.00"], status: "review" },
        ],
      },
      {
        label: "Usage meters",
        mode: "meters",
        rows: [
          { cells: ["Exports", "82 of 100", "Monthly"], meter: "82%" },
          { cells: ["Team seats", "3 of 5", "Current"], meter: "60%" },
          { cells: ["Storage", "14 GB", "Archive"], meter: "42%" },
        ],
      },
      {
        label: "Refund queue",
        mode: "table",
        rows: [
          { cells: ["Duplicate pack", "$18.00", "Review"], status: "review" },
          { cells: ["Seat removal", "$6.00", "Pending"], status: "pending" },
          { cells: ["Old invoice", "$12.00", "Denied"], status: "failed" },
        ],
      },
    ];

    const gallery = createElement("div", "table-variant-gallery");
    const switcher = createElement("div", "table-variant-switcher");
    switcher.setAttribute("aria-label", "Data table specimen variations");

    const panels = createElement("div", "table-variant-panels");
    variants.forEach((variant, index) => {
      const variantId = `table-variant-${index + 1}`;
      const button = appendButton(switcher, String(index + 1).padStart(2, "0"));
      button.dataset.tableVariantTarget = variantId;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.setAttribute("aria-controls", variantId);
      button.title = variant.label;

      const panel = createElement("section", `table-variant-panel is-${variant.mode}`);
      panel.id = variantId;
      panel.dataset.tableVariantPanel = variantId;
      panel.hidden = index !== 0;
      const head = createElement("div", "table-variant-head");
      head.appendChild(createElement("span", "token-name", `variation ${String(index + 1).padStart(2, "0")}`));
      head.appendChild(createElement("strong", "", variant.label));
      panel.appendChild(head);
      const preview = createElement("div", `table-variant-preview is-${variant.mode}`);
      variant.rows.forEach((row) => appendTableVariantRow(preview, row));
      panel.appendChild(preview);
      panels.appendChild(panel);
    });

    gallery.appendChild(switcher);
    gallery.appendChild(panels);
    stage.appendChild(gallery);
  }

  function setActiveTableVariant(gallery, activeId) {
    if (!gallery || !activeId) return;
    gallery.querySelectorAll("[data-table-variant-target]").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.tableVariantTarget === activeId ? "true" : "false");
    });
    gallery.querySelectorAll("[data-table-variant-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.tableVariantPanel !== activeId;
    });
  }

  function buildActionSpecimen(stage, component) {
    const row = createElement("div", "specimen-button-row");
    if (component.name === "Icon") {
      const icons = createElement("div", "specimen-icon-strip");
      ["search", "cart", "shield", "receipt", "user", "lock"].forEach((label, index) => {
        const icon = createElement("span", index === 2 ? "is-active" : "", label.slice(0, 1).toUpperCase());
        icon.setAttribute("aria-label", label);
        icons.appendChild(icon);
      });
      stage.appendChild(icons);
      return;
    }

    if (component.name === "Segmented control") {
      ["Output", "Source", "Split"].forEach((label, index) => appendButton(row, label, index === 0 ? "is-active" : ""));
    } else if (component.name === "Icon button") {
      ["Undo", "Redo", "Fit", "Close"].forEach((label, index) => appendButton(row, label, index === 2 ? "specimen-square-button is-active" : "specimen-square-button"));
    } else if (component.name === "Split button") {
      appendButton(row, "Export PNG");
      appendButton(row, "▾", "specimen-square-button");
      appendStateChip(row, "open", "is-selected");
    } else if (component.name === "State layer and ripple") {
      ["Hover", "Focus", "Pressed", "Selected"].forEach((label, index) => {
        const state = appendButton(row, label, `state-layer-demo is-layer-${index + 1}`);
        if (index === 2) state.setAttribute("aria-pressed", "true");
      });
    } else if (component.name === "Focus ring") {
      const focusStack = createElement("div", "focus-ring-demo");
      ["Button", "Menu row", "Field", "Invalid"].forEach((label, index) => {
        const node = index === 2 ? appendField(focusStack, label, "Focused value") : appendButton(focusStack, label);
        node.classList.add(index === 3 ? "is-invalid-focus" : "is-focus-visible");
      });
      stage.appendChild(focusStack);
      return;
    } else if (component.name === "Action group") {
      ["Undo", "Redo", "Compare", "Zoom", "Snap"].forEach((label, index) => appendButton(row, label, index === 2 ? "is-active" : ""));
    } else if (component.name === "Floating action button" || component.name === "Quick trigger") {
      appendButton(row, component.name === "Floating action button" ? "Capture" : "Run batch", "specimen-fab-demo");
      appendButton(row, "Export");
      appendStateChip(row, "ready", "is-success");
    } else {
      appendButton(row, "Filled");
      appendButton(row, "Tonal");
      appendButton(row, "Outlined");
      appendButton(row, "Text");
      const disabled = appendButton(row, "Disabled");
      disabled.disabled = true;
    }
    stage.appendChild(row);
  }

  function buildCommunicationSpecimen(stage, component) {
    if (component.name === "Progress indicator" || component.name === "Skeleton") {
      const stack = createElement("div", "specimen-stack");
      const meter = createElement("div", component.name === "Skeleton" ? "specimen-skeleton" : "specimen-progress");
      meter.appendChild(createElement("span", "", ""));
      stack.appendChild(meter);
      appendSpecimenRow(stack, component.name === "Skeleton" ? "Invoice rows" : "Batch render", "62% complete", "Cancel");
      stage.appendChild(stack);
      return;
    }

    if (component.name === "Dialog") {
      const dialog = createElement("div", "specimen-dialog");
      appendText(dialog, "strong", "", "Delete preset?");
      appendText(dialog, "p", "", "This removes the saved look from your account.");
      const actions = createElement("div", "specimen-button-row");
      appendButton(actions, "Cancel");
      appendButton(actions, "Delete");
      dialog.appendChild(actions);
      stage.appendChild(dialog);
      return;
    }

    if (component.name === "Badge") {
      const badges = createElement("div", "specimen-badge-demo");
      [["Cart", "2"], ["Invoices", "past due"], ["Library", "486"], ["MFA", "on"]].forEach(([label, badge], index) => {
        const item = createElement("span", index === 1 ? "is-warning" : index === 3 ? "is-success" : "");
        item.appendChild(document.createTextNode(label));
        item.appendChild(createElement("b", "", badge));
        badges.appendChild(item);
      });
      stage.appendChild(badges);
      return;
    }

    if (component.name === "Tooltip") {
      const tool = createElement("div", "tooltip-demo");
      appendButton(tool, "↺", "specimen-square-button");
      appendText(tool, "span", "", "Undo last dither pass");
      stage.appendChild(tool);
      return;
    }

    if (component.name === "Banner") {
      const banner = createElement("div", "specimen-alert is-info");
      appendStateChip(banner, "system notice", "is-selected");
      appendText(banner, "p", "", "Billing details need review before the next renewal.");
      appendButton(banner, "Review");
      stage.appendChild(banner);
      return;
    }

    if (component.name === "Inline alert") {
      const alert = createElement("div", "specimen-alert is-error");
      appendStateChip(alert, "recoverable", "is-error");
      appendText(alert, "p", "", "Card declined. Try again or add a new payment method.");
      appendButton(alert, "Update method");
      stage.appendChild(alert);
      return;
    }

    if (component.name === "Empty state") {
      const empty = createElement("div", "empty-state-demo");
      appendText(empty, "strong", "", "No invoices yet");
      appendText(empty, "p", "", "Purchases and renewals will appear here.");
      appendButton(empty, "Browse store");
      stage.appendChild(empty);
      return;
    }

    if (component.name === "Snackbar") {
      const snack = createElement("div", "snackbar-demo");
      appendText(snack, "span", "", "Preset saved");
      appendButton(snack, "Undo");
      stage.appendChild(snack);
      return;
    }

    const alert = createElement("div", "specimen-alert");
    appendStateChip(alert, component.name === "Snackbar" ? "export copied" : component.name.toLowerCase(), component.name === "Status chip" ? "is-success" : "is-warning");
    appendText(alert, "p", "", component.name === "Empty state" ? "No invoices yet. Purchases and renewals will appear here." : "Payment method needs attention before checkout can continue.");
    stage.appendChild(alert);
  }

  function buildContainmentSpecimen(stage, component) {
    if (component.name === "Carousel") {
      const carousel = createElement("div", "specimen-carousel");
      const strip = createElement("div", "specimen-carousel-strip");
      ["Source", "Output", "Palette"].forEach((label, index) => {
        const item = createElement("article", index === 1 ? "specimen-carousel-card is-active" : "specimen-carousel-card");
        appendText(item, "span", "token-name", `0${index + 1}`);
        appendText(item, "strong", "", label);
        appendText(item, "p", "", index === 1 ? "Active dither preview" : "Comparison frame");
        strip.appendChild(item);
      });
      carousel.appendChild(strip);
      const controls = createElement("div", "specimen-carousel-controls");
      appendButton(controls, "←", "specimen-square-button");
      appendStateChip(controls, "2 / 3", "is-selected");
      appendButton(controls, "→", "specimen-square-button");
      carousel.appendChild(controls);
      stage.appendChild(carousel);
      return;
    }

    if (component.name === "Data table") {
      buildTableVariantGallery(stage);
      return;
    }

    if (component.name === "Pane") {
      const pane = createElement("div", "pane-demo");
      ["Ingest", "Preview", "Export"].forEach((label, index) => {
        const region = createElement("span", index === 1 ? "is-active" : "", label);
        pane.appendChild(region);
      });
      stage.appendChild(pane);
      return;
    }

    if (component.name === "Panel") {
      const panel = createElement("div", "settings-stack");
      appendSpecimenRow(panel, "Palette controls", "Expanded", "Collapse");
      appendSpecimenRow(panel, "Advanced scanlines", "Disabled", "Enable");
      stage.appendChild(panel);
      return;
    }

    if (component.name === "List row") {
      const list = createElement("div", "specimen-table");
      appendSpecimenRow(list, "Batch-042.png", "queued / 1.2 MB", "Remove");
      appendSpecimenRow(list, "Signal preset", "selected / owned", "Open");
      appendSpecimenRow(list, "Stripe invoice", "past due", "Retry");
      stage.appendChild(list);
      return;
    }

    if (component.name === "Divider and rule") {
      const rules = createElement("div", "rule-demo");
      ["dim", "standard", "active", "error"].forEach((label) => {
        const rule = createElement("span", `is-${label}`);
        rule.appendChild(createElement("b", "", label));
        rules.appendChild(rule);
      });
      stage.appendChild(rules);
      return;
    }

    if (component.name === "Elevation surface") {
      const stack = createElement("div", "elevation-demo");
      ["0", "1", "2", "3"].forEach((level) => {
        const plane = createElement("span", `is-level-${level}`, `level ${level}`);
        stack.appendChild(plane);
      });
      stage.appendChild(stack);
      return;
    }

    if (component.name === "Details and accordion") {
      const accordion = createElement("div", "settings-stack");
      appendSpecimenRow(accordion, "Specimen", "Visible by default", "");
      appendSpecimenRow(accordion, "Details", "Collapsed contract", "Open");
      stage.appendChild(accordion);
      return;
    }

    if (component.name === "Settings row") {
      const table = createElement("div", "specimen-table");
      appendSpecimenRow(table, "Two-factor authentication", "Authenticator required", "Manage");
      appendSpecimenRow(table, "Team seats", "3 of 5 assigned", "Invite");
      stage.appendChild(table);
      return;
    }

    if (component.name === "Frame strip") {
      const strip = createElement("div", "specimen-carousel-strip");
      ["00", "08", "16", "24", "32"].forEach((label, index) => {
        const frame = createElement("article", index === 2 ? "specimen-carousel-card is-active" : "specimen-carousel-card");
        appendText(frame, "span", "token-name", "frame");
        appendText(frame, "strong", "", label);
        strip.appendChild(frame);
      });
      stage.appendChild(strip);
      return;
    }

    if (component.name === "Bottom sheet" || component.name === "Side sheet") {
      const sheet = createElement("div", component.name === "Bottom sheet" ? "specimen-sheet is-bottom" : "specimen-sheet is-side");
      appendText(sheet, "span", "token-name", component.name);
      appendSpecimenRow(sheet, "Export settings", "PNG, 2048 px", "Apply");
      stage.appendChild(sheet);
      return;
    }

    const cards = createElement("div", "specimen-card-grid");
    ["Preset", "Asset"].forEach((label, index) => {
      const card = createElement("article", index === 0 ? "specimen-card is-active" : "specimen-card");
      appendText(card, "span", "token-name", label);
      appendText(card, "strong", "", index === 0 ? "CRT Fog" : "Signal Pack");
      appendText(card, "p", "", index === 0 ? "Saved dither settings" : "Owned store item");
      cards.appendChild(card);
    });
    stage.appendChild(cards);
  }

  function buildNavigationSpecimen(stage, component) {
    if (component.name === "Search and command entry") {
      appendField(stage, "Command", "export png");
      appendSpecimenRow(stage, "Run export", "⌘ Enter", "Select");
      return;
    }

    if (component.name === "Top app bar" || component.name === "Shared header") {
      const bar = createElement("div", "app-bar-demo is-top");
      appendButton(bar, "Menu", "specimen-square-button");
      appendText(bar, "strong", "", component.name === "Top app bar" ? "Checkout" : "Dither Wizard");
      appendButton(bar, "Search", "specimen-square-button");
      appendButton(bar, "Account", "specimen-square-button");
      stage.appendChild(bar);
      return;
    }

    if (component.name === "Bottom app bar") {
      const bar = createElement("div", "app-bar-demo is-bottom");
      ["Home", "Store", "Export"].forEach((label, index) => appendButton(bar, label, index === 1 ? "is-active" : ""));
      appendButton(bar, "+", "specimen-fab-demo");
      stage.appendChild(bar);
      return;
    }

    if (component.name === "Navigation drawer") {
      const drawer = createElement("div", "drawer-demo");
      appendText(drawer, "strong", "", "Dither Studio");
      ["Account", "Store", "Billing", "Sign out"].forEach((label, index) => appendSpecimenRow(drawer, label, index === 1 ? "current" : "route", ""));
      stage.appendChild(drawer);
      return;
    }

    if (component.name === "Navigation rail" || component.name === "Documentation rail") {
      const rail = createElement("div", "rail-demo");
      ["Color", "Type", "Icons", "Components", "QA"].forEach((label, index) => {
        const item = createElement("span", index === 3 ? "is-active" : "", label.slice(0, 2));
        item.title = label;
        rail.appendChild(item);
      });
      stage.appendChild(rail);
      return;
    }

    if (component.name === "Tabs") {
      const tabs = createElement("div", "specimen-nav");
      ["Specimen", "Details", "Tokens"].forEach((label, index) => tabs.appendChild(createElement("span", index === 0 ? "is-active" : "", label)));
      stage.appendChild(tabs);
      return;
    }

    if (component.name === "Breadcrumb and path") {
      const path = createElement("div", "breadcrumb-demo");
      ["Design system", "Components", "Billing", "Payment"].forEach((label, index) => {
        path.appendChild(createElement("span", index === 3 ? "is-active" : "", label));
      });
      stage.appendChild(path);
      return;
    }

    if (component.name === "Footer") {
      const foot = createElement("div", "footer-demo");
      ["Home", "Design", "Contact", "Repo"].forEach((label) => foot.appendChild(createElement("span", "", label)));
      stage.appendChild(foot);
      return;
    }

    const nav = createElement("div", "specimen-nav");
    ["Home", "Wizardry", "Store", "Account"].forEach((label, index) => {
      const item = createElement("span", index === 2 ? "is-active" : "", label);
      nav.appendChild(item);
    });
    stage.appendChild(nav);
  }

  function buildSelectionSpecimen(stage, component) {
    if (component.name === "Checkbox" || component.name === "Radio" || component.name === "Switch") {
      const controls = createElement("div", "specimen-choice-list");
      const labels = component.name === "Checkbox"
        ? [["Preserve alpha", "checked"], ["Export metadata", "unchecked"], ["Select all", "mixed"]]
        : component.name === "Radio"
          ? [["Monthly", "unchecked"], ["Annual", "checked"], ["Team", "unchecked"]]
          : [["Motion dither", "on"], ["Lock seed", "off"], ["Receipt emails", "on"]];
      labels.forEach(([label, state], index) => appendStateChip(controls, `${label} / ${state}`, index === 1 || state === "on" ? "is-selected" : ""));
      stage.appendChild(controls);
      return;
    }

    if (component.name === "Slider") {
      const control = createElement("div", "specimen-slider");
      appendText(control, "span", "field-label", "Threshold");
      const track = createElement("div", "specimen-slider-track");
      track.appendChild(createElement("span", "", ""));
      control.appendChild(track);
      appendText(control, "output", "", "64");
      stage.appendChild(control);
      return;
    }

    if (component.name === "Chips") {
      const chips = createElement("div", "component-chip-list");
      ["Owned", "Packs", "Sale", "Team", "Remove ×"].forEach((label, index) => chips.appendChild(createElement("span", index === 0 ? "component-chip is-selected" : "component-chip", label)));
      stage.appendChild(chips);
      return;
    }

    if (component.name === "Menu and listbox") {
      const menu = createElement("div", "menu-demo");
      appendSpecimenRow(menu, "Bayer 8x8", "selected", "");
      appendSpecimenRow(menu, "Atkinson", "recommended", "");
      appendSpecimenRow(menu, "Floyd-Steinberg", "disabled", "");
      stage.appendChild(menu);
      return;
    }

    if (component.name === "Date picker" || component.name === "Time picker") {
      const picker = createElement("div", component.name === "Date picker" ? "picker-demo is-date" : "picker-demo is-time");
      appendText(picker, "span", "field-label", component.name);
      const grid = createElement("div", "picker-grid");
      (component.name === "Date picker" ? ["09", "10", "11", "12", "13", "14"] : ["09:00", "10:30", "12:00", "14:30"]).forEach((label, index) => {
        grid.appendChild(createElement("span", index === 1 ? "is-active" : "", label));
      });
      picker.appendChild(grid);
      stage.appendChild(picker);
      return;
    }

    if (component.name === "Palette swatch group") {
      const swatches = createElement("div", "specimen-swatches");
      ["#61ff9b", "#38d9ff", "#f6c453", "#ff5d73", "#efe8d8"].forEach((color, index) => {
        const swatch = createElement("span", index === 0 ? "is-active" : "");
        swatch.style.setProperty("--specimen-swatch", color);
        swatches.appendChild(swatch);
      });
      stage.appendChild(swatches);
      return;
    }

    const controls = createElement("div", "specimen-choice-list");
    [["Checkbox", "checked"], ["Radio", "checked"], ["Switch", "on"], ["Chips", "selected"]].forEach(([label, state]) => {
      appendStateChip(controls, `${label} ${state}`, label === component.name ? "is-selected" : "");
    });
    stage.appendChild(controls);
  }

  function buildInputSpecimen(stage, component) {
    if (component.name === "One-time code field") {
      const code = createElement("div", "code-entry");
      ["4", "8", "1", "9", "", ""].forEach((value) => code.appendChild(createElement("span", "", value)));
      stage.appendChild(code);
      return;
    }

    if (component.name === "Validation summary") {
      const alert = createElement("div", "specimen-alert is-error");
      appendStateChip(alert, "2 fields", "is-error");
      appendText(alert, "p", "", "Password is too short. Billing region is required.");
      stage.appendChild(alert);
      return;
    }

    if (component.name === "Autocomplete field") {
      const combo = createElement("div", "autocomplete-demo");
      appendField(combo, "Billing region", "United");
      appendSpecimenRow(combo, "United States", "selected", "");
      appendSpecimenRow(combo, "United Kingdom", "suggestion", "");
      appendSpecimenRow(combo, "United Arab Emirates", "suggestion", "");
      stage.appendChild(combo);
      return;
    }

    if (component.name === "File input and dropzone") {
      const drop = createElement("div", "dropzone-demo");
      appendText(drop, "strong", "", "Drop images here");
      appendText(drop, "p", "", "PNG, JPG, WebP, or video frames");
      appendButton(drop, "Choose files");
      stage.appendChild(drop);
      return;
    }

    if (component.name === "Range and frame fields") {
      const range = createElement("div", "specimen-form");
      appendField(range, "Start frame", "08");
      appendField(range, "End frame", "64");
      appendStateChip(range, "valid range", "is-success");
      stage.appendChild(range);
      return;
    }

    const form = createElement("div", "specimen-form");
    appendField(form, component.name === "Search field" ? "Search" : component.name === "Password field" ? "Password" : "Field label", component.name === "Password field" ? "••••••••" : component.name === "Number field and stepper" ? "64" : "Dither preset", component.name === "Password field" ? "text" : "text");
    if (component.name === "Search field") appendSpecimenRow(form, "4 results", "icons, presets, store", "Clear");
    if (component.name === "Select field") appendButton(form, "Open options");
    if (component.name === "Number field and stepper") {
      const stepper = createElement("div", "specimen-button-row");
      appendButton(stepper, "-", "specimen-square-button");
      appendButton(stepper, "+", "specimen-square-button");
      form.appendChild(stepper);
    }
    if (component.name === "Textarea") appendText(form, "p", "", "Longer account, preset, or export notes with a visible counter.");
    if (component.name === "Password field") appendStateChip(form, "strong", "is-success");
    stage.appendChild(form);
  }

  function buildAuthSpecimen(stage, component) {
    const form = createElement("div", "specimen-form");
    if (component.name === "Verification challenge") {
      buildInputSpecimen(stage, { name: "One-time code field" });
      return;
    }
    if (component.name === "Password reset") {
      appendField(form, "Email", "maker@studio.test", "email");
      appendStateChip(form, "reset link sent", "is-success");
      appendButton(form, "Send reset");
    } else if (component.name === "Session state") {
      const session = createElement("div", "account-menu-demo");
      appendText(session, "div", "account-avatar", "DW");
      appendText(session, "strong", "", "Dither Studio");
      appendText(session, "span", "", "Syncing presets / session expires in 08:00");
      appendButton(session, "Refresh session");
      stage.appendChild(session);
      return;
    } else if (component.name === "Access gate") {
      const gate = createElement("div", "specimen-alert is-warning");
      appendStateChip(gate, "locked", "is-warning");
      appendText(gate, "p", "", "Sign in or upgrade to export commercial SVG packs.");
      appendButton(gate, "View plans");
      stage.appendChild(gate);
      return;
    } else {
      appendField(form, "Email", "maker@studio.test", "email");
      appendField(form, "Password", "••••••••", "text");
      if (component.name === "Sign-up form") appendStateChip(form, "plan: pro annual", "is-selected");
      appendButton(form, component.name === "Sign-up form" ? "Create account" : "Continue");
      appendButton(form, "Passkey");
    }
    stage.appendChild(form);
  }

  function buildAccountSpecimen(stage, component) {
    const panel = createElement("div", "specimen-account");
    if (component.name === "Account menu") {
      const menu = createElement("div", "account-menu-demo");
      appendText(menu, "div", "account-avatar", "DW");
      appendText(menu, "strong", "", "Dither Studio");
      appendText(menu, "span", "", "Pro annual");
      ["Profile", "Security", "Billing", "Sign out"].forEach((label) => appendSpecimenRow(menu, label, "route", ""));
      stage.appendChild(menu);
      return;
    }

    const rows = createElement("div", "settings-stack");
    if (component.name === "Profile settings") {
      appendField(rows, "Display name", "Dither Studio");
      appendField(rows, "Email", "maker@studio.test", "email");
      appendStateChip(rows, "dirty", "is-warning");
      appendButton(rows, "Save profile");
    } else if (component.name === "Security settings") {
      appendSpecimenRow(rows, "Passkeys", "2 active keys", "Manage");
      appendSpecimenRow(rows, "Two-factor authentication", "Required for billing", "Edit");
      appendSpecimenRow(rows, "Active sessions", "3 devices", "Review");
    } else if (component.name === "Team and seats") {
      appendSpecimenRow(rows, "Corey", "Owner", "Role");
      appendSpecimenRow(rows, "Studio Ops", "Editor", "Role");
      appendSpecimenRow(rows, "Invite pending", "1 seat", "Resend");
    } else if (component.name === "Subscription settings") {
      appendStateChip(rows, "Pro annual", "is-success");
      appendSpecimenRow(rows, "Plan renewal", "Renews Jun 09", "Change");
      appendSpecimenRow(rows, "Exports", "82 of 100", "Upgrade");
    } else if (component.name === "Notification preferences") {
      appendSpecimenRow(rows, "Billing notices", "on", "Toggle");
      appendSpecimenRow(rows, "Team invites", "on", "Toggle");
      appendSpecimenRow(rows, "Product updates", "off", "Toggle");
    } else if (component.name === "Entitlement library") {
      appendSpecimenRow(rows, "Signal Rot Kit", "installed", "Open");
      appendSpecimenRow(rows, "Cathode Ramps", "update available", "Update");
      appendSpecimenRow(rows, "Vector Export Pro", "active", "Download");
    } else if (component.name === "Danger zone") {
      appendSpecimenRow(rows, "Cancel plan", "Access ends Jun 09", "Review");
      appendSpecimenRow(rows, "Delete account", "Requires confirmation", "Start");
    } else if (component.name === "Activity log") {
      appendSpecimenRow(rows, "MFA enabled", "May 09 / security", "");
      appendSpecimenRow(rows, "Pack installed", "May 09 / store", "");
      appendSpecimenRow(rows, "Payment retry", "May 09 / billing", "");
    } else {
      appendSpecimenRow(rows, "Profile", "saved", "Edit");
      appendSpecimenRow(rows, "Security", "MFA required", "Manage");
      appendSpecimenRow(rows, "Billing", "Pro annual", "Open");
    }
    panel.appendChild(rows);
    stage.appendChild(panel);
  }

  function buildStoreSpecimen(stage, component) {
    if (component.name === "Cart drawer" || component.name === "Order summary" || component.name === "Price row") {
      const ledger = createElement("div", "cart-ledger");
      appendText(ledger, "span", "token-name", component.name);
      appendSpecimenRow(ledger, "Signal Rot Kit", "$18.00");
      appendSpecimenRow(ledger, "Launch credit", "-$4.00");
      appendSpecimenRow(ledger, "Total today", "$14.00", "Checkout");
      stage.appendChild(ledger);
      return;
    }

    if (component.name === "Product detail") {
      const detail = createElement("div", "product-detail-demo");
      appendText(detail, "span", "token-name", "effect pack");
      appendText(detail, "strong", "", "Signal Rot Kit");
      appendText(detail, "p", "", "11 distortion presets, commercial export license, compatible with Pro.");
      appendStateChip(detail, "compatible", "is-success");
      appendButton(detail, "Add to cart");
      stage.appendChild(detail);
      return;
    }

    if (component.name === "Discount code") {
      const discount = createElement("div", "specimen-form");
      appendField(discount, "Discount code", "LAUNCH-04");
      appendStateChip(discount, "applied -$4", "is-success");
      appendButton(discount, "Remove");
      stage.appendChild(discount);
      return;
    }

    if (component.name === "Purchase confirmation") {
      const confirm = createElement("div", "specimen-alert is-success");
      appendStateChip(confirm, "complete", "is-success");
      appendText(confirm, "p", "", "Signal Rot Kit is active. Receipt DW-1042 is ready.");
      appendButton(confirm, "Download receipt");
      stage.appendChild(confirm);
      return;
    }

    if (component.name === "Plan selector") {
      const plans = createElement("div", "plan-demo");
      [["Free", "$0"], ["Pro", "$12/mo"], ["Team", "$32/mo"]].forEach(([name, price], index) => {
        const plan = createElement("article", index === 1 ? "is-active" : "");
        appendText(plan, "strong", "", name);
        appendText(plan, "span", "", price);
        plans.appendChild(plan);
      });
      stage.appendChild(plans);
      return;
    }

    if (component.name === "Checkout shell") {
      const checkout = createElement("div", "checkout-panel");
      const steps = createElement("div", "checkout-stepper");
      ["Account", "Payment", "Review"].forEach((label, index) => appendText(steps, "span", index === 0 ? "is-complete" : index === 1 ? "is-current" : "", label));
      checkout.appendChild(steps);
      appendText(checkout, "div", "secure-payment-frame", "Order summary + payment frame");
      appendButton(checkout, "Review order");
      stage.appendChild(checkout);
      return;
    }

    const grid = createElement("div", "product-grid-demo");
    ["Signal Rot Kit", "Cathode Ramps"].forEach((label, index) => {
      const card = createElement("article", index === 1 ? "product-card-demo is-owned" : "product-card-demo");
      appendText(card, "span", "token-name", index === 0 ? "effect pack" : "palette pack");
      appendText(card, "strong", "", label);
      appendText(card, "p", "", index === 0 ? "11 distortion presets" : "36 indexed palettes");
      const price = createElement("div", "price-row");
      appendText(price, "span", "", index === 0 ? "$18" : "Owned");
      appendStateChip(price, index === 0 ? "add" : "installed", index === 0 ? "is-selected" : "is-success");
      card.appendChild(price);
      grid.appendChild(card);
    });
    stage.appendChild(grid);
  }

  function buildBillingSpecimen(stage, component) {
    if (component.name === "Invoice list" || component.name === "Billing ledger table") {
      const table = createElement("div", "invoice-table-demo");
      appendSpecimenRow(table, "May 2026", "$18.00 paid", "PDF");
      appendSpecimenRow(table, "June 2026", "$18.00 past due", "Retry");
      appendSpecimenRow(table, "Credit note", "-$4.00 applied", "View");
      stage.appendChild(table);
      return;
    }

    if (component.name === "Receipt detail") {
      const receipt = createElement("div", "cart-ledger");
      appendText(receipt, "span", "token-name", "receipt DW-1042");
      appendSpecimenRow(receipt, "Signal Rot Kit", "$18.00");
      appendSpecimenRow(receipt, "Tax", "$1.48");
      appendSpecimenRow(receipt, "Paid with Visa 4242", "$19.48", "PDF");
      stage.appendChild(receipt);
      return;
    }

    if (component.name === "Saved payment method") {
      const methods = createElement("div", "settings-stack");
      appendSpecimenRow(methods, "Visa 4242", "Default / expires 08-29", "Edit");
      appendSpecimenRow(methods, "Wallet", "Backup / connected", "Make default");
      appendSpecimenRow(methods, "Amex 1004", "Expired", "Update");
      stage.appendChild(methods);
      return;
    }

    if (component.name === "Billing address") {
      const address = createElement("div", "specimen-form");
      appendField(address, "Country", "United States");
      appendField(address, "Postal code", "94107");
      appendStateChip(address, "tax calculated", "is-success");
      stage.appendChild(address);
      return;
    }

    if (component.name === "Tax and VAT fields") {
      const tax = createElement("div", "specimen-form");
      appendField(tax, "Business tax ID", "US-1234");
      appendField(tax, "Region", "California");
      appendStateChip(tax, "validating", "is-loading");
      stage.appendChild(tax);
      return;
    }

    if (component.name === "Payment failure recovery") {
      const recovery = createElement("div", "payment-recovery");
      appendStateChip(recovery, "past due", "is-error");
      appendText(recovery, "strong", "", "Payment failed");
      appendText(recovery, "p", "", "Pro exports stay available for 5 days. Retry the saved card or add a new method.");
      const actions = createElement("div", "component-button-row");
      appendButton(actions, "Retry");
      appendButton(actions, "Update method");
      recovery.appendChild(actions);
      stage.appendChild(recovery);
      return;
    }

    if (component.name === "Refund and cancellation") {
      const refund = createElement("div", "payment-recovery");
      appendStateChip(refund, "review", "is-warning");
      appendText(refund, "strong", "", "Cancellation impact");
      appendText(refund, "p", "", "Access remains until Jun 09. Team seats and scheduled exports will be removed after renewal.");
      appendButton(refund, "Confirm cancellation");
      stage.appendChild(refund);
      return;
    }

    if (component.name === "Checkout stepper") {
      const steps = createElement("div", "checkout-stepper");
      ["Account", "Payment", "Review", "Done"].forEach((label, index) => appendText(steps, "span", index < 1 ? "is-complete" : index === 1 ? "is-current" : "", label));
      stage.appendChild(steps);
      return;
    }

    const panel = createElement("div", "checkout-panel");
    const steps = createElement("div", "checkout-stepper");
    ["Account", "Payment", "Review"].forEach((label, index) => appendText(steps, "span", index === 0 ? "is-complete" : index === 1 ? "is-current" : "", label));
    panel.appendChild(steps);
    appendText(panel, "div", "secure-payment-frame", component.name === "Payment provider frame" ? "Card number / MM YY / CVC" : "Provider-hosted card field");
    if (component.name === "Payment method form") appendButton(panel, "Save method");
    if (component.name === "Payment provider frame") appendStateChip(panel, "focused", "is-selected");
    stage.appendChild(panel);
  }

  function buildWorkflowSpecimen(stage, component) {
    const frame = createElement("div", "specimen-workflow");
    appendText(frame, "span", "token-name", component.name);
    const preview = createElement("div", "specimen-preview-frame");
    preview.appendChild(createElement("span", "", ""));
    frame.appendChild(preview);
    const timeline = createElement("div", "specimen-timeline");
    timeline.appendChild(createElement("span", "", ""));
    frame.appendChild(timeline);
    appendStateChip(frame, component.name === "Export meter" ? "64% saved" : "ready", component.name === "Export meter" ? "is-success" : "is-selected");
    stage.appendChild(frame);
  }

  function buildComponentSpecimen(stage, component, familyId) {
    if (familyId === "actions") buildActionSpecimen(stage, component);
    else if (familyId === "communication") buildCommunicationSpecimen(stage, component);
    else if (familyId === "containment") buildContainmentSpecimen(stage, component);
    else if (familyId === "navigation") buildNavigationSpecimen(stage, component);
    else if (familyId === "selection") buildSelectionSpecimen(stage, component);
    else if (familyId === "inputs") buildInputSpecimen(stage, component);
    else if (familyId === "auth") buildAuthSpecimen(stage, component);
    else if (familyId === "account") buildAccountSpecimen(stage, component);
    else if (familyId === "store") buildStoreSpecimen(stage, component);
    else if (familyId === "billing") buildBillingSpecimen(stage, component);
    else buildWorkflowSpecimen(stage, component);
  }

  function createComponentSpecimen(component, familyId) {
    const cell = createElement("div", "component-detail-cell component-specimen-cell");
    cell.appendChild(createElement("span", "token-name", "Specimen"));
    const stage = createElement("div", `component-record-specimen specimen-${familyId}`);
    stage.dataset.specimen = slugify(component.name);
    buildComponentSpecimen(stage, component, familyId);
    cell.appendChild(stage);
    return cell;
  }

  function createDetail(component, familyId, isOpen) {
    const detail = createElement("details", "component-detail");
    detail.open = isOpen;
    detail.id = componentRecordId(familyId, component.name);
    detail.dataset.componentRecord = detail.id;
    detail.dataset.componentFamily = familyId;
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      const panel = detail.closest("[data-component-panel]");
      panel?.querySelectorAll(".component-detail[open]").forEach((record) => {
        if (record !== detail) record.open = false;
      });
    });

    const summary = document.createElement("summary");
    const copy = createElement("span", "component-summary-copy");
    copy.appendChild(createElement("strong", "", component.name));
    copy.appendChild(createElement("span", "", getComponentVariants(component).slice(0, 4).join(" / ")));
    summary.appendChild(copy);
    summary.appendChild(createElement("span", "component-expander"));
    detail.appendChild(summary);

    const body = createElement("div", "component-detail-body");
    body.appendChild(createComponentSpecimen(component, familyId));
    body.appendChild(createContractDisclosure(component));
    detail.appendChild(body);
    return detail;
  }

  function setActiveTab(root, activeId, focusTab = false) {
    const tabs = Array.from(root.querySelectorAll("[data-component-tab]"));
    const panels = Array.from(root.querySelectorAll("[data-component-panel]"));

    tabs.forEach((tab) => {
      const isActive = tab.dataset.componentTab === activeId;
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.tabIndex = isActive ? 0 : -1;
      if (isActive && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.componentPanel === activeId;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  }

  function renderCatalog(root) {
    const totalComponents = componentFamilies.reduce((count, family) => count + family.components.length, 0);
    const header = createElement("div", "component-catalog-head");
    const intro = createElement("div", "component-catalog-intro");
    intro.appendChild(createElement("span", "token-name", "component model"));
    intro.appendChild(createElement("strong", "", "Specimen-first records with Material 3 coverage."));
    intro.appendChild(createElement("p", "", "Open a component to see the visual specimen first. States, variants, tokens, accessibility, and product usage stay one disclosure deeper."));
    header.appendChild(intro);

    const stats = createElement("div", "component-catalog-stats", "");
    [
      [6, "M3 groups"],
      [totalComponents, "specimens"],
      [4, "commerce flows"],
    ].forEach(([value, label]) => {
      const stat = createElement("span", "");
      stat.appendChild(createElement("strong", "", String(value)));
      stat.appendChild(createElement("em", "", label));
      stats.appendChild(stat);
    });
    header.appendChild(stats);
    root.appendChild(header);
    root.appendChild(createCoverageDisclosure(totalComponents));
    root.appendChild(createCommerceKitDisclosure());

    const tablist = createElement("div", "component-tablist");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "Component families");

    const panels = createElement("div", "component-panels");

    componentFamilies.forEach((family, familyIndex) => {
      const tab = createElement("button", "component-tab", family.label);
      const tabId = `component-tab-${family.id}`;
      const panelId = `component-panel-${family.id}`;
      tab.type = "button";
      tab.id = tabId;
      tab.dataset.componentTab = family.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panelId);
      tab.setAttribute("aria-selected", familyIndex === 0 ? "true" : "false");
      tab.tabIndex = familyIndex === 0 ? 0 : -1;
      tablist.appendChild(tab);

      const panel = createElement("section", "component-panel");
      panel.id = panelId;
      panel.dataset.componentPanel = family.id;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabId);
      panel.hidden = familyIndex !== 0;
      panel.classList.toggle("is-active", familyIndex === 0);

      const panelIntro = createElement("div", "component-family-intro");
      const panelCopy = createElement("div", "");
      panelCopy.appendChild(createElement("span", "token-name", `${String(family.components.length).padStart(2, "0")} records`));
      panelCopy.appendChild(createElement("strong", "", family.label));
      panelCopy.appendChild(createElement("p", "", family.lead));
      panelIntro.appendChild(panelCopy);
      panelIntro.appendChild(createElement("span", "component-family-count", `${family.components.length} components`));
      panel.appendChild(panelIntro);

      family.components.forEach((component, componentIndex) => {
        panel.appendChild(createDetail(component, family.id, familyIndex === 0 && componentIndex === 0));
      });

      panels.appendChild(panel);
    });

    root.appendChild(tablist);
    root.appendChild(panels);

    root.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const tableTarget = target?.closest("[data-table-variant-target]");
      if (tableTarget && root.contains(tableTarget)) {
        event.preventDefault();
        setActiveTableVariant(tableTarget.closest(".table-variant-gallery"), tableTarget.dataset.tableVariantTarget || "");
        return;
      }
      const tab = target?.closest("[data-component-tab]");
      if (!tab || !root.contains(tab)) return;
      setActiveTab(root, tab.dataset.componentTab || componentFamilies[0].id, true);
    });

    root.addEventListener("keydown", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const tableTarget = target?.closest("[data-table-variant-target]");
      if (tableTarget && root.contains(tableTarget)) {
        const gallery = tableTarget.closest(".table-variant-gallery");
        const buttons = Array.from(gallery?.querySelectorAll("[data-table-variant-target]") || []);
        const currentIndex = buttons.indexOf(tableTarget);
        const commands = {
          ArrowRight: (currentIndex + 1) % buttons.length,
          ArrowDown: (currentIndex + 1) % buttons.length,
          ArrowLeft: (currentIndex - 1 + buttons.length) % buttons.length,
          ArrowUp: (currentIndex - 1 + buttons.length) % buttons.length,
          Home: 0,
          End: buttons.length - 1,
        };
        if (!(event.key in commands) || currentIndex < 0) return;
        event.preventDefault();
        const nextButton = buttons[commands[event.key]];
        nextButton.focus();
        setActiveTableVariant(gallery, nextButton.dataset.tableVariantTarget || "");
        return;
      }
      const activeTab = target?.closest("[data-component-tab]");
      if (!activeTab || !root.contains(activeTab)) return;

      const tabs = Array.from(root.querySelectorAll("[data-component-tab]"));
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < 0) return;

      const commands = {
        ArrowRight: (currentIndex + 1) % tabs.length,
        ArrowDown: (currentIndex + 1) % tabs.length,
        ArrowLeft: (currentIndex - 1 + tabs.length) % tabs.length,
        ArrowUp: (currentIndex - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };

      if (!(event.key in commands)) return;
      event.preventDefault();
      const nextTab = tabs[commands[event.key]];
      setActiveTab(root, nextTab.dataset.componentTab || componentFamilies[0].id, true);
    });
  }

  function activateComponentHash(root, hash, shouldScroll = true) {
    if (!hash || !hash.startsWith("#component-")) return false;
    const record = root.querySelector(hash);
    if (!record) return false;
    const familyId = record.dataset.componentFamily || componentFamilies[0].id;
    setActiveTab(root, familyId, false);
    record.open = true;
    if (shouldScroll) {
      requestAnimationFrame(() => {
        record.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      });
    }
    return true;
  }

  const root = document.querySelector("[data-component-catalog]");
  if (root) {
    renderCatalog(root);
    activateComponentHash(root, window.location.hash, true);
    window.addEventListener("hashchange", () => activateComponentHash(root, window.location.hash, true));
    window.addEventListener("popstate", () => activateComponentHash(root, window.location.hash, true));
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest('a[href^="#component-"]');
      if (!link) return;
      activateComponentHash(root, link.getAttribute("href") || "", false);
    }, true);
  }
})();
