import React, { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import commands from '../shared/commands';
import files from '../shared/files';
import useHistory from '../hooks/useHistory';

const searchForOptions = (term: string): string[] => {
  const o = Object.values(files)
    .filter((x) => x.searchText.filter((x) => x.startsWith(term)).length > 0)
    .map((x) => x.display);

  return o;
};
const Prompt: FC<{ isTerminalFocused: boolean }> = ({ isTerminalFocused }) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const commandRef = useRef<string | null>(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [tabbedResults, setTabbedResults] = useState('');
  const [keysCurrentlyPressed, setKeysCurrentlyPressed] = useState<string[]>(
    []
  );
  const {
    state: { actualCommands },
    addCommand,
    clear: clearHistory,
    getOutput,
  } = useHistory();

  const clear = () => {
    textAreaRef.current!.value = '';
    setCurrentCommand('');
    commandRef.current = '';
    clearHistory();
  };

  useEffect(() => {
    if (isTerminalFocused) {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }
  }, [isTerminalFocused]);

  useEffect(() => {
    if (
      keysCurrentlyPressed.includes('Meta') &&
      keysCurrentlyPressed.includes('k') &&
      textAreaRef.current &&
      textAreaRef.current.value === ''
    ) {
      clear();
    }
  }, [keysCurrentlyPressed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      let output = '';
      const currentCommand = commandRef.current ?? '';
      const [cmd, ...args] = currentCommand.split(' ');

      setKeysCurrentlyPressed((keys) => [
        ...keys.filter((k) => k !== key),
        key,
      ]);

      if (key === 'Tab') {
        e.preventDefault();
        if (cmd === 'ls' || cmd === 'cat') {
          const results = searchForOptions(args[0]);
          if (results.length > 1) {
            setTabbedResults(results.join(' '));
          } else {
            if (results[0]) {
              const newCommand = `${cmd} ${results[0]}`;
              setCurrentCommand(newCommand);
              commandRef.current = newCommand;
            }
          }
        }
      } else if (key === 'Enter') {
        e.preventDefault();
        if (textAreaRef.current) {
          textAreaRef.current.value = '';
        }
        if (commands[currentCommand!]) {
          const co = commands[currentCommand ?? ''];
          output = co();
        } else if (cmd === 'cat') {
          const file = args[0];
          output = files[file].content;
        }

        addCommand(commandRef.current!, output);
        setCurrentCommand('');
        commandRef.current = '';
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'Meta') {
        // blow it all away
        setKeysCurrentlyPressed([]);
      }
      setKeysCurrentlyPressed((keys) => keys.filter((k) => k !== key));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <Wrapper>
      <pre
        style={{
          background: 'white',
          position: 'absolute',
          top: '-100px',
          padding: '10px',
          borderRadius: '10px',
          fontWeight: 'bold',
          fontSize: '20px',
        }}
      >
        {keysCurrentlyPressed.join(' ')}
      </pre>
      <HiddenTextArea
        ref={textAreaRef}
        onChange={(e) => {
          commandRef.current = e.target.value;
          setCurrentCommand(e.target.value);
        }}
        onBlur={() => {
          if (isTerminalFocused && textAreaRef.current) {
            textAreaRef.current.focus();
          }
        }}
      />
      {actualCommands.map((line, i) => {
        const output = getOutput(i);
        return (
          <React.Fragment key={i}>
            <Line>
              <User>[root ~]$&nbsp;</User>
              <Input>{line}</Input>
            </Line>
            {output && <pre style={{ color: 'white' }}>{output}</pre>}
          </React.Fragment>
        );
      })}
      <Line>
        <User>[root ~]$&nbsp;</User>
        <Input>{currentCommand}</Input>
        {isTerminalFocused && <Cursor />}
      </Line>
      {tabbedResults && <pre style={{ color: 'white' }}>{tabbedResults}</pre>}
    </Wrapper>
  );
};

const Wrapper = styled.div``;
const Line = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  line-height: 25px;
`;
const User = styled.div`
  color: limegreen;
`;
const Input = styled.pre`
  color: white;
`;
const HiddenTextArea = styled.textarea`
  position: absolute;
  left: -16px;
  top: 0;
  width: 20px;
  height: 16px;
  background: transparent;
  border: none;
  color: transparent;
  outline: none;
  padding: 0;
  resize: none;
  z-index: 1;
  overflow: hidden;
  white-space: pre;
  text-indent: -9999em;
`;
const Cursor = styled.span`
  display: inline-block;
  background: #b6b6b6;
  margin-left: 2px;
  width: 12px;
  height: 22px;
`;

export default Prompt;
