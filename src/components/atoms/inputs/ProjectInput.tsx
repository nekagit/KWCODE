import { LabeledInput } from "@/components/shared/LabeledInput";

interface ProjectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const ProjectInput: React.FC<ProjectInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  className,
}) => {
  return (
    <LabeledInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
    />
  );
};