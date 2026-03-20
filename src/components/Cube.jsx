import { useEffect, useRef } from "react";
import * as THREE from "three";

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();

    // background
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

    // tried z=5 first but 4.8 looked a bit better
    camera.position.z = 4.8;

    const loader = new THREE.TextureLoader();

    const createFace = (img) => {
      const geo = new THREE.PlaneGeometry(1.3, 1.3);
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

      const texture = new THREE.CanvasTexture(canvas);
      const geo = new THREE.PlaneGeometry(1.3, 1.3);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // wait for font to load first then draw
      // was getting cut off on first load because font wasnt ready yet
      document.fonts.load('700 280px "Scheherazade New"').then(() => {
        ctx.clearRect(0, 0, 1024, 1024);

        // first line - eid mubarak
        ctx.fillStyle = "#ffaa00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#cc3300";
        ctx.shadowBlur = 25;
        ctx.font = "bold 280px Scheherazade New";
        ctx.fillText("عِيدٌ مُبَارَكٌ", 512, 350);

        // second line
        ctx.fillStyle = "#FFffff";
        ctx.font = "bold 160px Scheherazade New";
        ctx.fillText("كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", 512, 650);

        // tell three.js the texture changed so it updates
        texture.needsUpdate = true;
      });

      return mesh;
    };

    const faces = [];
    const faceSize = 1.3;
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

    console.log("cube loaded");

    let isOpen = false;

    // store target positions for lerp
    const targets = {
      face1: { z: half },
      face2: { z: -half },
      face3: { x: -half },
      face4: { x: half },
      face5: { y: half },
      face6: { y: -half },
      opacity: 0,
    };

    function openCube() {
      targets.face1.z = 2.5;
      targets.face2.z = -2.5;
      targets.face3.x = -2.5;
      targets.face4.x = 2.5;
      targets.face5.y = 2.5;
      targets.face6.y = -2.5;
      targets.opacity = 1;
    }

    function closeCube() {
      targets.face1.z = half;
      targets.face2.z = -half;
      targets.face3.x = -half;
      targets.face4.x = half;
      targets.face5.y = half;
      targets.face6.y = -half;
      targets.opacity = 0;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(faces);

      console.log("clicked");

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

    // animate - using lerp to smoothly move faces to their targets
    // lerp(current, target, speed) - teacher showed us this
    const animate = () => {
      requestAnimationFrame(animate);
      cubeGroup.rotation.x += 0.01;
      cubeGroup.rotation.y += 0.01;
      cubeGroup.rotation.z += 0.01;

      face1.position.z = THREE.MathUtils.lerp(face1.position.z, targets.face1.z, 0.07);
      face2.position.z = THREE.MathUtils.lerp(face2.position.z, targets.face2.z, 0.07);
      face3.position.x = THREE.MathUtils.lerp(face3.position.x, targets.face3.x, 0.07);
      face4.position.x = THREE.MathUtils.lerp(face4.position.x, targets.face4.x, 0.07);
      face5.position.y = THREE.MathUtils.lerp(face5.position.y, targets.face5.y, 0.07);
      face6.position.y = THREE.MathUtils.lerp(face6.position.y, targets.face6.y, 0.07);

      // fade text in and out
      msgMesh.material.opacity = THREE.MathUtils.lerp(msgMesh.material.opacity, targets.opacity, 0.07);

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