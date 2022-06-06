import { RadioButton, RadioButtonGroup } from '@fremtind/jkl-radio-button-react';
import '@fremtind/jkl-radio-button/radio-button.min.css';

interface FilePickerProps {
  files: string[];
  selectedFile: string;
  setSelectedFile: (selectedFile: string) => void;
}

export default function FilePicker(props: FilePickerProps) {
  const { files, selectedFile, setSelectedFile } = props;

  return (
    <RadioButtonGroup
      style={{ display: 'flex', flexDirection: 'row', gap: '0.7rem' }}
      legend="Note Template"
      name="edit-template"
      forceCompact={false}
      labelProps={{ variant: 'small' }}
      helpLabel=""
      value={selectedFile}
      onChange={(e) => setSelectedFile(e.target.value)}
    >
      {files.map((file) => (
        <RadioButton key={file} value={file}>
          {file}
        </RadioButton>
      ))}
    </RadioButtonGroup>
  );
}
