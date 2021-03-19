import { FC, MutableRefObject } from 'react';
import styled from 'styled-components/macro';

interface DockItem {
  name: string;
  path: string;
}
const items: DockItem[] = [
  {
    name: 'Finder',
    path: './finder.png',
  },
  {
    name: 'Terminal',
    path: './terminal.png',
  },
];

const Dock: FC<{
  isTerminalMinimized: boolean;
  minimizedTerminalRef: MutableRefObject<any>;
  setIsTerminalMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  isTerminalMinimized,
  minimizedTerminalRef,
  setIsTerminalMinimized,
}) => {
  return (
    <Wrapper>
      <IconsContainer>
        {items.map((item: DockItem) => {
          const { name, path } = item;
          return (
            <Button key={name} active>
              <img src={path} alt={name} />
            </Button>
          );
        })}
      </IconsContainer>
      <TrashContainer>
        <Separator />
        <MinimizedTerminal
          ref={minimizedTerminalRef}
          onClick={() => setIsTerminalMinimized(false)}
        >
          {isTerminalMinimized && <img src="minimized.png" alt="" />}
        </MinimizedTerminal>
        <Button>
          <img src="./trash.png" alt="Trash" />
        </Button>
      </TrashContainer>
    </Wrapper>
  );
};

const MinimizedTerminal = styled.div`
  img {
    width: 40px;
    height: 31px;
    object-fit: cover;
    margin-right: 5px;
  }
`;
const Separator = styled.div`
  height: 100%;
  width: 1px;
  background: rgba(255, 255, 255, 0.5);
  margin-right: 10px;
`;
const BaseContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const IconsContainer = styled(BaseContainer)``;
const TrashContainer = styled(BaseContainer)``;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  height: 50px;
  width: 30%;
  padding: 7px;
  background: rgb(126 126 126 / 30%);
  backdrop-filter: blur(5px);
`;
const Button = styled.button<{ active?: boolean }>`
  position: relative;
  background: none;
  outline: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 40px;
  height: 40px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  & + & {
    margin-left: 10px;
  }
  ${({ active }) =>
    active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 3px;
      left: 44%;
    }
  `}
`;

export default Dock;
