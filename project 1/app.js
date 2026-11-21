(() => {
  const initialProjects = [
    {
      id: "brand",
      name: "Brand refresh",
      description: "A fresh look for what’s next.",
      color: "lilac",
    },
    {
      id: "launch",
      name: "Product launch",
      description: "Make the new experience feel effortless.",
      color: "mint",
    },
    {
      id: "community",
      name: "Community hub",
      description: "A home for people building together.",
      color: "peach",
    },
  ];
  const initialFeedback = [
    {
      id: "f1",
      projectId: "brand",
      week: weekStart(new Date()),
      mood: "On track",
      progress: "Wrapped up the first round of identity concepts.",
      next: "Share directions with the team",
      blockers: "",
      created: Date.now() - 3600000,
    },
    {
      id: "f2",
      projectId: "launch",
      week: weekStart(new Date()),
      mood: "Needs attention",
      progress: "Checkout flow is ready for a quick usability pass.",
      next: "Schedule 3 customer sessions",
      blockers: "Waiting on final pricing details.",
      created: Date.now() - 86400000,
    },
    {
      id: "f3",
      projectId: "community",
      week: weekStart(new Date(Date.now() - 7 * 86400000)),
      mood: "On track",
      progress: "Invited our first group of beta members.",
      next: "Gather feedback from early members",
      blockers: "",
      created: Date.now() - 4 * 86400000,
    },
  ];
  const read = (key, fallback) => {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : fallback;
    } catch {
      return fallback;
    }
  };
  let projects = read("weeknote.projects", initialProjects);
  let feedback = read("weeknote.feedback", initialFeedback);
  let filter = "all";
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const iconFor = (color) =>
    ({ lilac: "✳", mint: "↗", peach: "◌", blue: "◇" })[color] || "✳";
  function weekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  }
  function dateLabel(value, opts = { month: "short", day: "numeric" }) {
    return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, opts);
  }
  function persist() {
    localStorage.setItem("weeknote.projects", JSON.stringify(projects));
    localStorage.setItem("weeknote.feedback", JSON.stringify(feedback));
  }
  function moodClass(mood) {
    return mood === "At risk"
      ? "risk"
      : mood === "Needs attention"
        ? "attention"
        : "";
  }
  function latestFor(id) {
    return feedback
      .filter((f) => f.projectId === id)
      .sort((a, b) => b.week.localeCompare(a.week))[0];
  }
  function render() {
    $("#projectNavCount").textContent = projects.length;
    $("#projectGrid").innerHTML = projects.length
      ? projects
          .map((p) => {
            const latest = latestFor(p.id),
              mood = latest?.mood || "On track";
            return `<article class="project-card" data-project="${esc(p.id)}"><div class="project-head"><div class="project-icon ${esc(p.color)}">${iconFor(p.color)}</div><button class="more" data-add-update="${esc(p.id)}" aria-label="Write update for ${esc(p.name)}">···</button></div><h3>${esc(p.name)}</h3><p class="description">${esc(p.description || "No description yet.")}</p><div class="project-foot"><span class="status ${moodClass(mood)}"><i></i>${esc(latest ? mood : "No updates yet")}</span><span class="update-count">${feedback.filter((f) => f.projectId === p.id).length} updates</span></div></article>`;
          })
          .join("")
      : '<div class="empty-state"><b>No projects yet</b>Add a project to start sharing weekly progress.</div>';
    const items = feedback
      .filter((f) => filter === "all" || f.projectId === filter)
      .sort((a, b) => b.week.localeCompare(a.week) || b.created - a.created);
    $("#feedbackList").innerHTML = items.length
      ? items
          .map((f) => {
            const p = projects.find((x) => x.id === f.projectId);
            if (!p) return "";
            return `<article class="feedback-row"><div class="row-icon project-icon ${esc(p.color)}">${iconFor(p.color)}</div><div><div class="row-project">${esc(p.name)}</div><div class="row-title">${esc(f.progress)}</div></div><div class="row-note">${f.next ? `Next: ${esc(f.next)}` : f.blockers ? `Blocker: ${esc(f.blockers)}` : "No next step added"}</div><div class="row-meta"><span class="row-status ${moodClass(f.mood)}">${esc(f.mood)}</span><div class="row-date">Week of ${dateLabel(f.week)}</div></div></article>`;
          })
          .join("")
      : '<div class="empty-state"><b>No feedback here yet</b>Write a weekly update to capture progress and next steps.</div>';
    $("#filterButton").innerHTML =
      `${filter === "all" ? "All projects" : esc(projects.find((p) => p.id === filter)?.name || "All projects")} <span>⌄</span>`;
    const options = projects
      .map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`)
      .join("");
    $("#feedbackProject").innerHTML =
      options || '<option value="">Add a project first</option>';
    $("#feedbackProject").disabled = !projects.length;
  }
  function toast(message) {
    const t = $("#toast");
    t.textContent = message;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
  }
  function openFeedback(projectId) {
    if (!projects.length) {
      openProject();
      return;
    }
    $("#feedbackForm").reset();
    $("#feedbackWeek").value = weekStart(new Date());
    if (projectId) $("#feedbackProject").value = projectId;
    $("#feedbackDialog").showModal();
  }
  function openProject() {
    $("#projectForm").reset();
    $("#projectDialog").showModal();
  }
  const now = new Date();
  $("#todayDate").textContent = now
    .toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
  $("#weekDate").textContent = dateLabel(weekStart(now));
  $("#newFeedback").addEventListener("click", () => openFeedback());
  $("#addProject").addEventListener("click", openProject);
  $("#filterButton").addEventListener("click", () => {
    const choices = [{ id: "all", name: "All projects" }, ...projects];
    const current = choices.findIndex((x) => x.id === filter);
    filter = choices[(current + 1) % choices.length].id;
    render();
  });
  $("#projectGrid").addEventListener("click", (e) => {
    const button = e.target.closest("[data-add-update]");
    if (button) {
      e.stopPropagation();
      openFeedback(button.dataset.addUpdate);
    }
  });
  $("#feedbackForm").addEventListener("submit", (e) => {
    if (e.submitter?.value === "cancel") return;
    e.preventDefault();
    if (!projects.length) return;
    feedback.unshift({
      id: crypto.randomUUID?.() || String(Date.now()),
      projectId: $("#feedbackProject").value,
      week: $("#feedbackWeek").value,
      mood: $("#feedbackMood").value,
      progress: $("#feedbackProgress").value.trim(),
      next: $("#feedbackNext").value.trim(),
      blockers: $("#feedbackBlockers").value.trim(),
      created: Date.now(),
    });
    persist();
    render();
    $("#feedbackDialog").close();
    toast("Weekly update posted");
  });
  $("#projectForm").addEventListener("submit", (e) => {
    if (e.submitter?.value === "cancel") return;
    e.preventDefault();
    const name = $("#projectName").value.trim();
    if (!name) return;
    projects.push({
      id: crypto.randomUUID?.() || String(Date.now()),
      name,
      description: $("#projectDescription").value.trim(),
      color: $("#projectColor").value,
    });
    persist();
    render();
    $("#projectDialog").close();
    toast("Project added");
  });
  persist();
  render();
})();
