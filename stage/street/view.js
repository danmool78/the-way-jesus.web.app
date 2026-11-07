/* 거리 무대 (잠언): 사람 눈높이의 실제 크기 세트를 화면 가득 그리는 쪽 — stage.js가 만들어 쓴다.
   지도 핀 위의 미니어처 대신 화면 가득 세트(stage/street.js)를 그리고, 카메라는 대본의 자리(cams)에 선다.
   대본: street(세트 이름), cams({ 이름: { pos, at, fov(가로 시야각) } }), cam(처음 자리). 동작 명령 ['@cam', 이름]으로 천천히 옮겨 간다
   stage.js가 넘기는 것: scene·sun·camera·renderer·wrap(무대 바탕), 미니어처의 바닥 그림자(ground·occluder), onLeave(거리 무대를 떠날 때 캔버스 크기를 다시 재게)
   돌려주는 것: on(지금 거리 무대인가), use(세트 이름 | null), sky(분위기), sunStep(dt), cam(cams, 이름, instant), cmd('저울:cheat'), frame(dt, time) */
import { THREE } from '../kit.js';
import { STREETS, SKIES, skyTexture } from '../street.js';

export function createStreet({ scene, sun, camera, renderer, wrap, ground, occluder, getCanvas, onLeave }) {
  let street = null, size = { w: 0, h: 0 };
  const STILL = new URLSearchParams(location.search).has('beat');
  const sunGoal = new THREE.Vector3(-2.2, 4, -1.6);
  const camGoal = { pos: new THREE.Vector3(0, 1, 8), at: new THREE.Vector3(), fov: 62 }, camNow = { pos: new THREE.Vector3(0, 1, 8), at: new THREE.Vector3(), fov: 62 };
  const SHADOW0 = { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 14 };
  function shadowBox(o, mapSize) {
    Object.assign(sun.shadow.camera, o); sun.shadow.camera.updateProjectionMatrix();
    if (sun.shadow.mapSize.x !== mapSize) { sun.shadow.mapSize.set(mapSize, mapSize); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  }
  function setStreet(name) {
    if ((street?.name || null) === (name || null)) return;
    street?.set.group.removeFromParent();
    street = null;
    ground.visible = occluder.visible = !name; // 세트에는 바닥이 있다
    size = { w: 0, h: 0 }; onLeave(); // 캔버스 크기를 다시 잰다
    if (!name) {
      scene.background = null; scene.fog = null;
      sun.position.set(-2.2, 4, -1.6); sunGoal.copy(sun.position); sun.shadow.bias = 0; sun.shadow.normalBias = 0;
      shadowBox(SHADOW0, 1024);
      camera.clearViewOffset(); camera.far = 50; camera.near = 0.1;
      return;
    }
    const set = STREETS[name]();
    scene.add(set.group);
    street = { name, set };
    scene.fog = new THREE.Fog('#c8d2d6', 45, 180); // 멀리 감람산이 아지랑이 속에
    camera.far = 400; camera.near = 0.15; // 미니어처 무대의 50으로는 멀리 성벽·산이 잘렸다. 멀리 그리는 만큼 near도 띄워 깊이 정밀도를 지킨다(먼 면이 깜박였다)
    // 그림자: 광장 전체(성문~집들)를 덮는 넓이. 넓은 만큼 그림자 지도도 크게
    shadowBox({ left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 140 }, 2048);
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  }
  function streetSky(name, instant) {
    const k = SKIES[name] || SKIES.day;
    scene.background = skyTexture(...k.sky);
    scene.fog.color.set(k.fog);
    sunGoal.set(...k.sun);
    if (instant) sun.position.copy(sunGoal);
  }
  function camTo(cams, name, instant) {
    const c = cams?.[name]; if (!c) return;
    camGoal.pos.set(...c.pos); camGoal.at.set(...c.at); camGoal.fov = c.fov || 62;
    if (instant) { camNow.pos.copy(camGoal.pos); camNow.at.copy(camGoal.at); camNow.fov = camGoal.fov; }
  }
  // 화면 가득 그리고, 장면 카드가 가리는 쪽을 비켜 세트의 가운데를 보이는 곳에 둔다:
  // 넓은 화면은 오른쪽 카드(min(460px, 42%)), 폰은 아래 카드 — 카메라 화면을 그만큼 넓게 잡고 보이는 부분만 그린다(setViewOffset)
  function streetView(dt, time) {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (w !== size.w || h !== size.h) {
      size = { w, h };
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // 화면 가득이라 무대 캔버스처럼 2~3배로 그리면 버겁다
      renderer.setSize(w, h, false);
      getCanvas().style.width = w + 'px'; getCanvas().style.height = h + 'px';
    }
    getCanvas().style.transform = 'none';
    getCanvas().style.opacity = window.stageHide ? 0 : 1;
    const k = 1 - Math.exp(-0.9 * dt);
    camNow.pos.lerp(camGoal.pos, k); camNow.at.lerp(camGoal.at, k); camNow.fov += (camGoal.fov - camNow.fov) * k;
    const desk = innerWidth > 900, cw = desk ? Math.min(460, w * 0.42) + 14 : 0, ch = desk ? 0 : h * 0.36;
    const FW = w + cw, FH = h + ch, aspect = FW / FH;
    // fov는 가로 시야각: 세로로 긴 폰에서도 광장 폭이 같게 보이도록 세로 시야각을 거기서 구한다
    const vf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camNow.fov / 2)) / aspect);
    camera.fov = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(vf), 28, 82);
    camera.aspect = aspect;
    camera.setViewOffset(FW, FH, cw, ch, w, h);
    // 숨 쉬듯 아주 조금 흔들리는 시선 — 멈춘 그림처럼 보이지 않게
    const sw = STILL ? 0 : 1; // 확인용 캡처(?beat=)는 흔들림 없이 — 프레임끼리 견주어 깜박이는 곳을 찾는다
    camera.position.set(camNow.pos.x + Math.sin(time * 0.11) * 0.08 * sw, camNow.pos.y + Math.sin(time * 0.17) * 0.02 * sw, camNow.pos.z);
    camera.lookAt(camNow.at);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    street.set.update?.(time, dt); // 세트 안에서 움직이는 것 (들판의 개미)
  }

  return {
    get on() { return !!street; },
    use: setStreet,
    sky: streetSky,
    sunStep: dt => sun.position.lerp(sunGoal, 1 - Math.exp(-1.2 * dt)),
    cam: camTo,
    cmd: (what, instant) => street?.set.cmd?.(what, instant),
    frame: streetView,
  };
}
