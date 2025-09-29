import React, { useMemo, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowUpDown, Upload, Download, Sparkles, Save, FileText, Wand2, Link as LinkIcon, Mail, Github, Globe, GraduationCap, Building2, Briefcase, Settings2, ChevronRight, ChevronLeft, CirclePlus, X } from "lucide-react";

/**
 * Senior-level Resume Builder UI
 * - TailwindCSS styling
 * - Framer Motion micro-interactions
 * - shadcn/ui-like primitives (implemented inline to avoid external deps)
 * - Live preview
 * - Import/Export JSON
 * - Print to PDF (native browser)
 * - Supports: Profile, Experience (+bullets), Education, Skills (by category), Projects, and AI Optimize panel
 *
 * Integrations (wire these to your backend):
 * - POST /api/optimize-resume { profile, experience, education, skills, projects, jobDescription }
 *   -> returns { experience, education, skills, projects, summary, highlights }
 * - Optional: autosave endpoints
 */

/*********************
 * Minimal UI Primitives
 *********************/
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = ({ className = "", variant = "default", size = "md", children, ...props }) => {
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800",
    ghost: "bg-transparent hover:bg-neutral-100",
    outline: "border border-neutral-300 hover:bg-neutral-100",
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    subtle: "bg-neutral-100 hover:bg-neutral-200",
    destructive: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-5 text-lg",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl transition-all active:scale-[0.99]",
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props) => (
  <input
    {...props}
    className={cn(
      "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 outline-none",
      "focus:ring-2 focus:ring-indigo-500",
      props.className
    )}
  />
);

const TextArea = (props) => (
  <textarea
    {...props}
    className={cn(
      "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-2 outline-none min-h-[100px]",
      "focus:ring-2 focus:ring-indigo-500",
      props.className
    )}
  />
);

const Card = ({ className = "", children }) => (
  <div className={cn("rounded-3xl border border-neutral-200 bg-white shadow-sm", className)}>{children}</div>
);

const CardHeader = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-3 border-b border-neutral-200 p-5">
    {icon}
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
    </div>
  </div>
);

const CardBody = ({ className = "", children }) => (
  <div className={cn("p-5", className)}>{children}</div>
);

const SectionHeader = ({ title, actions }) => (
  <div className="mb-3 flex items-center justify-between">
    <h4 className="text-sm font-medium tracking-wide text-neutral-600 uppercase">{title}</h4>
    <div className="flex items-center gap-2">{actions}</div>
  </div>
);

/*********************
 * Types & Initial State
 *********************/
const emptyState = {
  profile: {
    name: "",
    role: "",
    email: "",
    linkedin: "",
    github: "",
    website: "",
  },
  experience: [
    // { company: "Movable Ink", position: "Software Developer", start: "2023-01", end: "Present", bullets: ["Built...", "Reduced..."] }
  ],
  education: [
    // { degree: "MS Computer Science", university: "Boston University", start: "2022", end: "2024", courses: "Distributed Systems, ML" }
  ],
  skills: {
    programming: [],
    data_ml: [],
    tools: [],
    cloud_devops: [],
    frameworks: [],
  },
  projects: [
    // { name: "Storyteller AI", link: "", description: "", bullets: ["...", "..."] }
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "PATCH":
      return { ...state, [action.key]: { ...state[action.key], ...action.value } };
    case "LOAD":
      return { ...action.value };
    default:
      return state;
  }
}

/*********************
 * Utilities
 *********************/
const download = (filename, text) => {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const uploadJson = () =>
  new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject("No file");
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result?.toString() || "{}"));
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

/*********************
 * Subcomponents
 *********************/
