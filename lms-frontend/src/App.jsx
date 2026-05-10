import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8000/api";

const colors = {
  primary: "var(--color-text-primary)",
  secondary: "var(--color-text-secondary)",
  border: "var(--color-border-tertiary)",
  borderHover: "var(--color-border-secondary)",
  bg: "var(--color-background-primary)",
  bgSecondary: "var(--color-background-secondary)",
  bgTertiary: "var(--color-background-tertiary)",
  success: "var(--color-text-success)",
  danger: "var(--color-text-danger)",
  info: "var(--color-text-info)",
  bgSuccess: "var(--color-background-success)",
  bgDanger: "var(--color-background-danger)",
  bgInfo: "var(--color-background-info)",
  bgWarning: "var(--color-background-warning)",
  warning: "var(--color-text-warning)",
};

// ── API helpers ──────────────────────────────────────────────────────────────
function authHeader(user) {
  return { Authorization: "Basic " + btoa(`${user.username}:${user.password}`) };
}

async function apiFetch(path, user, opts = {}) {
  const headers = {
    ...(user ? authHeader(user) : {}),
    ...(opts.isFormData ? {} : { "Content-Type": "application/json" }),
    ...opts.headers,
  };
  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

// ── tiny components ──────────────────────────────────────────────────────────
function Badge({ children, color = "info" }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: "var(--border-radius-md)",
      background: colors[`bg${color.charAt(0).toUpperCase() + color.slice(1)}`],
      color: colors[color], textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{children}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: colors.bg, border: `0.5px solid ${colors.border}`,
      borderRadius: "var(--border-radius-lg)", padding: "1.25rem",
      ...style,
    }}>{children}</div>
  );
}

function Button({ children, onClick, variant = "default", disabled, style = {} }) {
  const base = {
    padding: "8px 16px", borderRadius: "var(--border-radius-md)", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", fontSize: 14, fontWeight: 500, border: `0.5px solid ${colors.borderHover}`,
    transition: "opacity 0.15s", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const variants = {
    default: { background: colors.bg, color: colors.primary },
    primary: { background: colors.bgInfo, color: colors.info, border: `0.5px solid ${colors.info}` },
    danger:  { background: colors.bgDanger, color: colors.danger, border: `0.5px solid ${colors.danger}` },
    success: { background: colors.bgSuccess, color: colors.success, border: `0.5px solid ${colors.success}` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: `2px solid ${colors.border}`, borderTopColor: colors.info,
      borderRadius: "50%", animation: "spin 0.7s linear infinite",
    }} />
  );
}

function Alert({ type = "info", children }) {
  const map = {
    info:    { bg: colors.bgInfo,    text: colors.info },
    success: { bg: colors.bgSuccess, text: colors.success },
    danger:  { bg: colors.bgDanger,  text: colors.danger },
    warning: { bg: colors.bgWarning, text: colors.warning },
  };
  return (
    <div style={{
      padding: "10px 14px", borderRadius: "var(--border-radius-md)",
      background: map[type].bg, color: map[type].text, fontSize: 14,
      marginBottom: "1rem",
    }}>{children}</div>
  );
}

