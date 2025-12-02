import { FC, useRef, useEffect } from "react";

interface EditableDivProps {
  value?: string;                          
  placeholder?: string;                    
  onChange?: (value: string) => void;
  className?: string;
  editable?: boolean;
}

const EditableDiv: FC<EditableDivProps> = ({
  value = "",
  placeholder = "",
  onChange = () => {},
  className = "",
  editable = true,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false); 

  useEffect(() => {
    if (!initialized.current && divRef.current) {
      divRef.current.innerText = value;
      initialized.current = true;
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    
    if (text === "<br>" || text === "<br/>" || text.trim() === "") {
      e.currentTarget.innerText = "";
      onChange?.("");
      return;
    }

    onChange(text);
  };

  return (
    <div
      ref={divRef}
      contentEditable={editable}
      onInput={handleInput}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default EditableDiv;
