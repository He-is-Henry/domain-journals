import { useEffect, useState } from "react";
import axios from "../api/axios";
import { slug } from "../data/journals";
import ReviewActions from "./ReviewActions";
import journals from "../data/journals";
import "../styles/reviewManuscripts.css";

const STATUS_TABS = [
  { label: "Under Review", value: "under-review", color: "#FFA500" },
  { label: "Approved", value: "approved", color: "#4CAF50" },
  { label: "Paid", value: "paid", color: "#2196F3" },
  { label: "Rejected", value: "rejected", color: "#F44336" },
];

const ReviewManuscripts = () => {
  const [selectedValues, setSelectedValues] = useState({});
  const [manuscripts, setManuscripts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState("under-review");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchManuscripts = async () => {
    try {
      const { data } = await axios.get("/manuscript", {
        withCredentials: true,
      });
      const manuscriptsWithStatus = data.map((m) => ({
        ...m,
        status: m.status || "under-review",
      }));
      setManuscripts(manuscriptsWithStatus);

      manuscriptsWithStatus.forEach((m) => {
        setSelectedValues((prev) => ({
          ...prev,
          [m._id]: {
            ...prev[m._id],
            journal: m.journal,
            issue: m.issue,
          },
        }));
      });
    } catch (err) {
      setError("Failed to load manuscripts. Please try refreshing.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuscripts();
  }, []);

  useEffect(() => {
    const filtered = manuscripts.filter((m) => m.status === activeTab);
    setFiltered(filtered);
  }, [activeTab, manuscripts]);

  if (loading) return <p>Loading manuscripts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="review-container">
      <h2>Review Manuscripts</h2>

      <div className="review-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="review-tab"
            style={{
              backgroundColor: activeTab === tab.value ? tab.color : "#f0f0f0",
              color: activeTab === tab.value ? "white" : "#333",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No manuscripts in this category.</p>
      ) : (
        <ul className="review-list">
          {filtered.map((m) => (
            <li key={m._id} className="review-card">
              <h3>{m.title}</h3>
              <p>
                <strong>Author:</strong> {m.name}
              </p>

              {m.status === "paid" ? (
                <>
                  <label className="review-label">Journal</label>
                  <select
                    className="review-select"
                    value={selectedValues[m._id]?.journal || m.journal}
                    onChange={(e) =>
                      setSelectedValues((prev) => ({
                        ...prev,
                        [m._id]: {
                          ...prev[m._id],
                          journal: e.target.value,
                        },
                      }))
                    }
                  >
                    {journals.map((j) => (
                      <option key={slug(j)} value={slug(j)}>
                        {j}
                      </option>
                    ))}
                  </select>

                  <label className="review-label">Issue</label>
                  <select
                    className="review-select"
                    value={selectedValues[m._id]?.issue || m.issue}
                    onChange={(e) =>
                      setSelectedValues((prev) => ({
                        ...prev,
                        [m._id]: {
                          ...prev[m._id],
                          issue: Number(e.target.value),
                        },
                      }))
                    }
                  >
                    {Array.from({ length: m.issue }, (_, i) => m.issue - i).map(
                      (n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    )}
                  </select>
                </>
              ) : (
                <>
                  <p>
                    <strong>Journal:</strong> {m.journal}
                  </p>
                  <p>
                    <strong>Volume:</strong> {m.volume}
                  </p>
                  <p>
                    <strong>Issue:</strong> {m.issue}
                  </p>
                </>
              )}

              <p>
                <strong>Abstract:</strong> {m.abstract}
              </p>

              <div className="review-actions">
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    m.file
                  )}&embedded=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="review-action-btn">View</button>
                </a>
                <a
                  href={m.file}
                  download={
                    m.file.endsWith(".doc") ? undefined : "Manuscript.pdf"
                  }
                >
                  <button className="review-action-btn">Download</button>
                </a>

                <ReviewActions
                  id={m._id}
                  status={m.status || "under-review"}
                  onUpdate={fetchManuscripts}
                  issue={selectedValues[m._id]?.issue || m.issue}
                  journal={selectedValues[m._id]?.journal || m.journal}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewManuscripts;
