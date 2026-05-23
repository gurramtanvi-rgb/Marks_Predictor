import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import {
  RiRobot2Line,
  RiBookOpenLine,
  RiUserHeartLine,
  RiMedalLine,
  RiFileTextLine,
  RiMoonLine,
  RiBarChartBoxLine,
  RiSparklingLine,
  RiDownload2Line,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiLightbulbLine,
  RiHistoryLine,
  RiDeleteBin6Line,
  RiArrowUpLine,
} from "react-icons/ri";
import "./App.css";

const DEFAULT_FORM = {
  study_hours: 6,
  attendance: 80,
  previous_marks: 75,
  assignments: 80,
  sleep_hours: 7,
  mock_test: 75,
};

const LOADING_STEPS = [
  "Analyzing Academic Performance...",
  "Generating AI Insights...",
  "Predicting Final Outcome...",
];

function getGrade(marks) {
  if (marks >= 90) return { grade: "A+", label: "Outstanding", color: "#a78bfa" };
  if (marks >= 80) return { grade: "A", label: "Excellent", color: "#60a5fa" };
  if (marks >= 70) return { grade: "B", label: "Very Good", color: "#34d399" };
  if (marks >= 60) return { grade: "C", label: "Good", color: "#fbbf24" };
  if (marks >= 50) return { grade: "D", label: "Average", color: "#f97316" };
  return { grade: "F", label: "Needs Improvement", color: "#f87171" };
}

function getConfidence(marks) {
  if (marks >= 85) return 97;
  if (marks >= 70) return 92;
  if (marks >= 55) return 87;
  return 81;
}

function generateInsights(form, marks) {
  const insights = [];
  const recommendations = [];

  if (form.attendance >= 90) insights.push({ icon: "✓", text: "Attendance is excellent — top 10% of students", type: "good" });
  else if (form.attendance >= 75) insights.push({ icon: "✓", text: "Attendance is satisfactory", type: "ok" });
  else insights.push({ icon: "⚠", text: "Attendance needs improvement — below recommended threshold", type: "warn" });

  if (form.mock_test >= 85) insights.push({ icon: "✓", text: "Mock test performance is strong — well-prepared", type: "good" });
  else if (form.mock_test >= 65) insights.push({ icon: "✓", text: "Mock test scores show steady progress", type: "ok" });
  else { insights.push({ icon: "⚠", text: "Mock test scores indicate exam readiness gaps", type: "warn" }); recommendations.push("Practice 2 mock tests per week"); }

  if (form.sleep_hours >= 7 && form.sleep_hours <= 9) insights.push({ icon: "✓", text: "Sleep schedule is healthy — optimal for memory retention", type: "good" });
  else if (form.sleep_hours < 6) { insights.push({ icon: "⚠", text: "Sleep deprivation may impact cognitive performance", type: "warn" }); recommendations.push("Aim for 7–8 hours of sleep nightly"); }
  else insights.push({ icon: "✓", text: "Sleep duration is adequate", type: "ok" });

  if (form.study_hours >= 7) insights.push({ icon: "✓", text: "Study routine is consistent and rigorous", type: "good" });
  else if (form.study_hours >= 4) insights.push({ icon: "✓", text: "Study hours are at a functional level", type: "ok" });
  else { insights.push({ icon: "⚠", text: "Study hours are below the recommended minimum", type: "warn" }); recommendations.push("Increase daily study time by at least 2 hours"); }

  if (form.assignments >= 90) insights.push({ icon: "✓", text: "Assignment completion rate is exemplary", type: "good" });
  else if (form.assignments >= 70) insights.push({ icon: "✓", text: "Assignment completion is acceptable", type: "ok" });
  else { insights.push({ icon: "⚠", text: "Assignment completion rate is low — impacting overall grade", type: "warn" }); recommendations.push("Complete all pending assignments before the exam"); }

  if (form.previous_marks >= 85) insights.push({ icon: "✓", text: "Strong academic history — clear foundation of excellence", type: "good" });
  else if (form.previous_marks >= 65) insights.push({ icon: "✓", text: "Previous performance shows consistent effort", type: "ok" });
  else recommendations.push("Revisit core concepts from previous semester");

  if (recommendations.length === 0) {
    recommendations.push("Continue your excellent academic habits");
    recommendations.push("Maintain this performance and aim for 100");
  }

  return { insights, recommendations };
}

