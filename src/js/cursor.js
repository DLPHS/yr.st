const cursor = document.getElementById('cursor');
const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);

if (!isMobile) {
  function setCursorSize() {
    const size = Math.max(123, Math.min(window.innerWidth, window.innerHeight) * 0.21);
    cursor.style.width = size + 'px';
    cursor.style.height = size + 'px';
  }

  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  setCursorSize();
  window.addEventListener('resize', setCursorSize);
}

let hue = 0;

function animate() {
  hue = (hue + 1) % 360;
  cursor.style.filter = 'sepia(1) saturate(20) hue-rotate(' + hue + 'deg) brightness(1.1)';
  requestAnimationFrame(animate);
}

animate();
