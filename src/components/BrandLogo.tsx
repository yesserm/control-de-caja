import Svg, { Path } from 'react-native-svg';

export function BrandLogo() {
  return <Svg width={52} height={52} viewBox="0 0 52 52" accessibilityLabel="Parada Caribe">
    <Path fill="#1E88E5" d="M26 3a23 23 0 1 0 0 46 23 23 0 0 0 0-46Z" />
    <Path fill="#fff" d="M14 28c5-9 10-11 15-6 3 3 6 3 10-1v6c-4 5-8 5-12 1-5-5-9-2-13 6v-6Z" />
    <Path fill="#fff" d="M18 17h16v4H18z" opacity={.9} />
  </Svg>;
}
