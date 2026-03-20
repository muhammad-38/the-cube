import { useEffect, useRef } from "react";
import * as THREE from "three";

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();

    // setting up the background image
    // I tried color first but image looks better
    const bgTexture = new THREE.TextureLoader().load("/the-cube/B01.jpg");
    bgTexture.colorSpace = THREE.SRGBColorSpace; // without this the image was looking washed out
    scene.background = bgTexture;

    // camera setup - 75 is the field of view
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace; // fixes color issue
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // camera is 5 units away from the cube
    camera.position.z = 5;

    // function to create each face of the cube with a texture
    const loader = new THREE.TextureLoader();
    const createFace = (img) => {
      const geo = new THREE.PlaneGeometry(1.3, 1.3);
      const texture = loader.load(img);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide, // so both sides of face are visible
      });
      return new THREE.Mesh(geo, mat);
    };

    // creating the eid message using canvas
    // I learned that we can draw text on canvas and use it as texture
    const createMessageMesh = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");

      // clear canvas first
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.clearRect(0, 0, 1024, 1024);

      // first line - eid mubarak in arabic
      ctx.shadowColor = "#cc3300";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#ffaa00"; // orange gold color
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold italic 280px Scheherazade New"; // arabic font
      ctx.fillText("عِيدٌ مُبَارَكٌ", 512, 350);

      // second line - smaller text below
      ctx.shadowColor = "#cc3300";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#FFffff"; // white color
      ctx.font = "bold italic 160px Scheherazade New";
      ctx.fillText("كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", 512, 650);

      const texture = new THREE.CanvasTexture(canvas);
      const geo = new THREE.PlaneGeometry(1.3, 1.3);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geo, mat);
    };

    // making all 6 faces of the cube
    const faces = [];
    const faceSize = 1.3;
    const half = faceSize / 2; // half = 0.65

    // front face
    const face1 = createFace("/the-cube/F01.jpg");
    face1.position.z = half;

    // back face
    const face2 = createFace("/the-cube/F01.jpg");
    face2.position.z = -half;

    // left face - rotated 90 degrees on y axis
    const face3 = createFace("/the-cube/F01.jpg");
    face3.position.x = -half;
    face3.rotation.y = Math.PI / 2;

    // right face
    const face4 = createFace("/the-cube/F01.jpg");
    face4.position.x = half;
    face4.rotation.y = Math.PI / 2;

    // top face - rotated 90 degrees on x axis
    const face5 = createFace("/the-cube/F01.jpg");
    face5.position.y = half;
    face5.rotation.x = Math.PI / 2;

    // bottom face
    const face6 = createFace("/the-cube/F01.jpg");
    face6.position.y = -half;
    face6.rotation.x = Math.PI / 2;

    faces.push(face1, face2, face3, face4, face5, face6);

    // message mesh added to scene directly
    // so it doesnt rotate with the cube
    const msgMesh = createMessageMesh();
    msgMesh.material.opacity = 0; // hidden at start
    scene.add(msgMesh);

    // group all faces so they rotate together
    const cubeGroup = new THREE.Group();
    faces.forEach((f) => cubeGroup.add(f));
    scene.add(cubeGroup);

    // lerp = linear interpolation
    // it smoothly moves from one position to another
    // formula: start + (end - start) * t
    let isOpen = false;

    // where each face starts (closed position)
    const startPositions = [
      new THREE.Vector3(0, 0, half),
      new THREE.Vector3(0, 0, -half),
      new THREE.Vector3(-half, 0, 0),
      new THREE.Vector3(half, 0, 0),
      new THREE.Vector3(0, half, 0),
      new THREE.Vector3(0, -half, 0),
    ];

    // where each face goes when cube opens
    const endPositions = [
      new THREE.Vector3(0, 0, 2.5),
      new THREE.Vector3(0, 0, -2.5),
      new THREE.Vector3(-2.5, 0, 0),
      new THREE.Vector3(2.5, 0, 0),
      new THREE.Vector3(0, 2.5, 0),
      new THREE.Vector3(0, -2.5, 0),
    ];

    // click anywhere to open or close the cube
    const onClick = () => {
      isOpen = !isOpen;
    };

    window.addEventListener("click", onClick);

    // animation loop - runs every frame
    const animate = () => {
      requestAnimationFrame(animate);

      // rotate the cube on all 3 axes
      cubeGroup.rotation.x += 0.01;
      cubeGroup.rotation.y += 0.01;
      cubeGroup.rotation.z += 0.01;

      // lerp each face to its target position
      // 0.05 is the speed - lower = slower
      faces.forEach((face, i) => {
        const destination = isOpen ? endPositions[i] : startPositions[i];
        face.position.lerp(destination, 0.05);
      });

      // fade in or fade out the message using lerp
      const targetOpacity = isOpen ? 1 : 0;
      msgMesh.material.opacity = THREE.MathUtils.lerp(
        msgMesh.material.opacity,
        targetOpacity,
        0.05
      );

      renderer.render(scene, camera);
    };

    animate();

    // handle window resize
    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // cleanup when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onClick);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", display: "block", margin: 0, padding: 0 }}
    />
  );
}

export default Cube;