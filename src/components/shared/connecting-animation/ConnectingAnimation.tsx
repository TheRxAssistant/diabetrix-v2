// ConnectingAnimation.jsx
import { useState, useEffect } from "react";
import "./ConnectingAnimation.scss";

export default function ConnectingAnimation() {
  const [status, setStatus] = useState("Connecting to concierge");
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Handle the dots animation
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  // Handle the status messages and progress
  useEffect(() => {
    const statusSequence = [
      { message: "Connecting to concierge", duration: 500, progress: 30 },
      { message: "Almost there", duration: 500, progress: 70 },
      { message: "Connected", duration: 500, progress: 100 },
    ];

    let currentIndex = 0;

    const updateStatus = () => {
      if (currentIndex < statusSequence.length) {
        const current = statusSequence[currentIndex];
        setStatus(current.message);
        setProgress(current.progress);

        currentIndex++;

        if (currentIndex < statusSequence.length) {
          setTimeout(updateStatus, current.duration);
        } else {
          setTimeout(() => {
            setIsConnected(true);
          }, current.duration);
        }
      }
    };

    updateStatus();

    return () => {};
  }, []);

  return (
    <div className="connecting-container">
      {!isConnected ? (
        <div className="connecting-card">
          <div className="icon-container">
            <div className="icon-circle">
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="status-text">
            {status}
            <span className="dots-container">{dots}</span>
          </h2>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="connecting-card connected">
          <div className="icon-container">
            <div className="icon-circle success">
              <svg
                className="icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="status-text">Ready to chat!</h2>
        </div>
      )}
    </div>
  );
}
