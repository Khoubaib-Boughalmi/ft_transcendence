import { Text3D } from "@react-three/drei";

export const TextGeo = () => {
  return (
    <Text3D
      position={[5, 2, -7]}
      rotation={[0, -Math.PI / 8, 0]}
      curveSegments={32}
      bevelEnabled
      bevelSize={0.04}
      bevelThickness={0.1}
      height={0.5}
      lineHeight={0.5}
      letterSpacing={-0.06}
      size={1}
      font="/Inter_Bold.json"
    >
      {`3`}
      <meshNormalMaterial />
    </Text3D>
  );
};

export default TextGeo;
