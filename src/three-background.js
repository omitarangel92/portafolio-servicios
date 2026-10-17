import * as THREE from 'three';

// Fondo sutil de partículas que cambia de color según el tema (día / noche)
const PALETTE = { dark: { color: 0x9FC131, opacity: 0.5 }, light: { color: 0x005C53, opacity: 0.4 } };

export function initThreeBackground() {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const count = 600, pos = new Float32Array(count * 3);
    for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * 18;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const material = new THREE.PointsMaterial({ size: 0.03, transparent: true });
    const applyTheme = () => {
        const p = PALETTE[document.documentElement.dataset.theme] || PALETTE.dark;
        material.color.setHex(p.color);
        material.opacity = p.opacity;
    };
    applyTheme();
    window.addEventListener('themechange', applyTheme);

    const mesh = new THREE.Points(geo, material);
    scene.add(mesh);
    camera.position.z = 4;

    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
    });

    const clock = new THREE.Clock();
    (function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        mesh.rotation.y = t * 0.03 + mx * 0.3;
        mesh.rotation.x = t * 0.015 + my * 0.3;
        renderer.render(scene, camera);
    })();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}