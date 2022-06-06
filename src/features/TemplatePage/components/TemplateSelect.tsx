import { Select } from '@fremtind/jkl-select-react';
import '@fremtind/jkl-select/select.min.css';

interface SelectOption {
  value: string;
  label: string;
}

interface TemplateSelectPicker {
  pickedTemplate: (name: string) => void;
  values: SelectOption[];
  value: string;
}

function TemplateSelect({
  value,
  pickedTemplate,
  values,
}: TemplateSelectPicker) {
  return (
    <Select
      id="produsent"
      name="produsent"
      forceCompact={false}
      variant="small"
      label="Hvilket merke er telefonen?"
      helpLabel={undefined}
      errorLabel={undefined}
      items={values}
      value={value}
      onChange={(event) => pickedTemplate(event.target.value)}
      searchable
    />
  );
}

export default TemplateSelect;
