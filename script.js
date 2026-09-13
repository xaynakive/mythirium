const cube = document.getElementById('cube');
const overlay = document.getElementById('overlay');
const drawer = document.getElementById('drawer');
const dFace = document.getElementById('drawerFace');
const dModal = document.getElementById('drawerModal');

let isOpen = false;
let originRect = null; // Exact position of the clicked face

const TW = Math.min(420, window.innerWidth * 0.88);
const TH = Math.min(560, window.innerHeight * 0.8);
const TX = (window.innerWidth - TW) / 2;
const TY = (window.innerHeight - TH) / 2;

window.addEventListener('resize', () => {
  // Recalculate on resize/orientation change
  if (!isOpen) return;
});

const EASE = '0.35s cubic-bezier(0.23, 1, 0.32, 1)';

cube.addEventListener('mouseenter', () => {
  if (!isOpen) cube.classList.add('paused');
});

cube.addEventListener('mouseleave', () => {
  if (!isOpen) cube.classList.remove('paused');
});

function setDrawerStyle(x, y, width, height, radius, isExpanded) {
  Object.assign(drawer.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: radius,

    background: isExpanded
      ? 'rgba(168, 216, 240, 0.07)'
      : 'rgba(168, 216, 240, 0.04)',

    border: isExpanded
      ? '1px solid rgba(168, 216, 240, 0.2)'
      : '1px solid rgba(168, 216, 240, 0.13)',

    backdropFilter: isExpanded ? 'blur(30px)' : 'blur(12px)',

    boxShadow: isExpanded
      ? `
          0 0 0 1px rgba(168, 216, 240, 0.06),
          0 30px 80px rgba(0, 0, 0, 0.7),
          0 0 80px rgba(168, 216, 240, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `
      : `
          0 0 30px rgba(168, 216, 240, 0.06),
          inset 0 0 20px rgba(168, 216, 240, 0.02)
        `,
  });
}

function openDrawer(face) {
  if (isOpen) return;

  isOpen = true;

  // Pause the cube at its current position
  cube.classList.add('paused');

  setTimeout(() => {
    cube.classList.add('frozen');
  }, 50);

  // Save the exact position of the selected face
  originRect = face.getBoundingClientRect();
  const rect = originRect;

  // Retrieve content belonging to the selected face
  const faceSlot = face.querySelector('.face-slot');
  const modalSlot = face.querySelector('.modal-slot');
  const meta = face.querySelector('.modal-meta');
  const modalBody = document.getElementById('mBody');

  // Clone the visible face into the drawer
  dFace.innerHTML = '';
  dFace.appendChild(faceSlot.cloneNode(true));

  // Clone the hidden modal content into the drawer
  modalBody.innerHTML = '';
  modalBody.appendChild(modalSlot.cloneNode(true));
  modalBody.querySelector('.modal-slot').style.display = 'block';

  // Apply the face metadata
  document.getElementById('mTitle').textContent =
    meta.dataset.title || '';

  document.getElementById('mSub').textContent =
    meta.dataset.sub || '';

  document.getElementById('mIcon').textContent = '';

  // Reset the drawer views
  dFace.style.display = 'flex';
  dFace.style.opacity = '1';
  dFace.style.left = `${rect.left}px`;
  dFace.style.top = `${rect.top}px`;

  dModal.classList.remove('show');

  // Position the drawer directly over the selected cube face
  drawer.style.transition = 'none';
  drawer.style.display = 'flex';

  setDrawerStyle(
    rect.left,
    rect.top,
    rect.width,
    rect.height,
    '14px',
    false
  );

  // Dim the background
  overlay.classList.add('active');

  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  // Expand the selected face into the modal
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawer.style.transition = [
        `left ${EASE}`,
        `top ${EASE}`,
        `width ${EASE}`,
        `height ${EASE}`,
        `border-radius ${EASE}`,
        `background ${EASE}`,
        `box-shadow ${EASE}`,
      ].join(', ');

      setDrawerStyle(TX, TY, TW, TH, '26px', true);

      // Crossfade from the cube face to its modal content
      setTimeout(() => {
        dFace.style.opacity = '0';

        setTimeout(() => {
          dFace.style.display = 'none';
          dModal.classList.add('show');
        }, 80);
      }, 140);
    });
  });
}

function closeDrawer() {
  if (!isOpen) return;

  // Hide the modal content
  dModal.classList.remove('show');

  // Restore the selected face inside the drawer
  dFace.style.display = 'flex';
  dFace.style.opacity = '0';

  // Fade the background overlay
  overlay.classList.remove('visible');

  setTimeout(() => {
    dFace.style.left = `${originRect.left}px`;
    dFace.style.top = `${originRect.top}px`;
    dFace.style.transition = 'opacity 0.2s ease';
    dFace.style.opacity = '1';

    drawer.style.transition = [
      `left ${EASE}`,
      `top ${EASE}`,
      `width ${EASE}`,
      `height ${EASE}`,
      `border-radius ${EASE}`,
      `background ${EASE}`,
      `box-shadow ${EASE}`,
    ].join(', ');

    // Return the drawer to the exact position of the original face
    const rect = originRect;

    setDrawerStyle(
      rect.left,
      rect.top,
      rect.width,
      rect.height,
      '14px',
      false
    );

    // Hide the drawer and resume the cube after the animation
    setTimeout(() => {
      drawer.style.display = 'none';
      drawer.style.transition = 'none';

      overlay.classList.remove('active');
      cube.classList.remove('frozen');
      cube.classList.remove('paused');

      isOpen = false;
    }, 360);
  }, 50);
}

document.querySelectorAll('.face').forEach((face) => {
  face.addEventListener('mousemove', (event) => {
    const rect = face.getBoundingClientRect();

    const mouseX =
      ((event.clientX - rect.left) / rect.width) * 100;

    const mouseY =
      ((event.clientY - rect.top) / rect.height) * 100;

    face.style.setProperty('--mx', `${mouseX}%`);
    face.style.setProperty('--my', `${mouseY}%`);
  });
});
