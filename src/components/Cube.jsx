import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();

    // -------- BACKGROUND --------
    const bgTexture = new THREE.TextureLoader().load("/the-cube/B01.jpg");
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    camera.position.z = 5;

    const loader = new THREE.TextureLoader();
    const createFace = (img) => {
      const geo = new THREE.PlaneGeometry(1.5, 1.5);
      const texture = loader.load(img);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geo, mat);
    };

  const createMessageMesh = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.clearRect(0, 0, 1024, 1024);

  // Line 1 — Teal with teal glow
  ctx.shadowColor = "#cc3300";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#ffaa00";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold italic 280px Scheherazade New";
  ctx.fillText("عِيدٌ مُبَارَكٌ", 512, 350);

  // Line 2 — Gold with gold glow
  ctx.shadowColor = "#cc3300";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "#FFffff";
  ctx.font = "bold italic 160px Scheherazade New";
  ctx.fillText("كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", 512, 650);

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(1.5, 1.5);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geo, mat);
};
    

    const faces = [];
    const faceSize = 1.5;
    const half = faceSize / 2;

    const face1 = createFace("/the-cube/F01.jpg");
    face1.position.z = half;

    const face2 = createFace("/the-cube/F01.jpg");
    face2.position.z = -half;

    const face3 = createFace("/the-cube/F01.jpg");
    face3.position.x = -half;
    face3.rotation.y = Math.PI / 2;

    const face4 = createFace("/the-cube/F01.jpg");
    face4.position.x = half;
    face4.rotation.y = Math.PI / 2;

    const face5 = createFace("/the-cube/F01.jpg");
    face5.position.y = half;
    face5.rotation.x = Math.PI / 2;

    const face6 = createFace("/the-cube/F01.jpg");
    face6.position.y = -half;
    face6.rotation.x = Math.PI / 2;

    faces.push(face1, face2, face3, face4, face5, face6);

    const msgMesh = createMessageMesh();
    msgMesh.material.opacity = 0;
    scene.add(msgMesh);

    const cubeGroup = new THREE.Group();
    faces.forEach((f) => cubeGroup.add(f));
    scene.add(cubeGroup);

    let isOpen = false;

    function openCube() {
      gsap.to(face1.position, { z: 2.5, duration: 0.6 });
      gsap.to(face2.position, { z: -2.5, duration: 0.6 });
      gsap.to(face3.position, { x: -2.5, duration: 0.6 });
      gsap.to(face4.position, { x: 2.5, duration: 0.6 });
      gsap.to(face5.position, { y: 2.5, duration: 0.6 });
      gsap.to(face6.position, { y: -2.5, duration: 0.6 });
      gsap.to(msgMesh.material, { opacity: 1, duration: 0.6 });
    }

    function closeCube() {
      gsap.to(face1.position, { z: half, duration: 0.6 });
      gsap.to(face2.position, { z: -half, duration: 0.6 });
      gsap.to(face3.position, { x: -half, duration: 0.6 });
      gsap.to(face4.position, { x: half, duration: 0.6 });
      gsap.to(face5.position, { y: half, duration: 0.6 });
      gsap.to(face6.position, { y: -half, duration: 0.6 });
      gsap.to(msgMesh.material, { opacity: 0, duration: 0.4 });
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(faces);

      if (intersects.length > 0) {
        if (!isOpen) {
          openCube();
        } else {
          closeCube();
        }
        isOpen = !isOpen;
      }
    };

    window.addEventListener("click", onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      cubeGroup.rotation.x += 0.01;
      cubeGroup.rotation.y += 0.01;
      cubeGroup.rotation.z += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onClick);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

   return (
  <div ref={mountRef} style={{ width: "100vw", height: "100vh", display: "block", margin: 0, padding: 0 }} />
);
}

export default Cube;