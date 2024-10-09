import React from "react";
import Editor from "@monaco-editor/react";
import { useSocket } from "../context/SocketContext";

interface CodeEditorProps {
  selectedLanguage: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedLanguage }) => {
  const { updateCode, code, isUserMuted, lockedStatus } = useSocket();

  const handleEditorChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      updateCode(newCode);
    }
  };
  const mutedMessage = lockedStatus
    ? "Session is Locked"
    : isUserMuted
    ? "You are muted by the creator"
    : "";

  return (
    <div>
      <Editor
        height="52vh"
        language={selectedLanguage}
        value={code}
        onChange={handleEditorChange}
        options={{
          readOnly: isUserMuted || lockedStatus,
          readOnlyMessage: { value: mutedMessage },
        }}
      />
    </div>
  );
};

export default CodeEditor;
