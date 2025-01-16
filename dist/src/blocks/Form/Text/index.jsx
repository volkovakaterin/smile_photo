import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Error } from '../Error';
import { Width } from '../Width';
export const Text = ({ name, defaultValue, errors, label, register, required: requiredFromProps, width }) => {
    return (<Width width={width}>
      <Label htmlFor={name}>{label}</Label>
      <Input defaultValue={defaultValue} id={name} type="text" {...register(name, { required: requiredFromProps })}/>
      {requiredFromProps && errors[name] && <Error />}
    </Width>);
};
//# sourceMappingURL=index.jsx.map