import styled from "styled-components";
import Loader from "./Loader";

const FullScreenLoader = () => (
  <Overlay>
    <Loader />
  </Overlay>
);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff; /* cambia según el fondo de tu sitio */
  z-index: 9999;
`;

export default FullScreenLoader;