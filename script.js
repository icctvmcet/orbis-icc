document.getElementById("year").textContent = new Date().getFullYear();

const orbitSequence = document.querySelector(".orbit-sequence");

if (orbitSequence) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const assembly = orbitSequence.querySelector(".orbit-vector-assembly");
  const outer = orbitSequence.querySelector(".orbit-part-outer");
  const middle = orbitSequence.querySelector(".orbit-part-middle");
  const inner = orbitSequence.querySelector(".orbit-part-inner");
  const center = orbitSequence.querySelector(".orbit-part-center");
  const planetOne = orbitSequence.querySelector(".orbit-planet-one");
  const planetTwo = orbitSequence.querySelector(".orbit-planet-two");
  const planetThree = orbitSequence.querySelector(".orbit-planet-three");
  const copy = orbitSequence.querySelector(".orbit-sequence-copy");
  const glow = orbitSequence.querySelector(".orbit-glow");
  let framePending = false;

  const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
  const range = (progress, start, end) => clamp((progress - start) / (end - start));
  const ease = (value) => 1 - Math.pow(1 - value, 3);

  const setPiece = (element, pieceProgress, fromX, fromY, fromRotation, fromScale = 0.72) => {
    const eased = ease(pieceProgress);
    const x = fromX * (1 - eased);
    const y = fromY * (1 - eased);
    const rotation = fromRotation * (1 - eased);
    const scale = fromScale + eased * (1 - fromScale);

    element.style.opacity = pieceProgress;
    element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
  };

  const renderOrbit = (progress) => {
    setPiece(outer, range(progress, 0.02, 0.55), 0, 560, 170);
    setPiece(middle, range(progress, 0.12, 0.61), 540, 120, 110);
    setPiece(inner, range(progress, 0.23, 0.66), -460, -360, -120);
    setPiece(center, range(progress, 0.08, 0.48), 0, -540, 0, 0.25);
    setPiece(planetOne, range(progress, 0.3, 0.62), -440, -310, -90, 0.12);
    setPiece(planetTwo, range(progress, 0.39, 0.7), 440, 350, 90, 0.12);
    setPiece(planetThree, range(progress, 0.47, 0.76), 430, -340, 120, 0.12);

    const spinProgress = ease(range(progress, 0.3, 0.82));
    assembly.style.transform = `rotate(${-250 * (1 - spinProgress)}deg)`;

    const finishProgress = ease(range(progress, 0.72, 0.94));
    assembly.style.opacity = 1;
    glow.style.opacity = 0.12 + finishProgress * 0.34;
    glow.style.transform = `scale(${0.72 + progress * 0.42})`;

    copy.style.opacity = 1;
    copy.style.transform = "none";
  };

  const updateFromScroll = () => {
    framePending = false;
    const viewportHeight = Math.max(1, window.innerHeight);
    const sectionTop = orbitSequence.getBoundingClientRect().top;

    // Wait until the section reaches halfway up the viewport before assembling.
    // Keep the same scroll distance so the later start does not rush the motion.
    // Recomputing from position makes every frame reversible, including jumps.
    const progress = clamp((viewportHeight * 0.5 - sectionTop) / (viewportHeight * 0.95));
    renderOrbit(reducedMotion.matches ? 1 : progress);
  };

  const queueScrollUpdate = () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateFromScroll);
  };

  window.addEventListener("scroll", queueScrollUpdate, { passive: true });
  window.addEventListener("resize", queueScrollUpdate);
  window.addEventListener("pageshow", queueScrollUpdate);
  window.addEventListener("load", queueScrollUpdate);
  reducedMotion.addEventListener("change", queueScrollUpdate);
  updateFromScroll();
}
