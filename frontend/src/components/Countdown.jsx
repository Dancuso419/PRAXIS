import { useState, useEffect } from 'react';

export default function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  function calcTimeLeft() {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="countdown">
      <span className="countdown-label">⏳ Time Remaining:</span>
      <span className="countdown-value">{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </div>
  );
}
