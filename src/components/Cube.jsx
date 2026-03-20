import { useEffect, useRef } from "react";
import * as THREE from "three";

function Cube() {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;

    // setup scene camera renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // load background image
    const loader = new THREE.TextureLoader();
    const bgTex = loader.load("/the-cube/B01.jpg");
    scene.background = bgTex;

    // i used the same texture for all 6 sides for now
    const faceTex = loader.load("/the-cube/F01.jpg");
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      side: THREE.DoubleSide,
    });

    const faceSize = 1.3;
    const half = faceSize / 2;

    // make each face as a plane and position it
    // front face
    const boxFront = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxFront.position.z = half;

    // back face
    const boxBack = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxBack.position.z = -half;

    // left face - rotate 90 deg so it faces the side
    const boxLeft = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxLeft.position.x = -half;
    boxLeft.rotation.y = Math.PI / 2;

    // right face
    const boxRight = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxRight.position.x = half;
    boxRight.rotation.y = Math.PI / 2;

    // top face
    const boxTop = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxTop.position.y = half;
    boxTop.rotation.x = Math.PI / 2;

    // bottom face
    const boxBottom = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), faceMat);
    boxBottom.position.y = -half;
    boxBottom.rotation.x = Math.PI / 2;

    // group all faces so i can rotate the whole cube together
    const cubeGroup = new THREE.Group();
    cubeGroup.add(boxFront, boxBack, boxLeft, boxRight, boxTop, boxBottom);
    scene.add(cubeGroup);

    // targets for lerp - where each face should move when cube opens/closes
    // when closed all targets are just the starting positions
    const targets = {
      front:  { z: half },
      back:   { z: -half },
      left:   { x: -half },
      right:  { x: half },
      top:    { y: half },
      bottom: { y: -half },
      opacity: 0,
    };

    // eid text using canvas
    // drew arabic text on a canvas then used it as a texture
    const msgCanvas = document.createElement("canvas");
    msgCanvas.width = 1024;
    msgCanvas.height = 1024;
    const ctx = msgCanvas.getContext("2d");

    // first line - eid mubarak in arabic
    ctx.fillStyle = "#ffaa00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#cc3300";
    ctx.shadowBlur = 25;
    ctx.font = "bold italic 280px Scheherazade New";
    ctx.fillText("عِيدٌ مُبَارَكٌ", 512, 350);

    // second line - kull aam wa antum bikhair
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold italic 160px Scheherazade New";
    ctx.fillText("كُلُّ عَامٍ وَأَنْتُمْ بِخَيْرٍ", 512, 650);

    const msgTex = new THREE.CanvasTexture(msgCanvas);
    const msgMat = new THREE.MeshBasicMaterial({
      map: msgTex,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(faceSize, faceSize), msgMat);
    textPlane.material.opacity = 0;
    scene.add(textPlane);

    console.log("scene ready");

    // click to open/close the cube
    let isOpen = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      // convert mouse position to normalized device coords
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([boxFront, boxBack, boxLeft, boxRight, boxTop, boxBottom]);

      console.log("clicked, hits:", hits.length);

      if (hits.length > 0) {
        isOpen = !isOpen;

        if (isOpen) {
          // set targets to open positions
          targets.front.z  =  2.5;
          targets.back.z   = -2.5;
          targets.left.x   = -2.5;
          targets.right.x  =  2.5;
          targets.top.y    =  2.5;
          targets.bottom.y = -2.5;
          targets.opacity  =  1;
        } else {
          // reset targets back to original closed positions
          targets.front.z  =  half;
          targets.back.z   = -half;
          targets.left.x   = -half;
          targets.right.x  =  half;
          targets.top.y    =  half;
          targets.bottom.y = -half;
          targets.opacity  =  0;
        }
      }
    };

    window.addEventListener("click", onClick);

    // animate loop - lerp each face toward its target
    // teacher showed us lerp in class, it smoothly moves between two values
    const animate = () => {
      requestAnimationFrame(animate);

      // rotate the whole cube slowly
      cubeGroup.rotation.x += 0.01;
      cubeGroup.rotation.y += 0.01;
      cubeGroup.rotation.z += 0.01;

      // lerp faces toward targets
      // 0.07 is the speed - higher = faster
      boxFront.position.z  = THREE.MathUtils.lerp(boxFront.position.z,  targets.front.z,  0.07);
      boxBack.position.z   = THREE.MathUtils.lerp(boxBack.position.z,   targets.back.z,   0.07);
      boxLeft.position.x   = THREE.MathUtils.lerp(boxLeft.position.x,   targets.left.x,   0.07);
      boxRight.position.x  = THREE.MathUtils.lerp(boxRight.position.x,  targets.right.x,  0.07);
      boxTop.position.y    = THREE.MathUtils.lerp(boxTop.position.y,    targets.top.y,    0.07);
      boxBottom.position.y = THREE.MathUtils.lerp(boxBottom.position.y, targets.bottom.y, 0.07);

      // fade the text in/out with lerp too
      textPlane.material.opacity = THREE.MathUtils.lerp(textPlane.material.opacity, targets.opacity, 0.07);

      renderer.render(scene, camera);
    };

    animate();

    // resize handler so it doesnt look stretched
    const handleResize = () => {
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
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
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default Cube;