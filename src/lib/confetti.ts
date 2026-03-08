export async function fireProfitConfetti() {
  const { default: confetti } = await import("canvas-confetti");
  
  const colors = ["#22c55e", "#4ade80", "#86efac", "#fbbf24", "#34d399"];

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    ticks: 120,
    gravity: 1.2,
    scalar: 0.9,
    shapes: ["circle", "square"],
  });

  // Second burst slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.5, x: 0.6 },
      colors,
      ticks: 100,
      gravity: 1.4,
      scalar: 0.7,
    });
  }, 150);
}