function ProfileForm({ state, dispatch }) {
  return (
    <Card>
      <CardHeader title="Profile" subtitle="Basic contact & headline" icon={<Settings2 className="size-5" />} />
      <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            placeholder="Jane Doe"
            value={state.profile.name}
            onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { name: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role / Headline</label>
          <Input
            placeholder="Backend Engineer / ML"
            value={state.profile.role}
            onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { role: e.target.value } })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-2.5 size-4 text-neutral-400" />
            <Input className="pl-10" placeholder="you@email.com" value={state.profile.email} onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { email: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">LinkedIn</label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-neutral-400" />
            <Input className="pl-10" placeholder="linkedin.com/in/username" value={state.profile.linkedin} onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { linkedin: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">GitHub</label>
          <div className="relative">
            <Github className="pointer-events-none absolute left-3 top-2.5 size-4 text-neutral-400" />
            <Input className="pl-10" placeholder="github.com/username" value={state.profile.github} onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { github: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3 top-2.5 size-4 text-neutral-400" />
            <Input className="pl-10" placeholder="portfolio.site" value={state.profile.website} onChange={(e) => dispatch({ type: "PATCH", key: "profile", value: { website: e.target.value } })} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ExperienceForm({ state, dispatch }) {
  const add = () => dispatch({ type: "SET", key: "experience", value: [...state.experience, { company: "", position: "", start: "", end: "", bullets: [] }] });
  const update = (i, patch) => {
    const copy = [...state.experience];
    copy[i] = { ...copy[i], ...patch };
    dispatch({ type: "SET", key: "experience", value: copy });
  };
  const remove = (i) => {
    const copy = state.experience.filter((_, idx) => idx !== i);
    dispatch({ type: "SET", key: "experience", value: copy });
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= state.experience.length) return;
    const copy = [...state.experience];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    dispatch({ type: "SET", key: "experience", value: copy });
  };
  const addBullet = (i) => update(i, { bullets: [...(state.experience[i].bullets || []), ""] });
  const updateBullet = (i, bi, text) => {
    const copy = [...state.experience];
    const bullets = [...(copy[i].bullets || [])];
    bullets[bi] = text;
    copy[i].bullets = bullets;
    dispatch({ type: "SET", key: "experience", value: copy });
  };
  const removeBullet = (i, bi) => {
    const copy = [...state.experience];
    const bullets = (copy[i].bullets || []).filter((_, idx) => idx !== bi);
    copy[i].bullets = bullets;
    dispatch({ type: "SET", key: "experience", value: copy });
  };

  return (
    <Card>
      <CardHeader title="Experience" subtitle="Companies, roles, dates & impact bullets" icon={<Briefcase className="size-5" />} />
      <CardBody>
        <SectionHeader
          title="Roles"
          actions={<Button variant="primary" size="sm" onClick={add}><CirclePlus className="size-4"/> Add role</Button>}
        />
        <div className="flex flex-col gap-4">
          {state.experience.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-neutral-500">
              No roles yet. Add your first experience.
            </div>
          )}
          {state.experience.map((exp, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neutral-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input value={exp.company} onChange={(e) => update(i, { company: e.target.value })} placeholder="Company" />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input value={exp.position} onChange={(e) => update(i, { position: e.target.value })} placeholder="Title" />
                </div>
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input value={exp.start} onChange={(e) => update(i, { start: e.target.value })} placeholder="YYYY-MM" />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input value={exp.end} onChange={(e) => update(i, { end: e.target.value })} placeholder="YYYY-MM or Present" />
                </div>
              </div>
              <div className="mt-3">
                <SectionHeader title="Impact Bullets" actions={<Button size="sm" variant="subtle" onClick={() => addBullet(i)}><Plus className="size-4"/> Bullet</Button>} />
                <div className="flex flex-col gap-2">
                  {(exp.bullets || []).map((b, bi) => (
                    <div key={bi} className="flex items-start gap-2">
                      <TextArea value={b} onChange={(e) => updateBullet(i, bi, e.target.value)} placeholder="Using XYZ formula: Achieved [X] by [Z], resulting in [Y]." />
                      <Button variant="destructive" size="sm" onClick={() => removeBullet(i, bi)}><Trash2 className="size-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-neutral-500">Tip: Quantify impact (%, time saved, cost reduced).</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => move(i, -1)}><ChevronUpIcon/> Up</Button>
                  <Button variant="outline" size="sm" onClick={() => move(i, +1)}><ChevronDownIcon/> Down</Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(i)}><Trash2 className="size-4"/> Remove</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function EducationForm({ state, dispatch }) {
  const add = () => dispatch({ type: "SET", key: "education", value: [...state.education, { degree: "", university: "", start: "", end: "", courses: "" }] });
  const update = (i, patch) => {
    const copy = [...state.education];
    copy[i] = { ...copy[i], ...patch };
    dispatch({ type: "SET", key: "education", value: copy });
  };
  const remove = (i) => dispatch({ type: "SET", key: "education", value: state.education.filter((_, idx) => idx !== i) });

  return (
    <Card>
      <CardHeader title="Education" subtitle="Degrees, institutions & relevant coursework" icon={<GraduationCap className="size-5" />} />
      <CardBody>
        <SectionHeader title="Entries" actions={<Button variant="primary" size="sm" onClick={add}><CirclePlus className="size-4"/> Add education</Button>} />
        <div className="flex flex-col gap-4">
          {state.education.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-neutral-500">No education entries yet.</div>
          )}
          {state.education.map((ed, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neutral-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">Degree</label>
                  <Input value={ed.degree} onChange={(e) => update(i, { degree: e.target.value })} placeholder="MS in Computer Science" />
                </div>
                <div>
                  <label className="text-sm font-medium">University</label>
                  <Input value={ed.university} onChange={(e) => update(i, { university: e.target.value })} placeholder="University" />
                </div>
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <Input value={ed.start} onChange={(e) => update(i, { start: e.target.value })} placeholder="YYYY" />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <Input value={ed.end} onChange={(e) => update(i, { end: e.target.value })} placeholder="YYYY" />
                </div>
                <div className="md:col-span-4">
                  <label className="text-sm font-medium">Relevant Courses</label>
                  <Input value={ed.courses} onChange={(e) => update(i, { courses: e.target.value })} placeholder="Distributed Systems, ML, ..." />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => remove(i)}><Trash2 className="size-4"/> Remove</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function TokenInput({ label, values, onChange, placeholder = "Comma-separated" }) {
  const [text, setText] = useState(values.join(", "));
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Input
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onChange(text.split(",").map((s) => s.trim()).filter(Boolean))}
      />
      <div className="mt-1 flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="rounded-full bg-neutral-100 px-3 py-1 text-xs">{v}</span>
        ))}
      </div>
    </div>
  );
}

function SkillsForm({ state, dispatch }) {
  const set = (key, value) => dispatch({ type: "SET", key: "skills", value: { ...state.skills, [key]: value } });
  return (
    <Card>
      <CardHeader title="Skills" subtitle="Group by category for tailored resumes" icon={<Settings2 className="size-5" />} />
      <CardBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TokenInput label="Programming Languages" values={state.skills.programming} onChange={(v) => set("programming", v)} />
        <TokenInput label="Data & Machine Learning" values={state.skills.data_ml} onChange={(v) => set("data_ml", v)} />
        <TokenInput label="Software & Tools" values={state.skills.tools} onChange={(v) => set("tools", v)} />
        <TokenInput label="Cloud & DevOps" values={state.skills.cloud_devops} onChange={(v) => set("cloud_devops", v)} />
        <TokenInput label="Frameworks & Libraries" values={state.skills.frameworks} onChange={(v) => set("frameworks", v)} />
      </CardBody>
    </Card>
  );
}

function ProjectsForm({ state, dispatch }) {
  const add = () => dispatch({ type: "SET", key: "projects", value: [...state.projects, { name: "", link: "", description: "", bullets: [] }] });
  const update = (i, patch) => {
    const copy = [...state.projects];
    copy[i] = { ...copy[i], ...patch };
    dispatch({ type: "SET", key: "projects", value: copy });
  };
  const remove = (i) => dispatch({ type: "SET", key: "projects", value: state.projects.filter((_, idx) => idx !== i) });
  const addBullet = (i) => update(i, { bullets: [...(state.projects[i].bullets || []), ""] });
  const updateBullet = (i, bi, text) => {
    const copy = [...state.projects];
    const bullets = [...(copy[i].bullets || [])];
    bullets[bi] = text;
    copy[i].bullets = bullets;
    dispatch({ type: "SET", key: "projects", value: copy });
  };
  const removeBullet = (i, bi) => {
    const copy = [...state.projects];
    const bullets = (copy[i].bullets || []).filter((_, idx) => idx !== bi);
    copy[i].bullets = bullets;
    dispatch({ type: "SET", key: "projects", value: copy });
  };

  return (
    <Card>
      <CardHeader title="Projects" subtitle="Personal & work projects with impact" icon={<Building2 className="size-5" />} />
      <CardBody>
        <SectionHeader title="Items" actions={<Button variant="primary" size="sm" onClick={add}><CirclePlus className="size-4"/> Add project</Button>} />
        <div className="flex flex-col gap-4">
          {state.projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-neutral-500">No projects yet.</div>
          )}
          {state.projects.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-neutral-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={p.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Project name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Link</label>
                  <Input value={p.link} onChange={(e) => update(i, { link: e.target.value })} placeholder="https://..." />
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm font-medium">Short description</label>
                  <Input value={p.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="One-line summary" />
                </div>
              </div>
              <div className="mt-3">
                <SectionHeader title="Impact Bullets" actions={<Button size="sm" variant="subtle" onClick={() => addBullet(i)}><Plus className="size-4"/> Bullet</Button>} />
                <div className="flex flex-col gap-2">
                  {(p.bullets || []).map((b, bi) => (
                    <div key={bi} className="flex items-start gap-2">
                      <TextArea value={b} onChange={(e) => updateBullet(i, bi, e.target.value)} placeholder="What changed because of this project?" />
                      <Button variant="destructive" size="sm" onClick={() => removeBullet(i, bi)}><Trash2 className="size-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => remove(i)}><Trash2 className="size-4"/> Remove</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function OptimizePanel({ state, onOptimize, loading, result }) {
  const [jd, setJd] = useState("");
  return (
    <Card>
      <CardHeader title="AI Optimize" subtitle="Paste a job description to tailor bullets & highlights" icon={<Wand2 className="size-5" />} />
      <CardBody>
        <label className="text-sm font-medium">Job Description</label>
        <TextArea placeholder="Paste JD here..." value={jd} onChange={(e) => setJd(e.target.value)} />
        <div className="mt-3 flex items-center gap-2">
          <Button variant="primary" onClick={() => onOptimize(jd)} disabled={!jd || loading}>
            <Sparkles className="size-4" /> {loading ? "Optimizing..." : "Optimize with AI"}
          </Button>
          <span className="text-xs text-neutral-500">We’ll align verbs, quantify impact, and select relevant skills.</span>
        </div>
        {result && (
          <div className="mt-4 rounded-2xl border border-neutral-200 p-4">
            <h4 className="mb-2 text-sm font-semibold">AI Suggestions</h4>
            {result.summary && <p className="mb-2 text-sm text-neutral-700">{result.summary}</p>}
            {result.highlights && result.highlights.length > 0 && (
              <ul className="list-inside list-disc text-sm text-neutral-800">
                {result.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/*********************
 * Preview
 *********************/
function ResumePreview({ state }) {
  const heading = state.profile.role || "Resume";
  return (
    <div className="sticky top-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 text-white">
          <h1 className="text-2xl font-semibold">{state.profile.name || "Your Name"}</h1>
          <p className="text-sm opacity-90">{heading}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs opacity-90">
            {state.profile.email && (
              <span className="inline-flex items-center gap-1"><Mail className="size-3" /> {state.profile.email}</span>
            )}
            {state.profile.linkedin && (
              <span className="inline-flex items-center gap-1"><LinkIcon className="size-3" /> {state.profile.linkedin}</span>
            )}
            {state.profile.github && (
              <span className="inline-flex items-center gap-1"><Github className="size-3" /> {state.profile.github}</span>
            )}
            {state.profile.website && (
              <span className="inline-flex items-center gap-1"><Globe className="size-3" /> {state.profile.website}</span>
            )}
          </div>
        </div>
        <div className="p-6">
          {state.experience.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-600">EXPERIENCE</h3>
              <div className="flex flex-col gap-4">
                {state.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between">
                      <div className="font-medium">{exp.position} · {exp.company}</div>
                      <div className="text-xs text-neutral-500">{[exp.start, exp.end].filter(Boolean).join(" — ")}</div>
                    </div>
                    {(exp.bullets || []).length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-sm text-neutral-800">
                        {exp.bullets.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.projects.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-600">PROJECTS</h3>
              <div className="flex flex-col gap-3">
                {state.projects.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between">
                      <div className="font-medium">
                        {p.name} {p.link && <a className="text-indigo-600 hover:underline" href={p.link} target="_blank" rel="noreferrer">↗</a>}
                      </div>
                    </div>
                    {p.description && <p className="text-sm text-neutral-700">{p.description}</p>}
                    {(p.bullets || []).length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-sm text-neutral-800">
                        {p.bullets.map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.education.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-600">EDUCATION</h3>
              <div className="flex flex-col gap-2">
                {state.education.map((ed, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-baseline justify-between">
                      <div className="font-medium">{ed.degree} · {ed.university}</div>
                      <div className="text-xs text-neutral-500">{[ed.start, ed.end].filter(Boolean).join(" — ")}</div>
                    </div>
                    {ed.courses && <div className="text-neutral-700">Relevant: {ed.courses}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.values(state.skills).some((arr) => arr.length > 0) && (
            <div>
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-600">SKILLS</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {state.skills.programming.length > 0 && <SkillLine label="Programming" items={state.skills.programming} />}
                {state.skills.data_ml.length > 0 && <SkillLine label="Data & ML" items={state.skills.data_ml} />}
                {state.skills.tools.length > 0 && <SkillLine label="Software & Tools" items={state.skills.tools} />}
                {state.skills.cloud_devops.length > 0 && <SkillLine label="Cloud & DevOps" items={state.skills.cloud_devops} />}
                {state.skills.frameworks.length > 0 && <SkillLine label="Frameworks" items={state.skills.frameworks} />}
              </div>
            </div>
          )}
        </div>
      </Card>
      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" onClick={() => window.print()}><FileText className="size-4"/> Print / Save PDF</Button>
      </div>
    </div>
  );
}

const SkillLine = ({ label, items }) => (
  <div className="text-sm">
    <span className="font-medium">{label}: </span>
    <span className="text-neutral-700">{items.join(", ")}</span>
  </div>
);

/*********************
 * Navigation
 *********************/
const STEPS = [
  { key: "profile", label: "Profile", icon: Settings2 },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Settings2 },
  { key: "projects", label: "Projects", icon: Building2 },
  { key: "optimize", label: "AI Optimize", icon: Wand2 },
];

function Sidebar({ current, setCurrent, onExport, onImport, onReset }) {
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-4 p-4">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Resume Builder</h2>
          <p className="text-sm text-neutral-500">Design · Structure · Optimize</p>
        </div>
        <nav className="flex-1 space-y-1">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = current === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setCurrent(s.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition",
                  active ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
                )}
              >
                <Icon className="size-4" />
                <span className="text-sm">{s.label}</span>
                <ChevronRight className={cn("ml-auto size-4", active ? "opacity-100" : "opacity-0")} />
              </button>
            );
          })}
        </nav>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Button variant="subtle" onClick={onImport}><Upload className="size-4"/> Import</Button>
          <Button variant="outline" onClick={onExport}><Download className="size-4"/> Export</Button>
          <Button variant="ghost" onClick={onReset}><X className="size-4"/> Reset</Button>
          <Button variant="primary" onClick={() => window.print()}><FileText className="size-4"/> PDF</Button>
        </div>
      </CardBody>
    </Card>
  );
}

/*********************
 * Icons for movement
 *********************/
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/></svg>;

/*********************
 * Main App
 *********************/
export default function ResumeBuilderApp() {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [current, setCurrent] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const onExport = () => download(`resume-data-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(state, null, 2));
  const onImport = async () => {
    try {
      const data = await uploadJson();
      dispatch({ type: "LOAD", value: { ...emptyState, ...data } });
    } catch (e) {
      alert("Invalid JSON file");
    }
  };
  const onReset = () => dispatch({ type: "LOAD", value: emptyState });

  const onOptimize = async (jobDescription) => {
    setLoading(true);
    try {
      // Wire to your backend here
      // Example:
      // const res = await fetch("/api/optimize-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...state, jobDescription })});
      // const data = await res.json();
      // setAiResult(data);

      // Mock response for demo
      await new Promise((r) => setTimeout(r, 900));
      const mock = {
        summary: "Tailored for Backend/ML role: emphasized rate limiting, data pipelines, and cloud ops.",
        highlights: [
          "Quantify reliability gains (e.g., -30% rate-limit errors) in first bullet of most recent role.",
          "Surface Python, FastAPI, Django, gRPC in Programming/Frameworks; group cloud skills under AWS/GCP.",
          "Prioritize ML projects showcasing model deployment, monitoring, and data quality checks.",
        ],
      };
      setAiResult(mock);
    } catch (e) {
      console.error(e);
      alert("Optimization failed. Check network or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-neutral-900 text-white"><Sparkles className="size-4"/></div>
          <div>
            <h1 className="text-xl font-semibold">Gorgeous Resume Builder</h1>
            <p className="text-sm text-neutral-500">Craft, preview, and tailor with AI.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="subtle" onClick={onExport}><Save className="size-4"/> Save JSON</Button>
          <Button variant="primary" onClick={() => window.print()}><FileText className="size-4"/> Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr_420px]">
        <Sidebar current={current} setCurrent={setCurrent} onExport={onExport} onImport={onImport} onReset={onReset} />

        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {current === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <ProfileForm state={state} dispatch={dispatch} />
              </motion.div>
            )}
            {current === "experience" && (
              <motion.div key="experience" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <ExperienceForm state={state} dispatch={dispatch} />
              </motion.div>
            )}
            {current === "education" && (
              <motion.div key="education" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <EducationForm state={state} dispatch={dispatch} />
              </motion.div>
            )}
            {current === "skills" && (
              <motion.div key="skills" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <SkillsForm state={state} dispatch={dispatch} />
              </motion.div>
            )}
            {current === "projects" && (
              <motion.div key="projects" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <ProjectsForm state={state} dispatch={dispatch} />
              </motion.div>
            )}
            {current === "optimize" && (
              <motion.div key="optimize" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <OptimizePanel state={state} onOptimize={onOptimize} loading={loading} result={aiResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ResumePreview state={state} />
      </div>

      <footer className="mt-8 text-center text-xs text-neutral-500">
        Pro tip: use concise, quantified bullets (impact → metric → method). Then tailor with the AI panel.
      </footer>
    </div>
  );
}
