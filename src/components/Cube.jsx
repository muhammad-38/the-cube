import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Text } from "troika-three-text";

export default function ThreeScene() {
  const mountRef = useRef(null);
  const explodedRef = useRef(false);
  const cubeGroupRef = useRef(null);
  const facesRef = useRef([]);
  const textGroupRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // ===== Transparent canvas so background image shows through =====
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // ===== Lights =====
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // ===== Cube faces with images =====
    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;
    const faceSize = 2.2;
    const faces = [];
    facesRef.current = faces;

    // Replace with your own images for each cube face
    const faceImages = [
      "/F01.jpeg",
      "/F01.jpeg",
      "/F01.jpeg",
      "/F01.jpeg",
      "/F01.jpeg",
      "/F01.jpeg",
    ];

    const positions = [
      [0, 0, faceSize / 2],
      [0, 0, -faceSize / 2],
      [-faceSize / 2, 0, 0],
      [faceSize / 2, 0, 0],
      [0, faceSize / 2, 0],
      [0, -faceSize / 2, 0],
    ];
    const rotations = [
      [0, 0, 0],
      [0, Math.PI, 0],
      [0, -Math.PI / 2, 0],
      [0, Math.PI / 2, 0],
      [-Math.PI / 2, 0, 0],
      [Math.PI / 2, 0, 0],
    ];

    const loader = new THREE.TextureLoader();

    for (let i = 0; i < 6; i++) {
      const geom = new THREE.PlaneGeometry(faceSize, faceSize);
      const texture = loader.load(faceImages[i]);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(...positions[i]);
      mesh.rotation.set(...rotations[i]);

      const dir = mesh.position.clone().sub(new THREE.Vector3(0, 0, 0)).normalize();
      const explodeOffset = dir.clone().multiplyScalar(1.5);

      cubeGroup.add(mesh);
      faces.push({ mesh, originalPos: mesh.position.clone(), explodeOffset });
    }

    scene.add(cubeGroup);

    // ===== Arabic text =====
    const textGroup = new THREE.Group();
    textGroupRef.current = textGroup;

    const text1 = new Text();
    text1.text = "عِيدٌ مُبَارَكٌ";
    text1.fontSize = 0.4;
    text1.color = 0xFFFFE0;
    text1.anchorX = "center";
    text1.anchorY = "middle";
    text1.position.set(0, 0.2, 0);
    text1.sync();
    textGroup.add(text1);

    const text2 = new Text();
    text2.text = "تَقَبَّلَ اللهُ مِنَّا وَمِنكُمْ صَالِحَ الأَعْمَالِ";
    text2.fontSize = 0.17;
    text2.color = 0xFFD700;
    text2.anchorX = "center";
    text2.anchorY = "middle";
    text2.position.set(0, -0.2, 0);
    text2.sync();
    textGroup.add(text2);

    scene.add(textGroup);

    // ===== Raycaster for cube click =====
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(facesRef.current.map((f) => f.mesh));
      if (intersects.length > 0) {
        explodedRef.current = !explodedRef.current;

        facesRef.current.forEach((f) => {
          const target = explodedRef.current
            ? f.originalPos.clone().add(f.explodeOffset)
            : f.originalPos.clone();
          gsap.to(f.mesh.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: 1,
            ease: "power2.out",
          });
        });
      }
    };
    window.addEventListener("click", onClick);

    // ===== Animate cube =====
    let animationId;
    const rotate = () => {
      animationId = requestAnimationFrame(rotate);
      cubeGroup.rotation.x += 0.01;
      cubeGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    rotate();

    // ===== Resize handling =====
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // ===== Cleanup =====
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onClick);
      if (animationId) cancelAnimationFrame(animationId);
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // ===== Full-page background image via style =====
  return (
    <div
      ref={mountRef}
      className="w-full h-screen"
      style={{
        backgroundImage: "url('/B01.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}