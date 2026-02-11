import { LabeledInput } from "@/components/shared/LabeledInput";

interface FeatureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FeatureInput: React.FC<FeatureInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <LabeledInput
      id="feature-input"
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};