function ScorePill({ pct }) {
  if (pct == null) return <Badge color="warning">Pending</Badge>;
  const color = pct >= 70 ? "success" : pct >= 40 ? "info" : "danger";
  return <Badge color={color}>{pct}%</Badge>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode]         = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("student");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function submit() {
    if (!username || !password) return setError("Fill all fields");
    setError(""); setLoading(true);
    try {
      if (mode === "register") {
        await apiFetch("/auth/register", null, {
          method: "POST",
          body: JSON.stringify({ username, password, role }),
        });
        setMode("login");
        setError("");
        alert("Registered! Please log in.");
      } else {
        const data = await apiFetch("/auth/login", null, {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        onLogin({ ...data, password });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.bgTertiary }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: colors.bgInfo,
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
          }}>
            <i className="ti ti-school" style={{ fontSize: 24, color: colors.info }} aria-hidden />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>AI Learning System</h1>
          <p style={{ color: colors.secondary, fontSize: 14, marginTop: 4 }}>Adaptive quizzes & assignments powered by Ollama</p>
        </div>

        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px", border: "none", borderRadius: "var(--border-radius-md)",
                background: mode === m ? colors.bgInfo : "transparent",
                color: mode === m ? colors.info : colors.secondary,
                fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>{m === "login" ? "Sign in" : "Register"}</button>
            ))}
          </div>

          {error && <Alert type="danger">{error}</Alert>}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username" onKeyDown={e => e.key === "Enter" && submit()} />
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="Password" onKeyDown={e => e.key === "Enter" && submit()} />
            {mode === "register" && (
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            )}
            <Button variant="primary" onClick={submit} disabled={loading} style={{ justifyContent: "center" }}>
              {loading ? <Spinner /> : (mode === "login" ? "Sign in" : "Create account")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEACHER PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function TeacherPortal({ user, onLogout }) {
  const [tab, setTab]         = useState("courses");
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  const loadCourses = useCallback(async () => {
    const data = await apiFetch("/teacher/courses", user);
    setCourses(data);
  }, [user]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  async function selectCourse(c) {
    setSelected(c);
    const s = await apiFetch(`/teacher/course/${c.id}/students`, user);
    setStudents(s);
    setTab("students");
  }

  async function evaluateAll() {
    if (!selected) return;
    setLoading(true); setMsg("");
    try {
      const res = await apiFetch(`/teacher/course/${selected.id}/evaluate-assignments`, user, { method: "POST" });
      setMsg(res.message);
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  }

  // Upload form
  const [title, setTitle]     = useState("");
  const [topic, setTopic]     = useState("");
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  async function uploadCourse() {
    if (!title || !topic || !file) return setUploadMsg("Fill all fields and pick a file");
    setUploading(true); setUploadMsg("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("topic", topic);
      form.append("file", file);
      const res = await fetch(`${API}/teacher/upload-course`, {
        method: "POST", headers: authHeader(user), body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setUploadMsg(`✓ ${data.message}`);
      setTitle(""); setTopic(""); setFile(null);
      setTimeout(loadCourses, 2000);
    } catch (e) { setUploadMsg(e.message); }
    finally { setUploading(false); }
  }

  const tabs = [
    { id: "courses",  label: "My Courses",  icon: "ti-books" },
    { id: "upload",   label: "Upload Course", icon: "ti-upload" },
    { id: "students", label: "Student Results", icon: "ti-users" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bgTertiary }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top Nav */}
      <div style={{
        background: colors.bg, borderBottom: `0.5px solid ${colors.border}`,
        padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", height: 56,
      }}>
        <i className="ti ti-school" style={{ fontSize: 22, color: colors.info }} aria-hidden />
        <span style={{ fontWeight: 500 }}>AI-LMS</span>
        <Badge color="info">Teacher</Badge>
        <span style={{ color: colors.secondary, fontSize: 13 }}>{user.username}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "6px 14px", border: "none", borderRadius: "var(--border-radius-md)",
              background: tab === t.id ? colors.bgInfo : "transparent",
              color: tab === t.id ? colors.info : colors.secondary,
              fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 16 }} aria-hidden />{t.label}
            </button>
          ))}
          <Button onClick={onLogout} style={{ marginLeft: 8 }}>
            <i className="ti ti-logout" aria-hidden /> Sign out
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1.5rem" }}>

        {/* COURSES TAB */}
        {tab === "courses" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>My Courses</h2>
              <Button onClick={loadCourses}><i className="ti ti-refresh" aria-hidden /> Refresh</Button>
            </div>
            {courses.length === 0
              ? <Alert type="info">No courses yet. Upload your first course.</Alert>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {courses.map(c => (
                    <Card key={c.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "var(--border-radius-md)",
                        background: colors.bgInfo, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <i className="ti ti-file-text" style={{ fontSize: 20, color: colors.info }} aria-hidden />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{c.title}</p>
                        <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>{c.topic} · {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge color={c.status === "ready" ? "success" : c.status.startsWith("error") ? "danger" : "warning"}>
                        {c.status === "ready" ? "Ready" : c.status.startsWith("error") ? "Error" : "Processing…"}
                      </Badge>
                      {c.status === "ready" && (
                        <Button onClick={() => selectCourse(c)}>
                          <i className="ti ti-users" aria-hidden /> View students
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
          </>
        )}

        {/* UPLOAD TAB */}
        {tab === "upload" && (
          <>
            <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>Upload Course Material</h2>
            <Card style={{ maxWidth: 520 }}>
              {uploadMsg && <Alert type={uploadMsg.startsWith("✓") ? "success" : "danger"}>{uploadMsg}</Alert>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: colors.secondary, display: "block", marginBottom: 4 }}>Course title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to C++" style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: colors.secondary, display: "block", marginBottom: 4 }}>Topic / subject</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. C++ Programming" style={{ width: "100%", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: colors.secondary, display: "block", marginBottom: 4 }}>Course file</label>
                  <input type="file" accept=".pdf,.pptx,.docx,.txt"
                    onChange={e => setFile(e.target.files[0])}
                    style={{ fontSize: 13 }} />
                  <p style={{ fontSize: 12, color: colors.secondary, margin: "4px 0 0" }}>Accepted: PDF, PPTX, DOCX, TXT</p>
                </div>
                <Button variant="primary" onClick={uploadCourse} disabled={uploading} style={{ justifyContent: "center" }}>
                  {uploading ? <><Spinner /> Uploading & generating…</> : <><i className="ti ti-upload" aria-hidden /> Upload & generate quiz + assignment</>}
                </Button>
              </div>
            </Card>
            {uploading && (
              <Alert type="info" style={{ marginTop: "1rem" }}>
                Ollama is generating quiz and assignment in the background. This may take a few minutes. Check "My Courses" for status.
              </Alert>
            )}
          </>
        )}

        {/* STUDENTS TAB */}
        {tab === "students" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
                {selected ? `Students — ${selected.title}` : "Select a course first"}
              </h2>
              {selected && (
                <Button variant="primary" onClick={evaluateAll} disabled={loading}>
                  {loading ? <Spinner /> : <i className="ti ti-robot" aria-hidden />}
                  {loading ? " Evaluating…" : " Evaluate assignments (AI)"}
                </Button>
              )}
            </div>
            {msg && <Alert type="success">{msg}</Alert>}
            {!selected
              ? <Alert type="info">Go to "My Courses" and click "View students" on a course.</Alert>
              : students.length === 0
              ? <Alert type="warning">No students enrolled yet.</Alert>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {students.map((s, i) => (
                    <Card key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%", background: colors.bgSecondary,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 500, fontSize: 13, color: colors.secondary,
                        }}>{s.username[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500 }}>{s.username}</p>
                        </div>
                        <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, color: colors.secondary, fontSize: 11, marginBottom: 2 }}>Quiz</p>
                            <ScorePill pct={s.quiz_pct} />
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <p style={{ margin: 0, color: colors.secondary, fontSize: 11, marginBottom: 2 }}>Assignment</p>
                            {s.assign_evaluated
                              ? <ScorePill pct={s.assign_pct} />
                              : s.assign_score !== null
                              ? <Badge color="warning">Submitted</Badge>
                              : <Badge color="warning">Pending</Badge>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function StudentPortal({ user, onLogout }) {
  const [tab, setTab]         = useState("courses");
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);
  const [view, setView]       = useState(null); // "quiz" | "assignment" | "quiz_result" | "assign_result"

  const loadCourses = useCallback(async () => {
    const d = await apiFetch("/student/courses", user);
    setCourses(d);
  }, [user]);

  const loadProfile = useCallback(async () => {
    const d = await apiFetch("/student/profile", user);
    setProfile(d);
  }, [user]);

  useEffect(() => {
    loadCourses();
    loadProfile();
  }, [loadCourses, loadProfile]);

  async function enroll(courseId) {
    try {
      await apiFetch(`/student/enroll/${courseId}`, user, { method: "POST" });
      loadCourses();
    } catch (e) { alert(e.message); }
  }

  function openView(course, v) {
    setActiveCourse(course);
    setView(v);
    setTab("activity");
  }

  const tabs = [
    { id: "courses",  label: "Courses",   icon: "ti-books" },
    { id: "activity", label: "Activity",  icon: "ti-clipboard-text" },
    { id: "profile",  label: "My Profile", icon: "ti-user" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.bgTertiary }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top Nav */}
      <div style={{
        background: colors.bg, borderBottom: `0.5px solid ${colors.border}`,
        padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", height: 56,
      }}>
        <i className="ti ti-school" style={{ fontSize: 22, color: colors.success }} aria-hidden />
        <span style={{ fontWeight: 500 }}>AI-LMS</span>
        <Badge color="success">Student</Badge>
        <span style={{ color: colors.secondary, fontSize: 13 }}>{user.username}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setView(null); }} style={{
              padding: "6px 14px", border: "none", borderRadius: "var(--border-radius-md)",
              background: tab === t.id ? colors.bgSuccess : "transparent",
              color: tab === t.id ? colors.success : colors.secondary,
              fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className={`ti ${t.icon}`} style={{ fontSize: 16 }} aria-hidden />{t.label}
            </button>
          ))}
          <Button onClick={onLogout} style={{ marginLeft: 8 }}>
            <i className="ti ti-logout" aria-hidden /> Sign out
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1.5rem" }}>

        {/* COURSES TAB */}
        {tab === "courses" && (
          <>
            <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>Available Courses</h2>
            {courses.length === 0
              ? <Alert type="info">No courses available yet. Check back later.</Alert>
              : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {courses.map(c => (
                    <Card key={c.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "var(--border-radius-md)",
                        background: colors.bgSuccess, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <i className="ti ti-file-text" style={{ fontSize: 20, color: colors.success }} aria-hidden />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{c.title}</p>
                        <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>{c.topic}</p>
                      </div>
                      {c.enrolled ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button onClick={() => openView(c, "quiz")}>
                            <i className="ti ti-help" aria-hidden /> Quiz
                          </Button>
                          <Button onClick={() => openView(c, "assignment")}>
                            <i className="ti ti-clipboard-text" aria-hidden /> Assignment
                          </Button>
                        </div>
                      ) : (
                        <Button variant="primary" onClick={() => enroll(c.id)}>
                          <i className="ti ti-plus" aria-hidden /> Enroll
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
          </>
        )}

        {/* ACTIVITY TAB */}
        {tab === "activity" && (
          <>
            {!view && (
              <Alert type="info">Select a course from the Courses tab and click Quiz or Assignment.</Alert>
            )}
            {view === "quiz"       && <QuizView course={activeCourse} user={user} onDone={() => { loadProfile(); setView("quiz_result"); }} />}
            {view === "assignment" && <AssignmentView course={activeCourse} user={user} onDone={() => { loadProfile(); setView("assign_result"); }} />}
            {view === "quiz_result"    && <QuizResultView course={activeCourse} user={user} />}
            {view === "assign_result"  && <AssignResultView course={activeCourse} user={user} />}
          </>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && profile && (
          <>
            <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>My Profile</h2>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
              {[
                { label: "Username",    value: profile.username },
                { label: "Level",       value: profile.level || "—", badge: true },
                { label: "Avg score",   value: profile.avg_score != null ? `${profile.avg_score}%` : "—" },
              ].map(s => (
                <div key={s.label} style={{
                  background: colors.bgSecondary, borderRadius: "var(--border-radius-md)",
                  padding: "1rem", textAlign: "center",
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: colors.secondary }}>{s.label}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 500 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quiz history */}
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 0.75rem" }}>Quiz history</h3>
            {profile.quizzes.length === 0
              ? <Alert type="info">No quiz submissions yet.</Alert>
              : profile.quizzes.map((q, i) => (
                <Card key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className="ti ti-help" style={{ fontSize: 20, color: colors.info }} aria-hidden />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{q.title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>
                        {q.score}/{q.total} correct · {new Date(q.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ScorePill pct={q.percentage} />
                  </div>
                  {q.feedback && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {q.feedback.map((fb, j) => (
                        <div key={j} style={{
                          padding: "6px 10px", borderRadius: "var(--border-radius-md)",
                          background: fb.is_correct ? colors.bgSuccess : colors.bgDanger, fontSize: 13,
                        }}>
                          <span style={{ color: fb.is_correct ? colors.success : colors.danger, fontWeight: 500 }}>
                            Q{fb.question_id}: {fb.is_correct ? "✓ Correct" : `✗ You answered ${fb.your_answer}, correct: ${fb.correct}`}
                          </span>
                          <span style={{ color: colors.secondary, marginLeft: 8 }}>{fb.explanation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}

            {/* Assignment history */}
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: "1.5rem 0 0.75rem" }}>Assignment history</h3>
            {profile.assignments.length === 0
              ? <Alert type="info">No assignment submissions yet.</Alert>
              : profile.assignments.map((a, i) => (
                <Card key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className="ti ti-clipboard-text" style={{ fontSize: 20, color: colors.success }} aria-hidden />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{a.title}</p>
                      <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>
                        Submitted {new Date(a.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    {a.evaluated ? <ScorePill pct={a.percentage} /> : <Badge color="warning">Awaiting evaluation</Badge>}
                  </div>
                </Card>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Quiz attempt view ───────────────────────────────────────────────────────
function QuizView({ course, user, onDone }) {
  const [quiz, setQuiz]       = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    apiFetch(`/student/quiz/${course.id}`, user)
      .then(d => { setQuiz(d.quiz); setLoading(false); })
      .catch(e => {
        if (e.message.includes("already submitted")) setAlreadyDone(true);
        setError(e.message);
        setLoading(false);
      });
  }, [course.id, user]);

  async function submit() {
    setSubmitting(true); setError("");
    try {
      await apiFetch(`/student/quiz/${course.id}/submit`, user, {
        method: "POST", body: JSON.stringify({ answers }),
      });
      onDone();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return <Alert type="info"><Spinner /> Loading quiz…</Alert>;
  if (alreadyDone) return (
    <Alert type="warning">
      You already submitted this quiz. <button onClick={onDone} style={{ background: "none", border: "none", cursor: "pointer", color: colors.info, textDecoration: "underline" }}>View result</button>
    </Alert>
  );
  if (error) return <Alert type="danger">{error}</Alert>;
  if (!quiz) return null;

  const answered = Object.keys(answers).length;
  const total    = quiz.questions?.length || 0;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{course.title} — Quiz</h2>
        <Badge color="info">{quiz.difficulty}</Badge>
        <span style={{ color: colors.secondary, fontSize: 13, marginLeft: "auto" }}>{answered}/{total} answered</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {quiz.questions?.map(q => (
          <Card key={q.id}>
            <p style={{ fontWeight: 500, margin: "0 0 12px" }}>Q{q.id}. {q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(q.options).map(([opt, text]) => {
                const chosen = answers[String(q.id)] === opt;
                return (
                  <button key={opt} onClick={() => setAnswers(p => ({ ...p, [String(q.id)]: opt }))} style={{
                    padding: "10px 14px", border: `0.5px solid ${chosen ? colors.info : colors.border}`,
                    borderRadius: "var(--border-radius-md)", background: chosen ? colors.bgInfo : colors.bg,
                    color: chosen ? colors.info : colors.primary, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                    fontWeight: chosen ? 500 : 400,
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: chosen ? colors.info : colors.bgSecondary,
                      color: chosen ? "#fff" : colors.secondary,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500,
                    }}>{opt}</span>
                    {text}
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {error && <Alert type="danger" style={{ marginTop: "1rem" }}>{error}</Alert>}
      <div style={{ marginTop: "1.5rem" }}>
        <Button variant="primary" onClick={submit} disabled={submitting || answered < total} style={{ justifyContent: "center" }}>
          {submitting ? <><Spinner /> Submitting…</> : "Submit Quiz"}
        </Button>
        {answered < total && (
          <span style={{ marginLeft: 12, fontSize: 13, color: colors.secondary }}>Answer all questions to submit</span>
        )}
      </div>
    </>
  );
}

// ─── Quiz result view ────────────────────────────────────────────────────────
function QuizResultView({ course, user }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/student/quiz/${course.id}/result`, user)
      .then(d => { setResult(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [course.id, user]);

  if (loading) return <Alert type="info"><Spinner /> Loading result…</Alert>;
  if (!result) return <Alert type="danger">Could not load result.</Alert>;

  return (
    <>
      <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>Quiz Result — {course.title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Score",      value: `${result.score} / ${result.total}` },
          { label: "Percentage", value: `${result.percentage}%` },
          { label: "Status",     value: result.percentage >= 40 ? "Passed" : "Failed" },
        ].map(s => (
          <div key={s.label} style={{ background: colors.bgSecondary, borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: colors.secondary }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 500 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 0.75rem" }}>Question breakdown</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {result.feedback?.map((fb, i) => (
          <Card key={i} style={{ borderLeft: `3px solid ${fb.is_correct ? "#1D9E75" : "#D85A30"}` }}>
            <p style={{ margin: "0 0 6px", fontWeight: 500, fontSize: 14 }}>{fb.question}</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: fb.is_correct ? colors.success : colors.danger }}>
              {fb.is_correct ? "✓ Correct" : `✗ You chose ${fb.your_answer} · Correct: ${fb.correct}`}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: colors.secondary }}>{fb.explanation}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

// ─── Assignment attempt view ─────────────────────────────────────────────────
function AssignmentView({ course, user, onDone }) {
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    apiFetch(`/student/assignment/${course.id}`, user)
      .then(d => { setAssignment(d.assignment); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [course.id, user]);

  async function submit() {
    setSubmitting(true); setError("");
    try {
      await apiFetch(`/student/assignment/${course.id}/submit`, user, {
        method: "POST", body: JSON.stringify({ answers }),
      });
      onDone();
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return <Alert type="info"><Spinner /> Loading assignment…</Alert>;
  if (error)   return <Alert type="danger">{error}</Alert>;
  if (!assignment) return null;

  const allAnswered = assignment.tasks?.every(t => answers[String(t.task_number)]?.trim());

  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{assignment.title}</h2>
          <Badge color="success">{assignment.difficulty}</Badge>
          <Badge color="info">{assignment.total_marks} marks</Badge>
        </div>
        <p style={{ margin: 0, color: colors.secondary, fontSize: 14 }}>{assignment.description}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {assignment.tasks?.map(task => (
          <Card key={task.task_number}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{
                background: colors.bgSuccess, color: colors.success, fontWeight: 500,
                fontSize: 12, padding: "2px 8px", borderRadius: "var(--border-radius-md)",
              }}>Task {task.task_number}</span>
              <span style={{ fontSize: 12, color: colors.secondary, marginLeft: "auto" }}>{task.marks} marks</span>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 14 }}>{task.instructions}</p>
            <textarea
              value={answers[String(task.task_number)] || ""}
              onChange={e => setAnswers(p => ({ ...p, [String(task.task_number)]: e.target.value }))}
              placeholder="Write your answer here…"
              rows={5}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", fontSize: 14 }}
            />
          </Card>
        ))}
      </div>

      {error && <Alert type="danger" style={{ marginTop: "1rem" }}>{error}</Alert>}
      <Alert type="info" style={{ marginTop: "1rem" }}>
        After submitting, your teacher will trigger AI evaluation. Check your profile for results.
      </Alert>
      <div style={{ marginTop: "1rem" }}>
        <Button variant="primary" onClick={submit} disabled={submitting || !allAnswered} style={{ justifyContent: "center" }}>
          {submitting ? <><Spinner /> Submitting…</> : "Submit Assignment"}
        </Button>
      </div>
    </>
  );
}

// ─── Assignment result view ──────────────────────────────────────────────────
function AssignResultView({ course, user }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/student/assignment/${course.id}/result`, user)
      .then(d => { setResult(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [course.id, user]);

  if (loading) return <Alert type="info"><Spinner /> Loading result…</Alert>;
  if (!result) return <Alert type="danger">Could not load result.</Alert>;

  if (!result.evaluated) return (
    <Alert type="warning">
      Your assignment has been submitted and is awaiting AI evaluation by your teacher.
    </Alert>
  );

  return (
    <>
      <h2 style={{ margin: "0 0 1.5rem", fontSize: 18, fontWeight: 500 }}>Assignment Result — {course.title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Score",      value: `${result.score} / ${result.total}` },
          { label: "Percentage", value: `${result.percentage}%` },
          { label: "Grade",      value: result.percentage >= 70 ? "Distinction" : result.percentage >= 40 ? "Pass" : "Fail" },
        ].map(s => (
          <div key={s.label} style={{ background: colors.bgSecondary, borderRadius: "var(--border-radius-md)", padding: "1rem", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: colors.secondary }}>{s.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 500 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {result.feedback?.map((fb, i) => (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>Task {fb.task_number}</span>
              <ScorePill pct={fb.max_marks > 0 ? Math.round((fb.score / fb.max_marks) * 100) : 0} />
              <span style={{ fontSize: 13, color: colors.secondary, marginLeft: "auto" }}>{fb.score} / {fb.max_marks} marks</span>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: colors.secondary }}>{fb.feedback}</p>
            {fb.strengths?.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: colors.success, fontWeight: 500 }}>Strengths: </span>
                <span style={{ fontSize: 13, color: colors.secondary }}>{fb.strengths.join(", ")}</span>
              </div>
            )}
            {fb.improvements?.length > 0 && (
              <div>
                <span style={{ fontSize: 12, color: colors.warning, fontWeight: 500 }}>Improvements: </span>
                <span style={{ fontSize: 13, color: colors.secondary }}>{fb.improvements.join(", ")}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("lms_user")); }
    catch { return null; }
  });

  function handleLogin(u) {
    sessionStorage.setItem("lms_user", JSON.stringify(u));
    setUser(u);
  }

  function handleLogout() {
    sessionStorage.removeItem("lms_user");
    setUser(null);
  }

  if (!user) return <AuthScreen onLogin={handleLogin} />;
  if (user.role === "teacher") return <TeacherPortal user={user} onLogout={handleLogout} />;
  return <StudentPortal user={user} onLogout={handleLogout} />;
}
