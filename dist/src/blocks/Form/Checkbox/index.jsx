import { useFormContext } from 'react-hook-form';
import { Checkbox as CheckboxUi } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Error } from '../Error';
import { Width } from '../Width';
export const Checkbox = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
    const props = register(name, { required: requiredFromProps });
    const { setValue } = useFormContext();
    return (<Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi defaultChecked={defaultValue} id={name} {...props} onCheckedChange={(checked) => {
            setValue(props.name, checked);
        }}/>
        <Label htmlFor={name}>{label}</Label>
      </div>
      {requiredFromProps && errors[name] && <Error />}
    </Width>);
};
//# sourceMappingURL=index.jsx.map