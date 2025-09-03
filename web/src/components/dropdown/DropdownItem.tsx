import React from 'react';

type DropdownItemProps = {
  children: React.ReactNode;
  className?: string;
};

const DropdownItem: React.FC<DropdownItemProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default DropdownItem;