import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { a } from "@react-spring/three";
import scene from "../assets/3d/racket.glb";
import { useBox } from "@react-three/cannon";

export function Racket(props) {
  const { nodes, materials } = useGLTF(scene);
  const [racketRef, api] = useBox(() => ({
    ...props,
    type: "Kinematic",
    args: [0.5, 0.5, 0.5],
    // onCollide: (e) => {
    //   console.log("collided", e);
    // },
  }));
  const started = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 3 - 1.5;
      const yRotation = -(0.5 - e.clientX / window.innerWidth) * 0.8;
      const zRotation = (0.5 - e.clientX / window.innerWidth) * 0.5;
      api.position.set(
        x,
        racketRef.current.position.y,
        racketRef.current.position.z
      );
      api.rotation.set(racketRef.current.rotation.x, yRotation, zRotation);
    };

    // const handleMouseDown = () => {
    //   api.position.set(
    //     racketRef.current.position.x,
    //     racketRef.current.position.y + 0.05,
    //     racketRef.current.position.z - 0.1
    //   );
    // };

    // const handleMouseUp = () => {
    //   api.position.set(
    //     racketRef.current.position.x,
    //     racketRef.current.position.y - 0.05,
    //     racketRef.current.position.z + 0.1
    //   );
    // };

    if (props.isplayer && !started.current) {
      started.current = true;
      window.addEventListener("mousemove", handleMouseMove);
      // window.addEventListener("mousedown", handleMouseDown);
      // window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // window.removeEventListener("mousedown", handleMouseDown);
      // window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [props.isplayer, api]);

  return (
    <a.group name="racket" ref={racketRef} {...props}>
      <mesh
        geometry={nodes.SM_PingPongPaddle_M_PingPongPaddle_0.geometry}
        material={materials.M_PingPongPaddle}
      />
    </a.group>
  );
}

export default Racket;
