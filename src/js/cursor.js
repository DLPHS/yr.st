const cursor = document.getElementById('cursor');
let hue = 0;

document.addEventListener('mousemove', function(e) {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

function animate() {
  hue = (hue + 1) % 360;
  // sepia turns white to yellow, saturate boosts it, then hue-rotate shifts the color
  cursor.style.filter = 'sepia(1) saturate(5) hue-rotate(' + hue + 'deg)';
  requestAnimationFrame(animate);
}

animate();
