import { useState } from "react";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobText, setJobText] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setScore(null);

    try {
      let res;

      // 📄 PDF MODE
      if (resumeFile) {
        if (!jobText.trim()) {
          alert("Please enter a job description.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("resumeFile", resumeFile);
        formData.append("jobDescription", jobText);

        res = await fetch("http://localhost:5145/api/Match/upload", {
          method: "POST",
          body: formData,
        });
      }
      // ✍️ TEXT MODE
      else {
        if (!resumeText.trim() || !jobText.trim()) {
          alert("Please enter both resume text and job description.");
          setLoading(false);
          return;
        }

        res = await fetch("http://localhost:5145/api/Match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            jobDescription: jobText,
          }),
        });
      }

      if (!res.ok) {
        throw new Error("API request failed");
      }

      const data = await res.json();

      if (typeof data.matchPercentage === "number") {
        setScore(data.matchPercentage);
      } else {
        alert("No match score returned from server.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check backend & inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Resume Matcher 🤖</h1>

      {/* PDF UPLOAD */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setResumeFile(e.target.files[0])}
      />
      <p style={{ opacity: 0.7 }}>
        Upload a PDF resume (or paste resume text below)
      </p>

      {/* TEXT RESUME (DISABLED IF PDF IS UPLOADED) */}
      <textarea
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        disabled={resumeFile !== null}
      />

      {/* JOB DESCRIPTION */}
      <textarea
        placeholder="Paste the job description here..."
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
      />

      {/* ACTION BUTTON */}
      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Match"}
      </button>

      {/* RESULT */}
      {typeof score === "number" && (
        <div className="result">
          <h2>Match Score</h2>
          <div className="bar">
            <div
              className="fill"
              style={{ width: `${Math.min(score, 100)}%` }}
            ></div>
          </div>
          <p>{score.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
