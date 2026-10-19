"use client";
import { useEffect, useRef, useState, useId } from "react";
import { RotateCcw } from "lucide-react";
import { CAREERS } from "@/lib/providers/careers";
import type * as Three from "three";
export function Constellation({
  onSelect,
  interactive = false,
  motion = true,
}: {
  onSelect?: (id: string) => void;
  interactive?: boolean;
  motion?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const glowId = useId();
  const [failed, setFailed] = useState(false);
  const [reset, setReset] = useState(0);
  const callback = useRef(onSelect);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    let disposed = false;
    let clean = () => {};
    const container = host.current;
    if (!container) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const low = window.innerWidth < 640 || navigator.hardwareConcurrency < 4;
    if (low) {
      queueMicrotask(() => {
        if (!disposed) setFailed(true);
      });
      return;
    }
    import("three")
      .then((T) => {
        if (disposed) return;
        let renderer: Three.WebGLRenderer;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          setFailed(true);
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        container.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0.2, 9);
        const group = new T.Group();
        scene.add(group);
        scene.add(new T.AmbientLight(0x9fded4, 2.3));
        const key = new T.PointLight(0xd6fff0, 35);
        key.position.set(-3, 4, 4);
        scene.add(key);
        const blue = new T.PointLight(0x469bc0, 20);
        blue.position.set(4, -2, 1);
        scene.add(blue);
        const center = new T.Mesh(
          new T.IcosahedronGeometry(0.68, 2),
          new T.MeshPhysicalMaterial({
            color: 0x83d1b6,
            metalness: 0.4,
            roughness: 0.17,
            transparent: true,
            opacity: 0.88,
            clearcoat: 1,
          }),
        );
        group.add(center);
        const wire = new T.LineSegments(
          new T.EdgesGeometry(center.geometry),
          new T.LineBasicMaterial({
            color: 0xc1ffdb,
            transparent: true,
            opacity: 0.16,
          }),
        );
        center.add(wire);
        const coords = [
          [-2.2, 0.8, 0.3],
          [0.2, 1.65, -0.7],
          [2.15, 0.75, 0.4],
          [1.7, -1.15, -0.3],
          [-0.5, -1.6, 0.65],
          [-2, -0.95, -0.8],
        ];
        const nodes: Three.Mesh[] = [];
        coords.forEach((c, i) => {
          const node = new T.Mesh(
            new T.SphereGeometry(i === 0 ? 0.16 : 0.115, 20, 16),
            new T.MeshStandardMaterial({
              color: CAREERS[i].color,
              emissive: CAREERS[i].color,
              emissiveIntensity: 0.3,
              metalness: 0.35,
              roughness: 0.22,
            }),
          );
          node.position.set(...(c as [number, number, number]));
          node.userData.id = CAREERS[i].id;
          nodes.push(node);
          group.add(node);
          const line = new T.Line(
            new T.BufferGeometry().setFromPoints([
              new T.Vector3(0, 0, 0),
              node.position,
            ]),
            new T.LineBasicMaterial({
              color: 0x75afaa,
              transparent: true,
              opacity: 0.3,
            }),
          );
          group.add(line);
        });
        for (let r = 0; r < 3; r++) {
          const pts: Array<Three.Vector3> = [];
          for (let i = 0; i <= 100; i++) {
            const a = (i / 100) * Math.PI * 2;
            pts.push(
              new T.Vector3(
                Math.cos(a) * (2.45 + r * 0.08),
                Math.sin(a) * (2.45 + r * 0.08),
                0,
              ),
            );
          }
          const ring = new T.Line(
            new T.BufferGeometry().setFromPoints(pts),
            new T.LineBasicMaterial({
              color: 0x669c95,
              transparent: true,
              opacity: 0.16,
            }),
          );
          ring.rotation.set(0.55 + r * 0.65, 0.5 + r * 0.55, 0.4);
          group.add(ring);
        }
        const particles = new Float32Array(100 * 3);
        for (let i = 0; i < 100; i++) {
          particles[i * 3] = Math.sin(i * 127.1) * 5;
          particles[i * 3 + 1] = Math.cos(i * 311.7) * 3;
          particles[i * 3 + 2] = Math.sin(i * 97.3) * 3 - 2;
        }
        const geo = new T.BufferGeometry();
        geo.setAttribute("position", new T.BufferAttribute(particles, 3));
        scene.add(
          new T.Points(
            geo,
            new T.PointsMaterial({
              color: 0xa8d8cf,
              size: 0.022,
              transparent: true,
              opacity: 0.45,
            }),
          ),
        );
        let frame = 0,
          last = 0,
          targetX = 0,
          targetY = 0,
          drag = false,
          start = 0,
          moved = false,
          visible = true;
        const raycaster = new T.Raycaster();
        const pointer = new T.Vector2();
        const resize = () => {
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        resize();
        const enter = (e: PointerEvent) => {
          if (!interactive || e.button !== 0) return;
          drag = true;
          start = e.clientX;
          moved = false;
          container.setPointerCapture(e.pointerId);
        };
        const move = (e: PointerEvent) => {
          const rect = container.getBoundingClientRect();
          if (drag && interactive) {
            if (moved || Math.abs(e.clientX - start) > 4) {
              targetY += (e.clientX - start) * 0.008;
              start = e.clientX;
              moved = true;
            }
          } else if (motion && !reduce) {
            targetY =
              ((e.clientX - rect.left - rect.width / 2) / rect.width) * 0.25;
            targetX =
              ((e.clientY - rect.top - rect.height / 2) / rect.height) * 0.1;
          }
        };
        const up = (e: PointerEvent) => {
          const wasDragging = drag;
          const wasMoved = moved;
          drag = false;
          if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
          if (!interactive || !wasDragging || wasMoved) return;
          const rect = container.getBoundingClientRect();
          pointer.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            (-(e.clientY - rect.top) / rect.height) * 2 + 1,
          );
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(nodes)[0];
          if (hit) callback.current?.(hit.object.userData.id as string);
        };
        const draw = (t: number) => {
          if (disposed) return;
          frame = requestAnimationFrame(draw);
          if (!visible || document.hidden || t - last < 35) return;
          last = t;
          group.rotation.y += (targetY - group.rotation.y) * 0.06;
          group.rotation.x += (targetX - group.rotation.x) * 0.06;
          if (motion && !reduce) center.rotation.y += 0.004;
          renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(draw);
        const io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
        });
        io.observe(container);
        container.addEventListener("pointerdown", enter);
        container.addEventListener("pointermove", move);
        container.addEventListener("pointerup", up);
        const cancel = () => { drag = false; moved = false; };
        container.addEventListener("pointercancel", cancel);
        container.addEventListener("lostpointercapture", cancel);
        const lost = (e: Event) => {
          e.preventDefault();
          setFailed(true);
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        clean = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          io.disconnect();
          container.removeEventListener("pointerdown", enter);
          container.removeEventListener("pointermove", move);
          container.removeEventListener("pointerup", up);
          container.removeEventListener("pointercancel", cancel);
          container.removeEventListener("lostpointercapture", cancel);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          scene.traverse((obj) => {
            const m = obj as Three.Mesh;
            if (m.geometry) m.geometry.dispose();
            if (m.material) {
              const materials = Array.isArray(m.material)
                ? m.material
                : [m.material];
              materials.forEach((m) => m.dispose());
            }
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => { if (!disposed) setFailed(true); });
    return () => {
      disposed = true;
      clean();
    };
  }, [interactive, motion, reset]);
  return (
    <div className={`constellation ${failed ? "graph-fallback" : ""}`}>
      <div ref={host} className="graph-canvas" />
      <div className="graph-mobile">
        <svg
          className="static-constellation"
          viewBox="0 0 400 340"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={glowId}>
              <stop stopColor="#a8edc8" stopOpacity=".18" />
              <stop offset="1" stopColor="#a8edc8" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="170" r="155" fill={`url(#${glowId})`} />
          <g stroke="#80bfa9" fill="none" strokeWidth=".8">
            <ellipse
              cx="200"
              cy="170"
              rx="137"
              ry="65"
              transform="rotate(-28 200 170)"
              opacity=".5"
            />
            <ellipse
              cx="200"
              cy="170"
              rx="68"
              ry="137"
              transform="rotate(-35 200 170)"
              opacity=".3"
            />
            <path
              d="M95 110 200 170 225 56 M331 129 200 170 310 270 M153 280 200 170 75 218"
              opacity=".5"
            />
          </g>
          <g fill="#afe6c5">
            {[
              [95, 110],
              [225, 56],
              [331, 129],
              [310, 270],
              [153, 280],
              [75, 218],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="4" />
            ))}
          </g>
          <path
            d="m200 123 40 23v48l-40 23-40-23v-48z"
            fill="#80cbae"
            fillOpacity=".16"
            stroke="#b4eacb"
            strokeWidth="1.2"
          />
          <path
            d="m160 146 40 23 40-23m-40 23v48m0-94v46"
            stroke="#b4eacb"
            opacity=".55"
            fill="none"
          />
        </svg>
      </div>
      <div className="graph-labels">
        {CAREERS.slice(0, 6).map((c, i) => (
          <button
            key={c.id}
            className={`graph-label node-${i}`}
            onClick={() => onSelect?.(c.id)}
            style={{ "--node-color": c.color } as React.CSSProperties}
          >
            <span />
            {
              [
                "Software",
                "Data science",
                "Security",
                "Cloud",
                "Data pipelines",
                "Hardware",
              ][i]
            }
          </button>
        ))}
      </div>
      <div className="graph-center-label">YOUR POTENTIAL</div>
      {interactive && (
        <button
          className="graph-reset"
          onClick={() => setReset((x) => x + 1)}
          aria-label="Reset graph rotation"
          disabled={failed}
          title={failed ? "Rotation is unavailable in the static graph. Career labels still work." : "Reset graph rotation"}
        >
          <RotateCcw size={15} />
        </button>
      )}
    </div>
  );
}