function CircularMeter({ value }) {
  const radius = 80;
  const stroke = 10;
  const norm = radius - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const progress = ((value / 100) * circ).toFixed(2);

  return (
    <div className="meter-wrap">
      <svg width={radius * 2} height={radius * 2} className="meter-svg">
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx={radius} cy={radius} r={norm} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={radius} cy={radius} r={norm} fill="none"
          stroke="url(#meterGrad)" strokeWidth={stroke}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 0 8px #7c3aed)" }}
        />
        <text x={radius} y={radius - 6} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700" fontFamily="'Syne', sans-serif">{value}%</text>
        <text x={radius} y={radius + 18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="'DM Sans', sans-serif">Overall</text>
      </svg>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value}{payload[0].name === "score" ? "" : ""}</p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("marks_history") || "[]"); } catch { return []; }
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSlider = (key, val) => setForm((f) => ({ ...f, [key]: Number(val) }));

  const handlePredict = async () => {
    setLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 900);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      clearInterval(stepInterval);
      setLoading(false);

      const marks = parseFloat(data.predicted_marks.toFixed(2));
      const { grade, label, color } = getGrade(marks);
      const confidence = getConfidence(marks);
      const { insights, recommendations } = generateInsights(form, marks);

      const newEntry = { date: new Date().toLocaleDateString(), marks, grade, label };
      const newHistory = [newEntry, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("marks_history", JSON.stringify(newHistory));

      setResult({ marks, grade, label, color, confidence, insights, recommendations });

      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

      Swal.fire({
        background: "rgba(10,10,20,0.97)",
        color: "#fff",
        html: `
          <div class="swal-inner">
            <div class="swal-sparkles">
              <span class="swal-spark s1" style="background:${color}"></span>
              <span class="swal-spark s2" style="background:${color}"></span>
              <span class="swal-spark s3" style="background:${color}"></span>
              <span class="swal-spark s4" style="background:${color}"></span>
              <span class="swal-spark s5" style="background:${color}"></span>
              <span class="swal-spark s6" style="background:${color}"></span>
            </div>
            <div class="swal-glow" style="background:${color}33"></div>
            <div class="swal-grade-ring" style="border-color:${color};box-shadow:0 0 30px ${color}88,inset 0 0 20px ${color}11">
              <span class="swal-grade-text" style="color:${color}">${grade}</span>
            </div>
            <div class="swal-score-row">
              <span class="swal-marks">${marks}</span><span class="swal-marks-sub">/100</span>
            </div>
            <div class="swal-label" style="color:${color}">${label}</div>
            <div class="swal-divider" style="background:linear-gradient(90deg,transparent,${color}55,transparent)"></div>
            <div class="swal-meta">
              <div class="swal-meta-item">
                <span class="swal-meta-key">Confidence</span>
                <span class="swal-meta-val" style="color:${color}">${confidence}%</span>
              </div>
              <div class="swal-meta-sep" style="background:${color}33"></div>
              <div class="swal-meta-item">
                <span class="swal-meta-key">Category</span>
                <span class="swal-meta-val">${label}</span>
              </div>
            </div>
            <div class="swal-bar-wrap">
              <div class="swal-bar-labels"><span>0</span><span>50</span><span>100</span></div>
              <div class="swal-bar-track">
                <div class="swal-bar-fill" style="width:${marks}%;background:linear-gradient(90deg,${color}66,${color});box-shadow:0 0 10px ${color}88"></div>
              </div>
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "View Full Report →",
        confirmButtonColor: color,
        showCancelButton: true,
        cancelButtonText: "Close",
        cancelButtonColor: "transparent",
        customClass: { popup: "swal-custom-popup", confirmButton: "swal-confirm-btn", cancelButton: "swal-cancel-btn" },
        backdrop: "rgba(0,0,0,0.85)",
      });
    } catch {
      clearInterval(stepInterval);
      setLoading(false);
      Swal.fire({
        background: "rgba(10,10,20,0.97)",
        color: "#fff",
        icon: "error",
        title: "Connection Failed",
        text: "Could not reach the prediction API. Make sure Flask is running on port 5000.",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
  };

  const handleDownload = () => {
    if (!result) return;
    const { insights, recommendations } = generateInsights(form, result.marks);
    const content = `
AI MARKS PREDICTOR — ACADEMIC REPORT
═══════════════════════════════════════════
Generated: ${new Date().toLocaleString()}

PREDICTION RESULT
─────────────────
Predicted Marks  : ${result.marks} / 100
Grade            : ${result.grade}
Performance      : ${result.label}
Confidence       : ${result.confidence}%

STUDENT INPUTS
─────────────────
Study Hours      : ${form.study_hours} hrs/day
Attendance       : ${form.attendance}%
Previous Marks   : ${form.previous_marks}%
Assignments      : ${form.assignments}%
Sleep Hours      : ${form.sleep_hours} hrs/day
Mock Test Score  : ${form.mock_test}%

AI INSIGHTS
─────────────────
${insights.map((i) => `${i.icon} ${i.text}`).join("\n")}

RECOMMENDATIONS
─────────────────
${recommendations.map((r) => `• ${r}`).join("\n")}

═══════════════════════════════════════════
Powered by AI Marks Predictor
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Marks_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("marks_history");
  };

  const chartData = result
    ? [
        { name: "Study Hrs", score: form.study_hours * 10 },
        { name: "Attendance", score: form.attendance },
        { name: "Prev Marks", score: form.previous_marks },
        { name: "Assignments", score: form.assignments },
        { name: "Mock Test", score: form.mock_test },
        { name: "Predicted", score: result.marks },
      ]
    : [];

  const radarData = result
    ? [
        { subject: "Study", A: form.study_hours * 10, fullMark: 100 },
        { subject: "Attend", A: form.attendance, fullMark: 100 },
        { subject: "Prev", A: form.previous_marks, fullMark: 100 },
        { subject: "Assign", A: form.assignments, fullMark: 100 },
        { subject: "Sleep", A: form.sleep_hours * 10, fullMark: 100 },
        { subject: "Mock", A: form.mock_test, fullMark: 100 },
      ]
    : [];

  const sliders = [
    { key: "study_hours", label: "Study Hours", icon: <RiBookOpenLine />, min: 0, max: 12, unit: "hrs/day", tip: `${form.study_hours} hrs` },
    { key: "attendance", label: "Attendance", icon: <RiUserHeartLine />, min: 0, max: 100, unit: "%", tip: `${form.attendance}%` },
    { key: "previous_marks", label: "Previous Marks", icon: <RiMedalLine />, min: 0, max: 100, unit: "%", tip: `${form.previous_marks}%` },
    { key: "assignments", label: "Assignment Completion", icon: <RiFileTextLine />, min: 0, max: 100, unit: "%", tip: `${form.assignments}%` },
    { key: "sleep_hours", label: "Sleep Hours", icon: <RiMoonLine />, min: 3, max: 12, unit: "hrs/day", tip: `${form.sleep_hours} hrs` },
    { key: "mock_test", label: "Mock Test Score", icon: <RiBarChartBoxLine />, min: 0, max: 100, unit: "%", tip: `${form.mock_test}%` },
  ];

  return (
    <div className="app">
      {/* Background Orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />
      <div className="grid-overlay" />

      {/* Hero */}
      <header className="hero">
        {/* Sparkle particles */}
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} className={`particle p${(i % 6) + 1}`} style={{
              left: `${(i * 37 + 5) % 95}%`,
              top: `${(i * 53 + 8) % 90}%`,
              animationDelay: `${(i * 0.37).toFixed(2)}s`,
              animationDuration: `${2.5 + (i % 5) * 0.6}s`,
            }} />
          ))}
        </div>
        {/* Shooting stars */}
        <div className="hero-stars" aria-hidden="true">
          {[0,1,2,3].map(i => (
            <span key={i} className="shooting-star" style={{ animationDelay: `${i * 2.2}s`, top: `${10 + i * 20}%` }} />
          ))}
        </div>

        <div className="hero-badge"><RiSparklingLine /> AI-Powered Prediction Engine</div>
        <div className="hero-icon-wrap">
          <div className="hero-icon-ring" />
          <RiRobot2Line className="hero-icon" />
        </div>
        <h1 className="hero-title">Marks<br /><span className="hero-gradient">Predictor</span></h1>
        <p className="hero-subtitle">Predict Your Academic Performance</p>
        <div className="hero-tags">
          <span className="tag">Machine Learning</span>
          <span className="tag">Real-time Analysis</span>
          <span className="tag">AI Insights</span>
        </div>
      </header>

      <main className="main">
        {/* Input Section */}
        <section className="section glass-card">
          <div className="section-header">
            <h2 className="section-title"><RiSparklingLine className="section-icon" /> Student Parameters</h2>
            <p className="section-sub">Adjust your academic metrics to generate a prediction</p>
          </div>

          <div className="sliders-grid">
            {sliders.map(({ key, label, icon, min, max, tip }) => {
              const pct = ((form[key] - min) / (max - min)) * 100;
              return (
                <div className="slider-card" key={key}>
                  <div className="slider-top">
                    <div className="slider-label-wrap">
                      <span className="slider-icon">{icon}</span>
                      <span className="slider-label">{label}</span>
                    </div>
                    <span className="slider-val">{tip}</span>
                  </div>
                  <div className="slider-track-wrap">
                    <input
                      type="range" min={min} max={max}
                      value={form[key]}
                      onChange={(e) => handleSlider(key, e.target.value)}
                      className="slider"
                      style={{ "--pct": `${pct}%` }}
                    />
                  </div>
                  <div className="slider-minmax">
                    <span>{min}</span><span>{max}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predict Button */}
          <div className="predict-wrap">
            <button
              className={`predict-btn ${loading ? "loading" : ""}`}
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span className="loading-text">{LOADING_STEPS[loadingStep]}</span>
                </>
              ) : (
                <>
                  <RiRobot2Line className="btn-icon" />
                  Generate Prediction
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="results-zone">
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Predicted Marks</div>
                <div className="stat-value" style={{ color: result.color }}>{result.marks}</div>
                <div className="stat-sub">out of 100</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Grade</div>
                <div className="stat-value grade-badge" style={{ color: result.color, borderColor: result.color, boxShadow: `0 0 20px ${result.color}44` }}>{result.grade}</div>
                <div className="stat-sub">{result.label}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Confidence</div>
                <div className="stat-value" style={{ color: result.color }}>{result.confidence}%</div>
                <div className="stat-sub">AI Accuracy</div>
              </div>
              <div className="stat-card meter-card">
                <div className="stat-label">Performance</div>
                <CircularMeter value={Math.round(result.marks)} />
              </div>
            </div>

            {/* Insights */}
            <section className="section glass-card insights-section">
              <div className="section-header">
                <h2 className="section-title"><RiLightbulbLine className="section-icon" /> AI Insights Report</h2>
                <p className="section-sub">Intelligent analysis of your academic metrics</p>
              </div>
              <div className="insights-grid">
                <div className="insights-col">
                  <h3 className="insights-col-title">Analysis</h3>
                  {result.insights.map((ins, i) => (
                    <div className={`insight-item ${ins.type}`} key={i}>
                      <span className="insight-icon">
                        {ins.type === "good" ? <RiCheckboxCircleLine /> : ins.type === "warn" ? <RiAlertLine /> : <RiCheckboxCircleLine />}
                      </span>
                      <span className="insight-text">{ins.text}</span>
                    </div>
                  ))}
                </div>
                <div className="insights-col">
                  <h3 className="insights-col-title">Recommendations</h3>
                  {result.recommendations.map((rec, i) => (
                    <div className="rec-item" key={i}>
                      <span className="rec-bullet">→</span>
                      <span className="rec-text">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Charts */}
            <section className="section glass-card charts-section">
              <div className="section-header">
                <h2 className="section-title"><RiBarChartBoxLine className="section-icon" /> Analytics Dashboard</h2>
                <p className="section-sub">Visual breakdown of your academic performance</p>
              </div>
              <div className="charts-grid">
                <div className="chart-wrap">
                  <h3 className="chart-title">Score Overview</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-wrap">
                  <h3 className="chart-title">Skill Radar</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart outerRadius={85} data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Student" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-wrap chart-wrap-full">
                  <h3 className="chart-title">Performance Trend</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} fill="url(#areaGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="actions-row">
              <button className="action-btn download-btn" onClick={handleDownload}>
                <RiDownload2Line /> Download Report
              </button>
              <button className="action-btn reset-btn" onClick={handleReset}>
                <RiRefreshLine /> Reset Form
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="section glass-card history-section">
            <div className="section-header">
              <h2 className="section-title"><RiHistoryLine className="section-icon" /> Prediction History</h2>
              <button className="clear-btn" onClick={clearHistory}><RiDeleteBin6Line /> Clear</button>
            </div>
            <div className="history-list">
              {history.map((h, i) => {
                const { color } = getGrade(h.marks);
                return (
                  <div className="history-item" key={i}>
                    <div className="history-date">{h.date}</div>
                    <div className="history-marks" style={{ color }}>{h.marks}</div>
                    <div className="history-grade-badge" style={{ borderColor: color, color }}>{h.grade}</div>
                    <div className="history-label">{h.label}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Built with <span className="footer-accent">Machine Learning</span> · AI Marks Predictor</p>
      </footer>

      {showScrollTop && (
        <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <RiArrowUpLine />
        </button>
      )}
    </div>
  );
}

